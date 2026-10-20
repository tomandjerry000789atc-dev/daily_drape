# Daily Drape — Fashion E-Commerce Storefront

Daily Drape is a premium Indian fashion storefront: Women, Men, Kids and
Accessories, with a full shopping flow (catalog, cart, wishlist, checkout,
orders), customer accounts, an admin dashboard and a delivery-partner
dashboard — built as a single-page React application.

> **Important technical note about this rebuild.** The original project
> description referenced a vanilla HTML/CSS/JS multi-page app
> (`frontend/index.html`, `frontend/login.html`, …). The actual sandboxed
> workspace this assistant has access to is a **React + Vite + Tailwind
> CSS v4** single-page app scaffold (`src/App.tsx` is the entry point).
> Rather than discard your requirements, this project reimplements the
> exact same features, pages, branding (burgundy `#7c3f58` / cream
> `#faf6f2` / ink `#282326`, DM Sans + Playfair Display, your original
> login/registration layout) and your existing Supabase project
> credentials as React Router pages inside this SPA. If you need the
> original static multi-page file structure restored, copy the relevant
> `src/pages/**` logic back into standalone HTML/JS files — the Supabase
> calls and validation logic are written in plain, portable TypeScript.

## 1. Folder structure

```
├── index.html                 Vite HTML shell (SPA entry)
├── public/
│   └── images/                logo.png, hero-banner.jpg (generated assets)
├── src/
│   ├── main.tsx, App.tsx      App bootstrap + React Router routes
│   ├── index.css              Tailwind v4 theme (brand colors/fonts)
│   ├── lib/
│   │   ├── supabase.ts        Supabase client (reuses your project URL/anon key)
│   │   ├── types.ts           Shared TypeScript types
│   │   ├── catalog.ts         Products/categories data access (DB-first, demo fallback)
│   │   └── orders.ts          Order creation/history (DB-first, demo fallback)
│   ├── data/seed.ts           Local demo catalog (used until Supabase schema is live)
│   ├── store/                 Zustand stores: auth, cart, wishlist, addresses
│   ├── components/            Header, Footer, ProductCard, guards, etc.
│   └── pages/
│       ├── Home.tsx, Products.tsx, ProductDetail.tsx
│       ├── Cart.tsx, Wishlist.tsx, Checkout.tsx
│       ├── Orders.tsx, OrderDetail.tsx, OrderConfirmation.tsx
│       ├── auth/               Login, Register, ForgotPassword, ResetPassword
│       ├── account/             Profile, Addresses (+ layout)
│       ├── admin/               Dashboard, Products, Categories, Orders (+ layout)
│       ├── delivery/            DeliveryLogin, DeliveryDashboard
│       └── info/                About, Contact, FAQ, Shipping, Returns, Privacy, Terms
├── sql/
│   ├── schema.sql              Tables, enums, triggers (apply 1st)
│   ├── policies.sql            Row Level Security policies (apply 2nd)
│   ├── seed.sql                Optional sample catalog rows (apply 3rd)
│   └── storage.sql             Storage buckets + policies (apply 4th)
└── README.md
```

## 2. Local development

```bash
npm install
npm run dev        # starts Vite dev server
npm run build       # production build -> dist/
npm run preview     # preview the production build locally
```

No extra local server setup is required — Vite serves everything,
including the Supabase JS client over HTTPS to your Supabase project.

## 3. Supabase configuration

This app reuses your existing Supabase project:

- Project URL and **publishable (anon) key** are stored in
  `src/lib/supabase.ts`. These are safe for frontend use — never paste a
  **service-role/secret key** into any frontend file.
- The app **detects whether your database schema exists** at runtime
  (`isSchemaReady()` in `src/lib/supabase.ts`, a simple `select` against
  `products`). If the schema isn't present yet, the storefront
  automatically falls back to realistic local demo data so you can
  still click through the whole experience — every place this happens
  is labeled "demo" in the UI so nothing claims a fake success.

