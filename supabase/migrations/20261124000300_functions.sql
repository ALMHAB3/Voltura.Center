-- Business logic: search, coupons, ordering, tracking, reporting.

-- ───────────── Search (Arabic + English, typo tolerant) ─────────────
create or replace function public.search_products(p_query text, p_limit integer default 8)
returns setof public.products
language sql
stable
set search_path = ''
as $$
  with q as (select public.normalize_search(trim(p_query)) as term)
  select p.*
  from public.products p, q
  where p.is_active
    and length(q.term) >= 2
    and (
      p.search_text like '%' || q.term || '%'
      or extensions.word_similarity(q.term, p.search_text) > 0.4
    )
  order by (p.search_text like '%' || q.term || '%') desc,
           extensions.word_similarity(q.term, p.search_text) desc,
           p.sold_count desc
  limit least(greatest(p_limit, 1), 50);
$$;

-- ───────────── Coupons ─────────────
-- Returns the discount a code gives on a subtotal (already after product discounts).
create or replace function public.coupon_discount_for(p_coupon public.coupons, p_subtotal integer)
returns integer
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_discount integer;
begin
  if p_coupon.type = 'percent' then
    v_discount := floor(p_subtotal * p_coupon.value / 100.0)::integer;
  else
    v_discount := p_coupon.value;
  end if;
  if p_coupon.max_discount is not null then
    v_discount := least(v_discount, p_coupon.max_discount);
  end if;
  return greatest(0, least(v_discount, p_subtotal));
end;
$$;

create or replace function public.validate_coupon(p_code text, p_subtotal integer)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  c public.coupons;
begin
  select * into c from public.coupons where code = upper(trim(p_code));
  if not found or not c.is_active then
    return jsonb_build_object('valid', false, 'message', 'كود الخصم غير صحيح');
  end if;
  if c.starts_at is not null and now() < c.starts_at then
    return jsonb_build_object('valid', false, 'message', 'كود الخصم لم يبدأ بعد');
  end if;
  if c.expires_at is not null and now() > c.expires_at then
    return jsonb_build_object('valid', false, 'message', 'انتهت صلاحية كود الخصم');
  end if;
  if c.usage_limit is not null and c.used_count >= c.usage_limit then
    return jsonb_build_object('valid', false, 'message', 'تم استخدام كود الخصم بالكامل');
  end if;
  if p_subtotal < c.min_subtotal then
    return jsonb_build_object('valid', false, 'message', 'الحد الأدنى للطلب لاستخدام هذا الكود ' || c.min_subtotal || ' د.ل');
  end if;
  return jsonb_build_object(
    'valid', true,
    'code', c.code,
    'discount', public.coupon_discount_for(c, p_subtotal),
    'message', 'تم تطبيق كود الخصم'
  );
end;
$$;

