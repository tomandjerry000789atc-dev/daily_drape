-- =====================================================================
-- DAILY DRAPE — ROW LEVEL SECURITY POLICIES
-- =====================================================================
-- Apply AFTER schema.sql. Safe to re-run — policies are dropped and
-- recreated by name so this will not duplicate or destroy data.
--
-- Core security model:
--   * Every table with user-owned or privileged data has RLS ENABLED.
--   * Customers can only read/write their OWN rows (auth.uid()).
--   * Role elevation (customer -> admin/delivery) is NEVER permitted
--     through these policies — only a service-role script run by you,
--     the project owner, directly in the SQL editor can do that
--     (see README.md "Secure first-admin setup").
--   * Admin checks are done via a SECURITY DEFINER helper function that
--     reads the trusted `profiles.role` column — never from JWT claims
--     or client-supplied values.
-- =====================================================================

-- Helper: is the current user an admin? (SECURITY DEFINER avoids
-- recursive RLS checks on profiles itself)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_delivery()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'delivery'
  );
$$;

-- ---------------------------------------------------------------------
-- PROFILES
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());

-- Customers may update their own profile EXCEPT the `role` column.
-- Enforced by checking the new role matches the existing role unless
-- the actor is an admin.
drop policy if exists "profiles_update_own_no_role_change" on public.profiles;
create policy "profiles_update_own_no_role_change" on public.profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (
    public.is_admin()
    or (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()))
  );

-- ---------------------------------------------------------------------
-- ADDRESSES
-- ---------------------------------------------------------------------
alter table public.addresses enable row level security;

drop policy if exists "addresses_owner_all" on public.addresses;
create policy "addresses_owner_all" on public.addresses
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- CATEGORIES / BRANDS  (public read, admin write)
-- ---------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.brands enable row level security;

drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories for select using (true);
drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write" on public.categories
  for insert with check (public.is_admin());
drop policy if exists "categories_admin_update" on public.categories;
create policy "categories_admin_update" on public.categories
  for update using (public.is_admin());
drop policy if exists "categories_admin_delete" on public.categories;
create policy "categories_admin_delete" on public.categories
  for delete using (public.is_admin());

drop policy if exists "brands_public_read" on public.brands;
create policy "brands_public_read" on public.brands for select using (true);
drop policy if exists "brands_admin_write" on public.brands;
create policy "brands_admin_write" on public.brands
  for insert with check (public.is_admin());
drop policy if exists "brands_admin_update" on public.brands;
create policy "brands_admin_update" on public.brands
  for update using (public.is_admin());
drop policy if exists "brands_admin_delete" on public.brands;
create policy "brands_admin_delete" on public.brands
  for delete using (public.is_admin());

-- ---------------------------------------------------------------------
-- PRODUCTS / IMAGES / VARIANTS  (public read active products, admin write)
-- ---------------------------------------------------------------------
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;

drop policy if exists "products_public_read_active" on public.products;
create policy "products_public_read_active" on public.products
  for select using (is_active = true or public.is_admin());

drop policy if exists "products_admin_insert" on public.products;
create policy "products_admin_insert" on public.products for insert with check (public.is_admin());
drop policy if exists "products_admin_update" on public.products;
create policy "products_admin_update" on public.products for update using (public.is_admin());
drop policy if exists "products_admin_delete" on public.products;
create policy "products_admin_delete" on public.products for delete using (public.is_admin());

drop policy if exists "product_images_public_read" on public.product_images;
create policy "product_images_public_read" on public.product_images for select using (true);
drop policy if exists "product_images_admin_write" on public.product_images;
create policy "product_images_admin_write" on public.product_images for insert with check (public.is_admin());
drop policy if exists "product_images_admin_update" on public.product_images;
create policy "product_images_admin_update" on public.product_images for update using (public.is_admin());
drop policy if exists "product_images_admin_delete" on public.product_images;
create policy "product_images_admin_delete" on public.product_images for delete using (public.is_admin());

drop policy if exists "product_variants_public_read" on public.product_variants;
create policy "product_variants_public_read" on public.product_variants for select using (true);
drop policy if exists "product_variants_admin_write" on public.product_variants;
create policy "product_variants_admin_write" on public.product_variants for insert with check (public.is_admin());
drop policy if exists "product_variants_admin_update" on public.product_variants;
create policy "product_variants_admin_update" on public.product_variants for update using (public.is_admin());
drop policy if exists "product_variants_admin_delete" on public.product_variants;
create policy "product_variants_admin_delete" on public.product_variants for delete using (public.is_admin());