### 3.1 Apply the SQL (required for real data, accounts-with-roles, and orders)

In the Supabase Dashboard → **SQL Editor**, run these files **in order**,
each as its own query:

1. `sql/schema.sql` — tables, enums, the `handle_new_user` trigger that
   auto-creates a `profiles` row on signup.
2. `sql/policies.sql` — enables Row Level Security and creates explicit
   policies for every table (see Security section below).
3. `sql/seed.sql` — optional sample categories/products/coupons.
4. `sql/storage.sql` — creates the `product-images` (public) and
   `user-uploads` (private) buckets with matching storage policies.

All scripts are idempotent (`if not exists`, `on conflict do nothing`,
`drop policy if exists` + recreate) — re-running them will not destroy
existing data.

### 3.2 Authentication redirect configuration

For password reset to work, add your deployed site URL (and
`http://localhost:5173` for local dev) to:

**Supabase Dashboard → Authentication → URL Configuration**
- **Site URL**: `https://your-deployed-domain.com`
- **Redirect URLs**: add both
  - `http://localhost:5173/reset-password`
  - `https://your-deployed-domain.com/reset-password`

The app calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: origin + "/reset-password" })`
and `src/pages/auth/ResetPassword.tsx` listens for the `PASSWORD_RECOVERY`
auth event to let the user set a new password.

> ⚠️ **Not yet verified end-to-end.** Sending the actual email requires
> your Supabase project's email provider (the built-in rate-limited
> dev email service, or a configured SMTP/Resend integration) to be
> active. Test this yourself from the "Forgot password" page before
> relying on it — this assistant cannot access your inbox to confirm.

### 3.3 Secure first-admin setup

Roles (`customer` / `admin` / `delivery`) live in `public.profiles.role`
and are **never** settable by the frontend, browser storage, or user
metadata — only by a trusted SQL statement you run yourself:

1. Create a normal account by registering through `/register`.
2. In Supabase Dashboard → SQL Editor, run:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
3. Sign out and back in (or just refresh) — `/admin` is now accessible.

To create a delivery partner account, register an account the same way,
then run:
```sql
update public.profiles set role = 'delivery' where email = 'driver@example.com';
```
Delivery partners sign in at `/delivery/login`, which explicitly checks
`profiles.role = 'delivery'` after authentication and signs the user
back out if the role doesn't match.

### 3.4 Test accounts

No test accounts are pre-created for you (that would require inventing
credentials). Create your own via `/register`, then promote as needed
using the SQL above.

## 4. Security model (what's enforced where)

- **RLS is the real boundary**, not UI hiding. `sql/policies.sql`
  enables Row Level Security on every table holding private or
  privileged data, with explicit per-table policies:
  - Customers can only read/write their own `profiles`, `addresses`,
    `wishlists`, `carts`/`cart_items`, and `orders`.
  - Customers can update their profile but **cannot** change their own
    `role` column (enforced in the `profiles` UPDATE policy).
  - Customers may insert orders for themselves only, with
    `status = 'placed'`; they can only transition their own order to
    `cancelled`, and only while it's still in an early state. They can
    never edit totals, items, payment status, or delivery assignment.
  - `is_admin()` / `is_delivery()` are `SECURITY DEFINER` SQL functions
    reading the trusted `profiles.role` column — this is how
    admin/delivery authorization is actually granted, not by any
    frontend flag.
  - Reviews must reference `auth.uid()` as the author.
  - Storage: `product-images` is public-read / admin-write;
    `user-uploads` is private and scoped per-uploader folder.
- **Pricing integrity**: `src/pages/Checkout.tsx` recomputes each line's
  price from the freshly-fetched product catalog at the moment of
  checkout — never from a value that merely passed through the cart
  component — and clamps quantity to current stock.
- **Payments**: this build never collects card numbers/CVVs, and never
  marks an order "paid" based solely on a frontend claim for
  card/UPI demo flows — cash on delivery orders are explicitly
  `payment_status: 'pending'` until fulfillment. These are **demo
  payment flows only**, clearly labeled as such in the checkout UI — no
  real payment gateway is integrated.
- **Honesty about data source**: `src/lib/catalog.ts` and
  `src/lib/orders.ts` tag every read/write with `source: "database" |
  "demo"` and surface that in the relevant admin/customer screens, so
  the app never pretends a failed Supabase call actually succeeded.

## 5. What has and hasn't been tested

Verified by building and exercising the code in this environment:
- ✅ Production build (`npm run build`) completes with no TypeScript or
  bundler errors.
- ✅ All routes render without runtime import errors.
- ✅ Client-side cart math, coupon logic, filtering/sorting, and stock
  clamping were traced through manually.

**Not independently verified** (requires your real Supabase project with
the SQL applied, and a live email provider):
- Supabase email/password signup + email verification end-to-end.
- Password-reset email delivery and the recovery-session hand-off.
- RLS policy behavior against real rows (please test with two accounts:
  confirm a customer cannot see another customer's orders/addresses).
- Admin/delivery dashboards against real Supabase data (they currently
  run in "demo" read-only mode until `sql/schema.sql` is applied).
- Storage image uploads (admin product form currently accepts an image
  **URL**, not a file upload widget — wire up `supabase.storage.from('product-images').upload()` 
  if you want direct uploads).

Please test these yourself after applying the SQL and configuring Auth
redirect URLs, and treat them as "implemented but unverified" until you
do.

## 6. Git & deployment

```bash
git init
git add .
git commit -m "Daily Drape storefront"
git branch -M main
git remote add origin https://github.com/<you>/daily-drape.git
git push -u origin main
```

Create a `.env` only if you later choose to move the Supabase URL/key out
of source (optional for a public anon key, but good practice):
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```
then update `src/lib/supabase.ts` to read `import.meta.env.VITE_SUPABASE_URL`
etc. A `.gitignore` is already present via the Vite template; make sure
`.env` is listed there if you add one.