-- ───────────── Place order (single transaction) ─────────────
-- Prices, discounts, coupon and delivery fee are all recomputed here; nothing from the browser is trusted
-- except product ids and quantities.
create or replace function public.place_order(
  p_items jsonb,
  p_customer_name text,
  p_phone text,
  p_city_id bigint,
  p_address text,
  p_payment_method public.payment_method,
  p_notes text default null,
  p_coupon_code text default null
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_item record;
  v_product public.products;
  v_city public.cities;
  v_coupon public.coupons;
  v_order_id uuid;
  v_order_number text;
  v_subtotal integer := 0;
  v_sale_total integer := 0;
  v_cost_total integer := 0;
  v_coupon_discount integer := 0;
  v_total integer;
  v_count integer;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'السلة فارغة';
  end if;
  if jsonb_array_length(p_items) > 50 then
    raise exception 'عدد المنتجات في الطلب كبير جداً';
  end if;
  if coalesce(trim(p_customer_name), '') = '' or coalesce(trim(p_phone), '') = '' or coalesce(trim(p_address), '') = '' then
    raise exception 'الرجاء إكمال بيانات التوصيل';
  end if;

  select * into v_city from public.cities where id = p_city_id and is_active;
  if not found then
    raise exception 'المدينة المختارة غير متاحة للتوصيل';
  end if;

  -- Aggregate duplicate lines, validate quantities.
  create temporary table if not exists pg_temp._order_lines (product_id bigint primary key, quantity integer) on commit drop;
  truncate pg_temp._order_lines;
  insert into pg_temp._order_lines (product_id, quantity)
  select (e ->> 'product_id')::bigint, sum((e ->> 'quantity')::integer)
  from jsonb_array_elements(p_items) e
  group by 1;

  if exists (select 1 from pg_temp._order_lines where quantity is null or quantity < 1 or quantity > 99) then
    raise exception 'كمية غير صالحة';
  end if;

  -- Lock products in a stable order to avoid deadlocks, then check stock.
  for v_item in select * from pg_temp._order_lines order by product_id loop
    select * into v_product from public.products where id = v_item.product_id for update;
    if not found or not v_product.is_active then
      raise exception 'أحد المنتجات لم يعد متوفراً';
    end if;
    if v_product.stock < v_item.quantity then
      raise exception 'الكمية المطلوبة من "%" غير متوفرة (المتوفر: %)', v_product.name, v_product.stock;
    end if;
    v_subtotal := v_subtotal + v_product.price * v_item.quantity;
    v_sale_total := v_sale_total + v_product.sale_price * v_item.quantity;
    v_cost_total := v_cost_total + coalesce(v_product.cost_price, 0) * v_item.quantity;
  end loop;

  -- Coupon (locked so usage_limit cannot be exceeded by concurrent orders).
  if coalesce(trim(p_coupon_code), '') <> '' then
    select * into v_coupon from public.coupons where code = upper(trim(p_coupon_code)) for update;
    if not found or not v_coupon.is_active
       or (v_coupon.starts_at is not null and now() < v_coupon.starts_at)
       or (v_coupon.expires_at is not null and now() > v_coupon.expires_at)
       or (v_coupon.usage_limit is not null and v_coupon.used_count >= v_coupon.usage_limit)
       or v_sale_total < v_coupon.min_subtotal then
      raise exception 'كود الخصم غير صالح لهذا الطلب';
    end if;
    v_coupon_discount := public.coupon_discount_for(v_coupon, v_sale_total);
    update public.coupons set used_count = used_count + 1 where id = v_coupon.id;
  end if;

  v_total := v_sale_total - v_coupon_discount + v_city.delivery_fee;

  insert into public.orders (
    user_id, payment_method, customer_name, phone, city_id, city_name, address, notes,
    subtotal, product_discount, coupon_id, coupon_code, coupon_discount, delivery_fee, total, cost_total
  ) values (
    v_user, p_payment_method, trim(p_customer_name), trim(p_phone), v_city.id, v_city.name, trim(p_address),
    nullif(trim(coalesce(p_notes, '')), ''),
    v_subtotal, v_subtotal - v_sale_total, v_coupon.id, v_coupon.code, v_coupon_discount, v_city.delivery_fee,
    v_total, v_cost_total
  )
  returning id, order_number into v_order_id, v_order_number;

  insert into public.order_items (
    order_id, product_id, product_name, product_slug, image_path,
    unit_price, unit_sale_price, unit_cost, quantity, line_total
  )
  select v_order_id, p.id, p.name, p.slug,
         (select pi.path from public.product_images pi where pi.product_id = p.id order by pi.sort_order, pi.id limit 1),
         p.price, p.sale_price, coalesce(p.cost_price, 0), l.quantity, p.sale_price * l.quantity
  from pg_temp._order_lines l
  join public.products p on p.id = l.product_id;

  update public.products p
  set stock = p.stock - l.quantity,
      sold_count = p.sold_count + l.quantity
  from pg_temp._order_lines l
  where p.id = l.product_id;

  get diagnostics v_count = row_count;

  -- Empty the signed-in customer's saved cart.
  if v_user is not null then
    delete from public.cart_items ci
    using public.carts c
    where ci.cart_id = c.id and c.user_id = v_user;
  end if;

  return jsonb_build_object('id', v_order_id, 'order_number', v_order_number, 'total', v_total, 'items', v_count);
end;
$$;

-- ───────────── Public order lookup by number + phone (guest tracking & confirmation page) ─────────────
create or replace function public.track_order(p_order_number text, p_phone text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'order_number', o.order_number,
    'status', o.status,
    'payment_method', o.payment_method,
    'customer_name', o.customer_name,
    'city_name', o.city_name,
    'address', o.address,
    'subtotal', o.subtotal,
    'product_discount', o.product_discount,
    'coupon_discount', o.coupon_discount,
    'delivery_fee', o.delivery_fee,
    'total', o.total,
    'created_at', o.created_at,
    'items', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'name', oi.product_name, 'slug', oi.product_slug, 'image', oi.image_path,
        'quantity', oi.quantity, 'unit_sale_price', oi.unit_sale_price, 'line_total', oi.line_total
      ) order by oi.id), '[]'::jsonb)
      from public.order_items oi where oi.order_id = o.id
    )
  )
  from public.orders o
  where upper(o.order_number) = upper(trim(p_order_number))
    and regexp_replace(o.phone, '\D', '', 'g') like '%' || right(regexp_replace(p_phone, '\D', '', 'g'), 9)
    and length(regexp_replace(p_phone, '\D', '', 'g')) >= 9;
$$;

