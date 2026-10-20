-- =====================================================================
-- DAILY DRAPE — STORAGE BUCKET SETUP (product images)
-- =====================================================================
-- Run in the Supabase SQL editor AFTER schema.sql + policies.sql.
-- Creates a public-read bucket for product imagery with admin-only
-- write access. If you prefer, you can instead create the bucket via
-- Dashboard > Storage > New Bucket (name: "product-images", Public: ON)
-- and then just run the two policy blocks below.
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Public read access to product images (anyone can view/shop)
drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read" on storage.objects
  for select using (bucket_id = 'product-images');

-- Only admins (per profiles.role) may upload/update/delete images
drop policy if exists "product_images_admin_insert" on storage.objects;
create policy "product_images_admin_insert" on storage.objects
  for insert with check (
    bucket_id = 'product-images' and public.is_admin()
  );

drop policy if exists "product_images_admin_update" on storage.objects;
create policy "product_images_admin_update" on storage.objects
  for update using (
    bucket_id = 'product-images' and public.is_admin()
  );

drop policy if exists "product_images_admin_delete" on storage.objects;
create policy "product_images_admin_delete" on storage.objects
  for delete using (
    bucket_id = 'product-images' and public.is_admin()
  );

-- Optional: a private bucket for user-uploaded content (e.g. review
-- photos) scoped to each uploader's own folder (storage path must start
-- with their user id, e.g. `${auth.uid()}/photo.jpg`).
insert into storage.buckets (id, name, public)
values ('user-uploads', 'user-uploads', false)
on conflict (id) do nothing;

drop policy if exists "user_uploads_owner_read" on storage.objects;
create policy "user_uploads_owner_read" on storage.objects
  for select using (
    bucket_id = 'user-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "user_uploads_owner_write" on storage.objects;
create policy "user_uploads_owner_write" on storage.objects
  for insert with check (
    bucket_id = 'user-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
