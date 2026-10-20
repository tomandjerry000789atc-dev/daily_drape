import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, RefreshCcw, ShieldCheck, Truck } from "lucide-react";
import { fetchCategories, fetchProducts } from "../lib/catalog";
import type { Category, Product } from "../lib/types";
import ProductCard from "../components/ProductCard";
import Newsletter from "../components/Newsletter";

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [c, p] = await Promise.all([fetchCategories(), fetchProducts()]);
      setCategories(c.data);
      setProducts(p.data);
      setLoading(false);
    })();
  }, []);

  const trending = products.filter((p) => p.tags.includes("trending")).slice(0, 4);
  const newArrivals = [...products]
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    .slice(0, 4);
  const bestSellers = products.filter((p) => p.tags.includes("bestseller")).slice(0, 4);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#4c2638] via-primary to-primary-light">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-0 lg:px-8">
          <div className="relative z-10 py-8 text-cream lg:py-24">
            <p className="mb-4 text-xs font-bold tracking-[3px] text-cream/75">
              EVERYDAY • ELEGANT • YOU
            </p>
            <h1 className="font-serif-display text-5xl font-bold leading-[0.98] sm:text-6xl lg:text-7xl">
              Dress your
              <span className="block italic font-medium">everyday.</span>
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-cream/85">
              Discover handcrafted sarees, kurtas and fits that feel like
              you — from everyday essentials to outfits made for life's
              special moments.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-full bg-cream px-7 py-3.5 text-sm font-semibold text-ink transition hover:bg-white"
              >
                Shop the Collection <ArrowRight size={16} />
              </Link>
              <Link
                to="/products?category=sale"
                className="inline-flex items-center gap-2 rounded-full border border-cream/50 px-7 py-3.5 text-sm font-semibold text-cream transition hover:bg-white/10"
              >
                Explore the Sale
              </Link>
            </div>
          </div>
          <div className="relative mx-auto h-[420px] w-full max-w-sm overflow-hidden rounded-t-[160px] rounded-b-2xl border-4 border-cream/30 shadow-2xl lg:h-[560px] lg:max-w-md">
            <img
              src="/images/hero-banner.jpg"
              alt="Daily Drape model wearing a draped silk saree"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        <div className="pointer-events-none absolute -right-40 top-10 h-[500px] w-[500px] rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-20 bottom-[-160px] h-80 w-80 rounded-full border border-white/10" />
      </section>

      {/* TRUST STRIP */}
      <section className="border-b border-border bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-6 text-center sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { icon: Truck, label: "Free shipping over ₹1,999" },
            { icon: RefreshCcw, label: "7-day easy returns" },
            { icon: ShieldCheck, label: "Secure checkout" },
            { icon: Leaf, label: "Handcrafted & ethical" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <Icon size={20} className="text-primary" />
              <p className="text-xs font-medium text-ink/80">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORY TILES */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Curated for you" title="Shop by Category" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/products?category=${c.slug}`}
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl"
            >
              <img
                src={c.image}
                alt={c.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="font-serif-display text-lg font-semibold text-white">{c.name}</h3>
                <p className="mt-0.5 text-[11px] text-white/80">{c.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* TRENDING */}
      <ProductRow
        title="Trending Now"
        eyebrow="What everyone's wearing"
        products={trending}
        loading={loading}
        viewAllHref="/products?sort=popularity"
      />

      {/* PROMO BANNER */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <PromoCard
            title="Festive Edit"
            subtitle="Up to 50% off ethnic wear"
            href="/products?category=sale"
            image="https://images.pexels.com/photos/6842907/pexels-photo-6842907.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=1100"
          />
          <PromoCard
            title="New Season, New Drapes"
            subtitle="Discover the latest arrivals"
            href="/products?sort=newest"
            image="https://images.pexels.com/photos/34423730/pexels-photo-34423730.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=1100"
          />
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <ProductRow
        title="New Arrivals"
        eyebrow="Fresh off the loom"
        products={newArrivals}
        loading={loading}
        viewAllHref="/products?sort=newest"
      />

      {/* BEST SELLERS */}
      <ProductRow
        title="Best Sellers"
        eyebrow="Customer favourites"
        products={bestSellers}
        loading={loading}
        viewAllHref="/products?sort=popularity"
      />

      {/* EDITORIAL BANNER */}
      <section className="my-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-ink">
            <img
              src="https://images.pexels.com/photos/974902/pexels-photo-974902.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=1600"
              alt=""
              className="h-80 w-full object-cover opacity-50 sm:h-96"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-cream">
              <p className="text-xs font-bold tracking-[3px]">THE DAILY DRAPE JOURNAL</p>
              <h2 className="mt-3 max-w-xl font-serif-display text-3xl font-semibold sm:text-4xl">
                Craft, culture, and everyday elegance
              </h2>
              <Link
                to="/about"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 text-sm font-semibold text-ink"
              >
                Our Story <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Newsletter />
    </div>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-8 flex items-end justify-between">
      <div>
        <p className="text-xs font-bold tracking-[2.5px] text-primary">{eyebrow.toUpperCase()}</p>
        <h2 className="mt-2 font-serif-display text-3xl font-semibold text-ink sm:text-4xl">
          {title}
        </h2>
      </div>
    </div>
  );
}

function ProductRow({
  title,
  eyebrow,
  products,
  loading,
  viewAllHref,
}: {
  title: string;
  eyebrow: string;
  products: Product[];
  loading: boolean;
  viewAllHref: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold tracking-[2.5px] text-primary">{eyebrow.toUpperCase()}</p>
          <h2 className="mt-2 font-serif-display text-3xl font-semibold text-ink sm:text-4xl">
            {title}
          </h2>
        </div>
        <Link
          to={viewAllHref}
          className="hidden items-center gap-1 text-sm font-semibold text-primary hover:text-primary-dark sm:flex"
        >
          View All <ArrowRight size={14} />
        </Link>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-cream-dark" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="text-sm text-muted">No products to show yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}

function PromoCard({
  title,
  subtitle,
  href,
  image,
}: {
  title: string;
  subtitle: string;
  href: string;
  image: string;
}) {
  return (
    <Link to={href} className="group relative block h-64 overflow-hidden rounded-2xl sm:h-72">
      <img
        src={image}
        alt={title}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6">
        <h3 className="font-serif-display text-2xl font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm text-white/85">{subtitle}</p>
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-white underline underline-offset-4">
          Shop Now <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  );
}