**Static hosting** (Netlify, Vercel, Cloudflare Pages, GitHub Pages):
1. Build command: `npm run build`
2. Publish directory: `dist`
3. Because this is a single-page app, configure a SPA fallback (all
   routes → `index.html`) — e.g. a `_redirects` file with `/* /index.html 200`
   on Netlify, or the framework preset on Vercel.
4. Add your deployed domain to Supabase Auth's Redirect URLs (see 3.2).

## 7. Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| Products/categories always show "demo" data | `sql/schema.sql` hasn't been run, or the anon key lacks SELECT on `products` — check `policies.sql` ran too. |
| Password reset email never arrives | Supabase's default email sending is rate-limited / for testing only — configure a custom SMTP provider in Auth settings, and confirm your Redirect URL is whitelisted. |
| "Access restricted" on `/admin` after promoting a user | Sign out and back in so the app reloads `profiles.role`, or hard refresh. |
| Orders created while signed in disappear after refresh | If Supabase isn't connected, orders are stored in `localStorage` per browser — this is expected demo behavior, not a bug. |
| Delivery login always rejected | The account's `profiles.role` must be exactly `delivery`; confirm with `select role from profiles where email = '...'`. |

## 8. Honest scope notes

- This is a fully functional **frontend demo + documented backend
  design** for Daily Drape. Full production-grade order integrity
  (atomic stock decrement, true server-side payment capture, anti-
  oversell locking) requires a Postgres function or Edge Function
  invoked via RPC — the schema and `recalculate_order_item_total`
  helper in `sql/schema.sql` are a starting point, not a complete
  implementation.
- Contact details, policy text, and brand imagery (except the generated
  logo/hero) are **placeholders** sourced from stock photography —
  replace with your real business information, photography and legal
  copy before going live.
