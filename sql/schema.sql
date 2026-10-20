-- =====================================================================
-- DAILY DRAPE — DATABASE SCHEMA
-- =====================================================================
-- Apply this FIRST, in the Supabase SQL Editor (Project > SQL Editor).
-- Safe to re-run: every statement uses IF NOT EXISTS / OR REPLACE so it
-- will not destroy existing objects or data.
--
-- Order of application:
--   1. schema.sql    (this file)
--   2. policies.sql  (Row Level Security)
--   3. seed.sql      (optional sample data)
--   4. storage.sql   (Storage buckets + policies)
-- =====================================================================

create extension if not exists "pgcrypto"; -- for gen_random_uuid()

-- ---------------------------------------------------------------------
-- ROLES
-- ---------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('customer', 'admin', 'delivery');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum (
    'placed', 'confirmed', 'packed', 'shipped',
    'out_for_delivery', 'delivered', 'cancelled'
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- PROFILES  (1:1 with auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  email text,
  role user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger: auto-create a profile row whenever a new auth user signs up,
-- copying full_name/phone from signUp() metadata. Role always defaults
-- to 'customer' here — it can ONLY be changed later by an admin running
-- a manual, audited SQL update (see README "Secure admin creation").
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, email, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    new.email,
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------
-- ADDRESSES
-- ---------------------------------------------------------------------
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Home',
  full_name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  pincode text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_addresses_user on public.addresses(user_id);

-- ---------------------------------------------------------------------
-- CATEGORIES / BRANDS
-- ---------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  image text,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- PRODUCTS
-- ---------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  brand_id uuid references public.brands(id) on delete set null,
  brand text, -- denormalized convenience column used by the frontend
  category_id uuid references public.categories(id) on delete set null,
  category text, -- denormalized category slug
  subcategory text,
  description text,
  material_care text,
  price numeric(10,2) not null check (price >= 0),
  mrp numeric(10,2) not null check (mrp >= 0),
  image_url text,
  rating numeric(2,1) not null default 0,
  rating_count integer not null default 0,
  tags text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_active on public.products(is_active);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  sort_order integer not null default 0
);
create index if not exists idx_product_images_product on public.product_images(product_id);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null,
  color text not null,
  color_hex text default '#7c3f58',
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  sku text unique,
  created_at timestamptz not null default now()
);
create index if not exists idx_product_variants_product on public.product_variants(product_id);

-- ---------------------------------------------------------------------
-- WISHLISTS
-- ---------------------------------------------------------------------
create table if not exists public.wishlists (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- ---------------------------------------------------------------------
-- CARTS / CART ITEMS  (server-persisted cart, optional — the frontend
-- can also operate purely from localStorage for guests)
-- ---------------------------------------------------------------------
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (cart_id, variant_id)
);

-- ---------------------------------------------------------------------
-- ORDERS / ORDER ITEMS
-- ---------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  subtotal numeric(10,2) not null check (subtotal >= 0),
  discount numeric(10,2) not null default 0 check (discount >= 0),
  shipping numeric(10,2) not null default 0 check (shipping >= 0),
  total numeric(10,2) not null check (total >= 0),
  coupon_code text,
  payment_method text not null check (payment_method in ('cod','demo_card','demo_upi')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed')),
  status order_status not null default 'placed',
  status_history jsonb not null default '[]',
  address jsonb not null,
  items jsonb not null, -- denormalized snapshot for simple demo reads
  tracking_number text,
  assigned_delivery_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_delivery on public.orders(assigned_delivery_id);
create index if not exists idx_orders_status on public.orders(status);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  name text not null,
  image text,
  size text,
  color text,
  price numeric(10,2) not null check (price >= 0),
  quantity integer not null check (quantity > 0)
);
create index if not exists idx_order_items_order on public.order_items(order_id);

-- ---------------------------------------------------------------------
-- REVIEWS
-- ---------------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_name text not null,
  rating integer not null check (rating between 1 and 5),
  title text,
  comment text not null,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);
create index if not exists idx_reviews_product on public.reviews(product_id);

-- ---------------------------------------------------------------------
-- COUPONS
-- ---------------------------------------------------------------------
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type text not null check (type in ('percent','flat')),
  value numeric(10,2) not null check (value > 0),
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- TRUSTED ORDER TOTAL VALIDATION FUNCTION
-- ---------------------------------------------------------------------
-- Recomputes an order's subtotal from the authoritative `products` table
-- rather than trusting client-submitted numbers. Call this from an Edge
-- Function or a BEFORE INSERT trigger in a production deployment.
create or replace function public.recalculate_order_item_total(p_product_id uuid, p_quantity integer)
returns numeric
language sql
stable
as $$
  select coalesce((select price from public.products where id = p_product_id), 0) * p_quantity;
$$;

-- updated_at maintenance trigger helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at before update on public.products
  for each row execute procedure public.set_updated_at();

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at before update on public.orders
  for each row execute procedure public.set_updated_at();

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();
