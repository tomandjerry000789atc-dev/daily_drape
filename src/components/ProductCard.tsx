import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import type { Product } from "../lib/types";
import { formatINR } from "../utils/format";
import StarRating from "./StarRating";
import { useWishlistStore } from "../store/wishlistStore";
import { cn } from "../utils/cn";

export default function ProductCard({ product }: { product: Product }) {
  const wishlist = useWishlistStore();
  const inWishlist = wishlist.has(product.id);
  const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);

  return (
    <div className="group relative">
      <Link to={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-cream-dark">
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          {product.images[1] && (
            <img
              src={product.images[1]}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100"
            />
          )}
          {product.discount_percent > 0 && (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-white">
              {product.discount_percent}% OFF
            </span>
          )}
          {totalStock === 0 && (
            <span className="absolute inset-x-0 bottom-0 bg-ink/80 py-1.5 text-center text-[11px] font-semibold tracking-wide text-white">
              OUT OF STOCK
            </span>
          )}
        </div>
      </Link>
      <button
        onClick={() => wishlist.toggle(product.id)}
        aria-label="Toggle wishlist"
        className={cn(
          "absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow-sm transition hover:scale-105",
        )}
      >
        <Heart
          size={15}
          className={inWishlist ? "fill-primary text-primary" : "text-ink"}
        />
      </button>

      <Link to={`/products/${product.slug}`} className="mt-3 block">
        <p className="text-[11px] uppercase tracking-wider text-muted">{product.brand}</p>
        <h3 className="mt-0.5 truncate text-sm font-medium text-ink">{product.name}</h3>
        <StarRating rating={product.rating} count={product.rating_count} className="mt-1" />
        <div className="mt-1.5 flex items-center gap-2">
          <span className="font-serif-display text-base font-semibold text-ink">
            {formatINR(product.price)}
          </span>
          {product.mrp > product.price && (
            <span className="text-xs text-muted line-through">{formatINR(product.mrp)}</span>
          )}
        </div>
      </Link>
    </div>
  );
}
