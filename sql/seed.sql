-- =====================================================================
-- DAILY DRAPE — OPTIONAL SAMPLE DATA
-- =====================================================================
-- Apply AFTER schema.sql and policies.sql if you want to see real rows
-- in the storefront instead of the built-in frontend demo data. Safe to
-- re-run: categories/brands are upserted by slug, products by slug.
-- =====================================================================

insert into public.categories (name, slug, image, description) values
  ('Women', 'women', 'https://images.pexels.com/photos/29172779/pexels-photo-29172779.jpeg', 'Sarees, kurtas, dresses & ethnic wear'),
  ('Men', 'men', 'https://images.pexels.com/photos/34423746/pexels-photo-34423746.jpeg', 'Kurtas, shirts & festive fits'),
  ('Kids', 'kids', 'https://images.pexels.com/photos/5893853/pexels-photo-5893853.jpeg', 'Playful, comfy styles for little ones'),
  ('Accessories', 'accessories', 'https://images.pexels.com/photos/30748147/pexels-photo-30748147.jpeg', 'Bags, jewellery & finishing touches')
on conflict (slug) do nothing;

insert into public.brands (name, slug) values
  ('Drape House', 'drape-house'),
  ('Lumen Studio', 'lumen-studio'),
  ('Kantha & Co.', 'kantha-co'),
  ('Veda Looms', 'veda-looms'),
  ('Little Drape', 'little-drape'),
  ('Atelier Noor', 'atelier-noor')
on conflict (slug) do nothing;

insert into public.products (name, slug, brand, category, subcategory, description, material_care, price, mrp, image_url, rating, rating_count, tags)
values
  ('Handwoven Banarasi Silk Saree', 'handwoven-banarasi-silk-saree-1', 'Drape House', 'women', 'Sarees',
   'A timeless handwoven Banarasi silk saree with intricate zari work, perfect for weddings and festive occasions.',
   'Dry clean only. Store folded in muslin cloth.', 4299, 6999,
   'https://images.pexels.com/photos/2103942/pexels-photo-2103942.jpeg', 4.6, 128, array['trending','bestseller']),
  ('Ivory Chikankari Anarkali Kurta', 'ivory-chikankari-anarkali-kurta-2', 'Kantha & Co.', 'women', 'Kurtas',
   'Delicate Lucknowi chikankari embroidery on breathable cotton in a flattering Anarkali silhouette.',
   'Hand wash cold. Do not bleach.', 1899, 2999,
   'https://images.pexels.com/photos/29172779/pexels-photo-29172779.jpeg', 4.3, 64, array['new']),
  ('Classic Nehru Collar Kurta', 'classic-nehru-collar-kurta-6', 'Atelier Noor', 'men', 'Kurtas',
   'A tailored Nehru-collar kurta in premium cotton-silk blend for festive gatherings.',
   'Dry clean recommended.', 1599, 2199,
   'https://images.pexels.com/photos/26984682/pexels-photo-26984682.jpeg', 4.4, 51, array['bestseller'])
on conflict (slug) do nothing;

-- Sample variants for the first product (repeat this pattern per product)
insert into public.product_variants (product_id, size, color, color_hex, stock_quantity, sku)
select p.id, v.size, v.color, v.color_hex, v.stock, v.sku
from public.products p
cross join (values
  ('Free Size', 'Burgundy', '#7c3f58', 8, 'DD-BAN-FS-BUR'),
  ('Free Size', 'Maroon', '#5d2d42', 5, 'DD-BAN-FS-MAR')
) as v(size, color, color_hex, stock, sku)
where p.slug = 'handwoven-banarasi-silk-saree-1'
on conflict (sku) do nothing;

insert into public.coupons (code, type, value, is_active) values
  ('WELCOME10', 'percent', 10, true),
  ('FESTIVE200', 'flat', 200, true)
on conflict (code) do nothing;

-- NOTE: no fake customer accounts, orders, or reviews tied to real users
-- are seeded here — those should only ever be created through real
-- Supabase Auth sign-ups so RLS and ownership stay meaningful.