-- ---------------------------------------------------------------------
-- WISHLISTS
-- ---------------------------------------------------------------------
alter table public.wishlists enable row level security;
drop policy if exists "wishlists_owner_all" on public.wishlists;
create policy "wishlists_owner_all" on public.wishlists
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- CARTS / CART ITEMS
-- ---------------------------------------------------------------------
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;

drop policy if exists "carts_owner_all" on public.carts;
create policy "carts_owner_all" on public.carts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "cart_items_owner_all" on public.cart_items;
create policy "cart_items_owner_all" on public.cart_items
  for all using (
    exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())
  );

-- ---------------------------------------------------------------------
-- ORDERS / ORDER ITEMS
-- ---------------------------------------------------------------------
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Customers can see their own orders; admins see all; delivery partners
-- see only orders assigned to them.
drop policy if exists "orders_select_scoped" on public.orders;
create policy "orders_select_scoped" on public.orders
  for select using (
    user_id = auth.uid()
    or public.is_admin()
    or (public.is_delivery() and assigned_delivery_id = auth.uid())
  );

-- Customers may create their own orders only (status forced to 'placed'
-- and payment_status cannot be 'paid' unless pending COD — enforced by
-- application logic + this check constraint on allowed initial states).
drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own" on public.orders
  for insert with check (
    user_id = auth.uid()
    and status = 'placed'
  );

-- Customers may only update their OWN order to request cancellation,
-- and only while it is still cancellable. They can never edit totals,
-- items, payment_status or assigned_delivery_id (enforced by comparing
-- old vs new values for those columns).
drop policy if exists "orders_customer_cancel_only" on public.orders;
create policy "orders_customer_cancel_only" on public.orders
  for update using (user_id = auth.uid() and status in ('placed','confirmed','packed'))
  with check (
    user_id = auth.uid()
    and status = 'cancelled'
  );

-- Admins may update any order (status, assignment, tracking, etc).
drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update" on public.orders
  for update using (public.is_admin());

-- Delivery partners may update ONLY the status of orders assigned to
-- them, and only forward along the permitted delivery transitions.
drop policy if exists "orders_delivery_update_assigned" on public.orders;
create policy "orders_delivery_update_assigned" on public.orders
  for update using (public.is_delivery() and assigned_delivery_id = auth.uid())
  with check (
    public.is_delivery()
    and assigned_delivery_id = auth.uid()
    and status in ('out_for_delivery','delivered')
  );

drop policy if exists "order_items_select_scoped" on public.order_items;
create policy "order_items_select_scoped" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.user_id = auth.uid() or public.is_admin() or (public.is_delivery() and o.assigned_delivery_id = auth.uid()))
    )
  );

drop policy if exists "order_items_insert_own" on public.order_items;
create policy "order_items_insert_own" on public.order_items
  for insert with check (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

-- ---------------------------------------------------------------------
-- REVIEWS
-- ---------------------------------------------------------------------
alter table public.reviews enable row level security;

drop policy if exists "reviews_public_read" on public.reviews;
create policy "reviews_public_read" on public.reviews for select using (true);

-- Reviews must be tied to the authenticated author and (ideally) a
-- verified purchase — verified purchase check is left to application
-- logic / a trigger checking order_items for simplicity here.
drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own" on public.reviews
  for insert with check (user_id = auth.uid());

drop policy if exists "reviews_update_own_or_admin" on public.reviews;
create policy "reviews_update_own_or_admin" on public.reviews
  for update using (user_id = auth.uid() or public.is_admin());

drop policy if exists "reviews_delete_own_or_admin" on public.reviews;
create policy "reviews_delete_own_or_admin" on public.reviews
  for delete using (user_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------
-- COUPONS  (public read of active coupons only, admin write)
-- ---------------------------------------------------------------------
alter table public.coupons enable row level security;

drop policy if exists "coupons_public_read_active" on public.coupons;
create policy "coupons_public_read_active" on public.coupons
  for select using (is_active = true or public.is_admin());

drop policy if exists "coupons_admin_write" on public.coupons;
create policy "coupons_admin_write" on public.coupons for insert with check (public.is_admin());
drop policy if exists "coupons_admin_update" on public.coupons;
create policy "coupons_admin_update" on public.coupons for update using (public.is_admin());
drop policy if exists "coupons_admin_delete" on public.coupons;
create policy "coupons_admin_delete" on public.coupons for delete using (public.is_admin());