-- Confirmation page lookup. The order id is a random UUID only the buyer receives.
create or replace function public.get_order_by_id(p_order_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select public.track_order(o.order_number, o.phone)
  from public.orders o
  where o.id = p_order_id;
$$;

-- ───────────── Stock is returned when an order is cancelled (and taken again if un-cancelled) ─────────────
create or replace function public.handle_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    update public.products p
    set stock = p.stock + oi.quantity,
        sold_count = greatest(0, p.sold_count - oi.quantity)
    from public.order_items oi
    where oi.order_id = new.id and oi.product_id = p.id;
    if new.coupon_id is not null then
      update public.coupons set used_count = greatest(0, used_count - 1) where id = new.coupon_id;
    end if;
  elsif old.status = 'cancelled' and new.status <> 'cancelled' then
    update public.products p
    set stock = p.stock - oi.quantity,
        sold_count = p.sold_count + oi.quantity
    from public.order_items oi
    where oi.order_id = new.id and oi.product_id = p.id;
  end if;
  return new;
end;
$$;

create trigger orders_status_change
  after update of status on public.orders
  for each row
  when (old.status is distinct from new.status)
  execute function public.handle_order_status_change();

-- Only status, tracking and notes may change after an order is placed (even for admins).
create or replace function public.guard_order_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (new.total, new.subtotal, new.product_discount, new.coupon_discount, new.delivery_fee, new.cost_total, new.user_id, new.order_number)
     is distinct from
     (old.total, old.subtotal, old.product_discount, old.coupon_discount, old.delivery_fee, old.cost_total, old.user_id, old.order_number) then
    raise exception 'لا يمكن تعديل مبالغ الطلب بعد إنشائه';
  end if;
  return new;
end;
$$;

create trigger orders_guard_update
  before update on public.orders
  for each row execute function public.guard_order_update();

-- ───────────── Admin report: sales, profit and discounts over a date range ─────────────
create or replace function public.admin_report(p_from date, p_to date)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if not public.is_admin() then
    raise exception 'غير مصرح';
  end if;

  with o as (
    select * from public.orders
    where created_at >= p_from::timestamptz
      and created_at < (p_to + 1)::timestamptz
      and status <> 'cancelled'
  )
  select jsonb_build_object(
    'orders_count', (select count(*) from o),
    'cancelled_count', (select count(*) from public.orders
                        where status = 'cancelled' and created_at >= p_from::timestamptz and created_at < (p_to + 1)::timestamptz),
    'items_sold', (select coalesce(sum(oi.quantity), 0) from public.order_items oi join o on o.id = oi.order_id),
    'gross_sales', (select coalesce(sum(subtotal), 0) from o),
    'product_discounts', (select coalesce(sum(product_discount), 0) from o),
    'coupon_discounts', (select coalesce(sum(coupon_discount), 0) from o),
    'net_sales', (select coalesce(sum(subtotal - product_discount - coupon_discount), 0) from o),
    'delivery_fees', (select coalesce(sum(delivery_fee), 0) from o),
    'cost', (select coalesce(sum(cost_total), 0) from o),
    'profit', (select coalesce(sum(subtotal - product_discount - coupon_discount - cost_total), 0) from o),
    'collected', (select coalesce(sum(total), 0) from o),
    'by_day', (
      select coalesce(jsonb_agg(d order by d ->> 'day'), '[]'::jsonb) from (
        select jsonb_build_object(
          'day', to_char(created_at at time zone 'Africa/Tripoli', 'YYYY-MM-DD'),
          'orders', count(*),
          'net_sales', sum(subtotal - product_discount - coupon_discount),
          'profit', sum(subtotal - product_discount - coupon_discount - cost_total)
        ) d
        from o group by to_char(created_at at time zone 'Africa/Tripoli', 'YYYY-MM-DD')
      ) x
    ),
    'by_payment', (
      select coalesce(jsonb_object_agg(payment_method, cnt), '{}'::jsonb)
      from (select payment_method, count(*) cnt from o group by payment_method) x
    ),
    'top_products', (
      select coalesce(jsonb_agg(t order by (t ->> 'quantity')::int desc), '[]'::jsonb) from (
        select jsonb_build_object(
          'name', oi.product_name,
          'quantity', sum(oi.quantity),
          'revenue', sum(oi.line_total),
          'profit', sum(oi.line_total - oi.unit_cost * oi.quantity),
          'discount', sum((oi.unit_price - oi.unit_sale_price) * oi.quantity)
        ) t
        from public.order_items oi join o on o.id = oi.order_id
        group by oi.product_name
        order by sum(oi.quantity) desc
        limit 10
      ) x
    )
  ) into v_result;

  return v_result;
end;
$$;

-- ───────────── Grants ─────────────
revoke execute on function public.admin_report(date, date) from public, anon;
grant execute on function public.admin_report(date, date) to authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.refresh_product_rating() from public, anon, authenticated;
revoke execute on function public.set_review_author() from public, anon, authenticated;
revoke execute on function public.handle_order_status_change() from public, anon, authenticated;
grant execute on function public.place_order(jsonb, text, text, bigint, text, public.payment_method, text, text) to anon, authenticated;
grant execute on function public.track_order(text, text) to anon, authenticated;
grant execute on function public.get_order_by_id(uuid) to anon, authenticated;
grant execute on function public.validate_coupon(text, integer) to anon, authenticated;
grant execute on function public.search_products(text, integer) to anon, authenticated;
