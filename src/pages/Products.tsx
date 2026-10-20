import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, SlidersHorizontal, X } from "lucide-react";
import { fetchProducts, brands } from "../lib/catalog";
import type { Product } from "../lib/types";
import ProductCard from "../components/ProductCard";
import { cn } from "../utils/cn";

const PAGE_SIZE = 12;
const CATEGORIES = ["women", "men", "kids", "accessories", "sale"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];
const SORT_OPTIONS = [
  { value: "popularity", label: "Popularity" },
  { value: "newest", label: "Newest First" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
];

export default function Products() {
  const [params, setParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const query = params.get("q") ?? "";
  const category = params.get("category") ?? "";
  const brand = params.get("brand") ?? "";
  const size = params.get("size") ?? "";
  const maxPrice = params.get("maxPrice") ?? "";
  const sort = params.get("sort") ?? "popularity";

  useEffect(() => {
    setLoading(true);
    fetchProducts()
      .then((res) => {
        setAllProducts(res.data);
        if (res.error) setError(res.error);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => setVisibleCount(PAGE_SIZE), [query, category, brand, size, maxPrice, sort]);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }

  function clearFilters() {
    setParams({}, { replace: true });
  }

  const filtered = useMemo(() => {
    let list = [...allProducts];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
      );
    }
    if (category) {
      list = category === "sale"
        ? list.filter((p) => p.tags.includes("sale") || p.discount_percent >= 20)
        : list.filter((p) => p.category === category);
    }
    if (brand) list = list.filter((p) => p.brand === brand);
    if (size) list = list.filter((p) => p.variants.some((v) => v.size === size));
    if (maxPrice) list = list.filter((p) => p.price <= Number(maxPrice));

    switch (sort) {
      case "newest":
        list.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
        break;
      case "price_low":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price_high":
        list.sort((a, b) => b.price - a.price);
        break;
      default:
        list.sort((a, b) => b.rating_count - a.rating_count);
    }
    return list;
  }, [allProducts, query, category, brand, size, maxPrice, sort]);

  const visible = filtered.slice(0, visibleCount);
  const activeFilterCount = [category, brand, size, maxPrice].filter(Boolean).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[2.5px] text-primary">
            {category ? category.toUpperCase() : "ALL PRODUCTS"}
          </p>
          <h1 className="mt-2 font-serif-display text-3xl font-semibold text-ink sm:text-4xl">
            {query ? `Results for "${query}"` : "Shop Daily Drape"}
          </h1>
          <p className="mt-1 text-sm text-muted">{filtered.length} products</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium lg:hidden"
          >
            <Filter size={15} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={15} className="hidden text-muted sm:block" />
            <select
              value={sort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="rounded-full border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  Sort: {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        {/* Desktop filters */}
        <aside className="hidden lg:block">
          <FilterPanel
            category={category}
            brand={brand}
            size={size}
            maxPrice={maxPrice}
            onChange={updateParam}
            onClear={clearFilters}
            activeCount={activeFilterCount}
          />
        </aside>

        {/* Mobile filters drawer */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
            <div className="relative ml-auto h-full w-[85%] max-w-sm overflow-y-auto bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-serif-display text-lg font-semibold">Filters</h3>
                <button onClick={() => setMobileFiltersOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <FilterPanel
                category={category}
                brand={brand}
                size={size}
                maxPrice={maxPrice}
                onChange={updateParam}
                onClear={clearFilters}
                activeCount={activeFilterCount}
              />
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="mt-6 w-full rounded-full bg-primary py-3 text-sm font-semibold text-white"
              >
                Show {filtered.length} results
              </button>
            </div>
          </div>
        )}

        <div>
          {loading ? (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-cream-dark" />
              ))}
            </div>
          ) : error && allProducts.length === 0 ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">
              Could not load products right now. Please try again shortly.
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-border bg-white p-16 text-center">
              <p className="font-serif-display text-xl font-semibold text-ink">No products found</p>
              <p className="mt-2 text-sm text-muted">Try adjusting or clearing your filters.</p>
              <button
                onClick={clearFilters}
                className="mt-5 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
                {visible.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              {visibleCount < filtered.length && (
                <div className="mt-10 flex justify-center">
                  <button
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    className="flex items-center gap-2 rounded-full border border-primary px-8 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterPanel({
  category,
  brand,
  size,
  maxPrice,
  onChange,
  onClear,
  activeCount,
}: {
  category: string;
  brand: string;
  size: string;
  maxPrice: string;
  onChange: (key: string, value: string) => void;
  onClear: () => void;
  activeCount: number;
}) {
  return (
    <div className="space-y-7">
      {activeCount > 0 && (
        <button onClick={onClear} className="text-xs font-semibold text-primary underline">
          Clear all filters
        </button>
      )}

      <FilterGroup title="Category">
        {CATEGORIES.map((c) => (
          <label key={c} className="flex items-center gap-2 text-sm capitalize">
            <input
              type="radio"
              name="category"
              checked={category === c}
              onChange={() => onChange("category", c)}
              className="accent-primary"
            />
            {c}
          </label>
        ))}
      </FilterGroup>

      <FilterGroup title="Brand">
        {brands.map((b) => (
          <label key={b.id} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="brand"
              checked={brand === b.name}
              onChange={() => onChange("brand", b.name)}
              className="accent-primary"
            />
            {b.name}
          </label>
        ))}
      </FilterGroup>

      <FilterGroup title="Size">
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => onChange("size", size === s ? "" : s)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium",
                size === s
                  ? "border-primary bg-primary text-white"
                  : "border-border text-ink hover:border-primary"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Max Price">
        <input
          type="range"
          min={500}
          max={6000}
          step={100}
          value={maxPrice || 6000}
          onChange={(e) => onChange("maxPrice", e.target.value)}
          className="w-full accent-primary"
        />
        <p className="mt-1 text-xs text-muted">Up to ₹{maxPrice || "6000"}</p>
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-3 text-xs font-bold tracking-wide text-ink">{title.toUpperCase()}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
