-- Voltura Center: core schema
-- Prices are whole Libyan dinars (integer). No fractional amounts anywhere.

create extension if not exists pg_trgm with schema extensions;

-- ───────────────────────── Types ─────────────────────────
create type public.user_role as enum ('customer', 'admin');
create type public.order_status as enum ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');
create type public.payment_method as enum ('cash', 'bank_transfer', 'onepay', 'lypay');
create type public.coupon_type as enum ('percent', 'fixed');

-- ───────────────────────── Helpers ─────────────────────────

-- Discounted price rounded UP to the next multiple of 5 (88 -> 90, 72 -> 75, 85 -> 85).
-- Never returns more than the original price.
create or replace function public.discounted_price(p_price integer, p_percent integer)
returns integer
language sql
immutable
parallel safe
set search_path = ''
as $$
  select case
    when p_percent is null or p_percent <= 0 then p_price
    else least(p_price, (ceil((p_price * (100 - p_percent))::numeric / 100 / 5) * 5)::integer)
  end;
$$;

-- Arabic-aware normalisation for search: unify alef forms, taa marbuta, alef maqsura, strip tatweel/diacritics.
create or replace function public.normalize_search(p_text text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select lower(
    regexp_replace(
      translate(coalesce(p_text, ''), 'أإآٱةىـ', 'اااايهي'),
      '[ً-ْ]', '', 'g'
    )
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ───────────────────────── Profiles ─────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Role check used by RLS policies. SECURITY DEFINER avoids recursive RLS on profiles.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- Create a profile automatically for every new auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────────────────────── Catalogue ─────────────────────────
create table public.categories (
  id bigint generated always as identity primary key,
  parent_id bigint references public.categories (id) on delete set null,
  name text not null,
  slug text not null unique,
  icon text not null default 'box',
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint categories_not_own_parent check (parent_id is null or parent_id <> id)
);
create index categories_parent_idx on public.categories (parent_id);

create table public.brands (
  id bigint generated always as identity primary key,
  name text not null,
  slug text not null unique,
  logo_path text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.products (
  id bigint generated always as identity primary key,
  category_id bigint references public.categories (id) on delete set null,
  brand_id bigint references public.brands (id) on delete set null,
  name text not null,
  slug text not null unique,
  sku text unique,
  description text,
  price integer not null check (price > 0),
  discount_percent smallint not null default 0 check (discount_percent between 0 and 90),
  sale_price integer generated always as (public.discounted_price(price, discount_percent)) stored,
  cost_price integer check (cost_price is null or cost_price >= 0),
  stock integer not null default 0 check (stock >= 0),
  specs jsonb not null default '{}'::jsonb,
  warranty_months smallint not null default 0,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  offer_ends_at timestamptz,
  sold_count integer not null default 0,
  rating_avg numeric(2, 1) not null default 0,
  rating_count integer not null default 0,
  search_text text generated always as (public.normalize_search(name || ' ' || coalesce(sku, ''))) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

create index products_category_idx on public.products (category_id);
create index products_brand_idx on public.products (brand_id);
create index products_active_created_idx on public.products (is_active, created_at desc);
create index products_featured_idx on public.products (is_featured) where is_featured and is_active;
create index products_discount_idx on public.products (discount_percent) where discount_percent > 0;
create index products_sale_price_idx on public.products (sale_price);
create index products_search_trgm_idx on public.products using gin (search_text extensions.gin_trgm_ops);
create index products_specs_idx on public.products using gin (specs jsonb_path_ops);

create table public.product_images (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products (id) on delete cascade,
  path text not null,
  alt text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index product_images_product_idx on public.product_images (product_id, sort_order);

create table public.banners (
  id bigint generated always as identity primary key,
  title text not null,
  subtitle text,
  image_path text not null,
  link_url text,
  button_label text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ───────────────────────── Delivery ─────────────────────────
create table public.cities (
  id bigint generated always as identity primary key,
  name text not null unique,
  delivery_fee integer not null default 0 check (delivery_fee >= 0),
  delivery_days text,
  vanex_city_id integer,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

create table public.addresses (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  label text not null default 'المنزل',
  recipient_name text not null,
  phone text not null,
  city_id bigint not null references public.cities (id),
  details text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index addresses_user_idx on public.addresses (user_id);
create index addresses_city_idx on public.addresses (city_id);

-- ───────────────────────── Cart & wishlist ─────────────────────────
create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  updated_at timestamptz not null default now()
);

create table public.cart_items (
  cart_id uuid not null references public.carts (id) on delete cascade,
  product_id bigint not null references public.products (id) on delete cascade,
  quantity integer not null check (quantity between 1 and 99),
  created_at timestamptz not null default now(),
  primary key (cart_id, product_id)
);
create index cart_items_product_idx on public.cart_items (product_id);

create table public.wishlists (
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id bigint not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);
create index wishlists_product_idx on public.wishlists (product_id);

-- ───────────────────────── Coupons ─────────────────────────
create table public.coupons (
  id bigint generated always as identity primary key,
  code text not null unique check (code = upper(code)),
  type public.coupon_type not null,
  value integer not null check (value > 0),
  min_subtotal integer not null default 0,
  max_discount integer,
  usage_limit integer,
  used_count integer not null default 0,
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint coupons_percent_range check (type <> 'percent' or value <= 90)
);

-- ───────────────────────── Orders ─────────────────────────
create sequence public.order_number_seq start 1001;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('VC-' || nextval('public.order_number_seq')),
  user_id uuid references public.profiles (id) on delete set null,
  status public.order_status not null default 'pending',
  payment_method public.payment_method not null,
  customer_name text not null,
  phone text not null,
  city_id bigint references public.cities (id),
  city_name text not null,
  address text not null,
  notes text,
  subtotal integer not null,            -- sum of original prices
  product_discount integer not null,    -- savings from product discounts
  coupon_id bigint references public.coupons (id) on delete set null,
  coupon_code text,
  coupon_discount integer not null default 0,
  delivery_fee integer not null default 0,
  total integer not null,
  cost_total integer not null default 0,
  vanex_tracking text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

create index orders_user_created_idx on public.orders (user_id, created_at desc);
create index orders_status_created_idx on public.orders (status, created_at desc);
create index orders_created_idx on public.orders (created_at desc);
create index orders_phone_idx on public.orders (phone);
create index orders_coupon_idx on public.orders (coupon_id);
create index orders_city_idx on public.orders (city_id);

create table public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id bigint references public.products (id) on delete set null,
  product_name text not null,
  product_slug text,
  image_path text,
  unit_price integer not null,       -- original price at order time
  unit_sale_price integer not null,  -- price actually charged per unit
  unit_cost integer not null default 0,
  quantity integer not null check (quantity > 0),
  line_total integer not null
);
create index order_items_order_idx on public.order_items (order_id);
create index order_items_product_idx on public.order_items (product_id);

-- ───────────────────────── Reviews ─────────────────────────
create table public.reviews (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  author_name text not null default 'عميل',
  comment text check (char_length(comment) <= 1000),
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);
create index reviews_product_idx on public.reviews (product_id, created_at desc);
create index reviews_user_idx on public.reviews (user_id);

-- Reviewer display name comes from the profile (profiles are private, reviews are public).
create or replace function public.set_review_author()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select coalesce(nullif(split_part(trim(full_name), ' ', 1), ''), 'عميل')
    into new.author_name
  from public.profiles where id = new.user_id;
  new.author_name := coalesce(new.author_name, 'عميل');
  return new;
end;
$$;

create trigger reviews_set_author
  before insert or update of user_id on public.reviews
  for each row execute function public.set_review_author();

-- True when the current user has a delivered order containing the product.
create or replace function public.has_purchased(p_product_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.order_items oi
    join public.orders o on o.id = oi.order_id
    where oi.product_id = p_product_id
      and o.user_id = (select auth.uid())
      and o.status = 'delivered'
  );
$$;

-- Keep product rating aggregates in sync.
create or replace function public.refresh_product_rating()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_product bigint := coalesce(new.product_id, old.product_id);
begin
  update public.products p
  set rating_avg = coalesce((select round(avg(rating)::numeric, 1) from public.reviews where product_id = v_product), 0),
      rating_count = (select count(*) from public.reviews where product_id = v_product)
  where p.id = v_product;
  return null;
end;
$$;

create trigger reviews_refresh_rating
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_product_rating();
