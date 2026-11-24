-- Row Level Security for every table.

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.banners enable row level security;
alter table public.cities enable row level security;
alter table public.addresses enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlists enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;

-- ───────────── Profiles: own row; admins read all. Role column is not user-writable. ─────────────
create policy "profiles: read own or admin" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

create policy "profiles: update own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

revoke update on public.profiles from authenticated, anon;
grant update (full_name, phone) on public.profiles to authenticated;

-- ───────────── Public catalogue: everyone reads active rows; admins write. ─────────────
create policy "categories: public read" on public.categories
  for select to anon, authenticated
  using (is_active or (select public.is_admin()));
create policy "categories: admin write" on public.categories
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "brands: public read" on public.brands
  for select to anon, authenticated
  using (is_active or (select public.is_admin()));
create policy "brands: admin write" on public.brands
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "products: public read" on public.products
  for select to anon, authenticated
  using (is_active or (select public.is_admin()));
create policy "products: admin write" on public.products
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "product_images: public read" on public.product_images
  for select to anon, authenticated
  using (true);
create policy "product_images: admin write" on public.product_images
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "banners: public read" on public.banners
  for select to anon, authenticated
  using (is_active or (select public.is_admin()));
create policy "banners: admin write" on public.banners
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "cities: public read" on public.cities
  for select to anon, authenticated
  using (is_active or (select public.is_admin()));
create policy "cities: admin write" on public.cities
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ───────────── Per-user data ─────────────
create policy "addresses: own" on public.addresses
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "carts: own" on public.carts
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "cart_items: own" on public.cart_items
  for all to authenticated
  using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = (select auth.uid())))
  with check (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = (select auth.uid())));

create policy "wishlists: own" on public.wishlists
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- ───────────── Coupons: admins only. Customers validate codes through validate_coupon(). ─────────────
create policy "coupons: admin" on public.coupons
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ───────────── Orders: created only through place_order(). Users read their own; admins read and update all. ─────────────
create policy "orders: read own or admin" on public.orders
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "orders: admin update" on public.orders
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "order_items: read own or admin" on public.order_items
  for select to authenticated
  using (
    (select public.is_admin())
    or exists (select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid()))
  );

-- ───────────── Reviews: public read; only buyers of a delivered order may write. ─────────────
create policy "reviews: public read" on public.reviews
  for select to anon, authenticated
  using (true);
create policy "reviews: buyers insert" on public.reviews
  for insert to authenticated
  with check (user_id = (select auth.uid()) and public.has_purchased(product_id));
create policy "reviews: own update" on public.reviews
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "reviews: own or admin delete" on public.reviews
  for delete to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

-- ───────────── Storage: one public bucket for product, banner and brand images. Admin uploads only. ─────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do nothing;

create policy "media: public read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'media');
create policy "media: admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and (select public.is_admin()));
create policy "media: admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
create policy "media: admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
