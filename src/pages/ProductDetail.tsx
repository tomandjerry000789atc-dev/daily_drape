import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Check, Heart, Loader2, Minus, Plus, Ruler, ShieldCheck, Truck } from "lucide-react";
import { fetchProducts, fetchReviews } from "../lib/catalog";
import type { Product, ProductVariant, Review } from "../lib/types";
import { formatINR } from "../utils/format";
import StarRating from "../components/StarRating";
import ProductCard from "../components/ProductCard";
import { useCartStore } from "../store/cartStore";
import { useWishlistStore } from "../store/wishlistStore";
import { cn } from "../utils/cn";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [addedMessage, setAddedMessage] = useState("");

  const cart = useCartStore();
  const wishlist = useWishlistStore();

  useEffect(() => {
    setLoading(true);
    fetchProducts().then((res) => {
      setAllProducts(res.data);
      setLoading(false);
    });
  }, []);

  const product = allProducts.find((p) => p.slug === slug);

  useEffect(() => {
    if (!product) return;
    setActiveImage(0);
    setSelectedSize(product.variants[0]?.size ?? "");
    setSelectedColor(product.variants[0]?.color ?? "");
    setQuantity(1);
    fetchReviews(product.id).then((res) => setReviews(res.data));
  }, [product?.id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-serif-display text-2xl font-semibold">Product not found</h1>
        <p className="mt-2 text-sm text-muted">This product may have been removed or is unavailable.</p>
        <Link to="/products" className="mt-5 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const colors = [...new Set(product.variants.map((v) => v.color))];
  const sizes = [...new Set(product.variants.map((v) => v.size))];
  const selectedVariant: ProductVariant | undefined = product.variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );
  const stock = selectedVariant?.stock ?? 0;
  const related = allProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  function handleAddToCart() {
    if (!selectedVariant || stock === 0) return;
    cart.addItem({ productId: product!.id, variantId: selectedVariant.id, quantity });
    setAddedMessage("Added to your bag!");
    setTimeout(() => setAddedMessage(""), 2500);
  }

  function handleBuyNow() {
    handleAddToCart();
    navigate("/cart");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 text-xs text-muted">
        <Link to="/" className="hover:text-primary">Home</Link> /{" "}
        <Link to={`/products?category=${product.category}`} className="capitalize hover:text-primary">
          {product.category}
        </Link>{" "}
        / <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-cream-dark">
            <img src={product.images[activeImage]} alt={product.name} className="h-full w-full object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "h-20 w-16 overflow-hidden rounded-lg border-2",
                    activeImage === i ? "border-primary" : "border-transparent"
                  )}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">{product.brand}</p>
          <h1 className="mt-1 font-serif-display text-3xl font-semibold text-ink">{product.name}</h1>
          <div className="mt-2">
            <StarRating rating={product.rating} count={product.rating_count} />
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="font-serif-display text-3xl font-bold text-ink">{formatINR(product.price)}</span>
            {product.mrp > product.price && (
              <>
                <span className="text-base text-muted line-through">{formatINR(product.mrp)}</span>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                  {product.discount_percent}% OFF
                </span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-muted">Inclusive of all taxes</p>

          <p className="mt-5 text-sm leading-relaxed text-ink/80">{product.description}</p>

          {/* Color */}
          <div className="mt-6">
            <p className="mb-2 text-sm font-semibold text-ink">
              Color: <span className="font-normal text-muted">{selectedColor}</span>
            </p>
            <div className="flex flex-wrap gap-2.5">
              {colors.map((c) => {
                const hex = product.variants.find((v) => v.color === c)?.color_hex ?? "#7c3f58";
                return (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border-2",
                      selectedColor === c ? "border-primary" : "border-transparent"
                    )}
                    title={c}
                  >
                    <span
                      className="h-7 w-7 rounded-full border border-black/10"
                      style={{ backgroundColor: hex }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-ink">Size: <span className="font-normal text-muted">{selectedSize}</span></p>
              <button
                onClick={() => setShowSizeGuide(true)}
                className="flex items-center gap-1 text-xs font-semibold text-primary"
              >
                <Ruler size={13} /> Size Guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => {
                const variantStock = product.variants
                  .filter((v) => v.size === s && v.color === selectedColor)
                  .reduce((sum, v) => sum + v.stock, 0);
                return (
                  <button
                    key={s}
                    disabled={variantStock === 0}
                    onClick={() => setSelectedSize(s)}
                    className={cn(
                      "rounded-lg border px-4 py-2 text-sm font-medium",
                      selectedSize === s
                        ? "border-primary bg-primary text-white"
                        : "border-border text-ink hover:border-primary",
                      variantStock === 0 && "cursor-not-allowed opacity-40 line-through"
                    )}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stock */}
          <p className="mt-4 text-sm">
            {stock === 0 ? (
              <span className="font-semibold text-red-600">Out of stock</span>
            ) : stock <= 5 ? (
              <span className="font-semibold text-amber-600">Only {stock} left in stock — order soon!</span>
            ) : (
              <span className="flex items-center gap-1.5 font-medium text-green-700">
                <Check size={15} /> In stock
              </span>
            )}
          </p>

          {/* Quantity + actions */}
          <div className="mt-5 flex items-center gap-3">
            <div className="flex items-center rounded-full border border-border">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="grid h-11 w-11 place-items-center"
              >
                <Minus size={15} />
              </button>
              <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(stock || 1, q + 1))}
                className="grid h-11 w-11 place-items-center"
              >
                <Plus size={15} />
              </button>
            </div>
            <button
              onClick={() => wishlist.toggle(product.id)}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border"
            >
              <Heart
                size={18}
                className={wishlist.has(product.id) ? "fill-primary text-primary" : "text-ink"}
              />
            </button>
          </div>

          {addedMessage && (
            <p className="mt-3 text-sm font-semibold text-green-700">{addedMessage}</p>
          )}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleAddToCart}
              disabled={stock === 0}
              className="flex-1 rounded-full border-2 border-primary py-3.5 text-sm font-bold text-primary transition hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add to Bag
            </button>
            <button
              onClick={handleBuyNow}
              disabled={stock === 0}
              className="flex-1 rounded-full bg-primary py-3.5 text-sm font-bold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              Buy Now
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 rounded-xl bg-cream-dark p-4 text-xs text-ink/80">
            <div className="flex items-center gap-2"><Truck size={15} className="text-primary" /> Delivery in 4-7 days</div>
            <div className="flex items-center gap-2"><ShieldCheck size={15} className="text-primary" /> 7-day easy returns</div>
          </div>

          <details className="mt-6 rounded-xl border border-border p-4 text-sm">
            <summary className="cursor-pointer font-semibold text-ink">Material & Care</summary>
            <p className="mt-2 leading-relaxed text-ink/75">{product.material_care}</p>
          </details>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16">
        <h2 className="font-serif-display text-2xl font-semibold text-ink">Reviews & Ratings</h2>
        <div className="mt-2 flex items-center gap-2">
          <StarRating rating={product.rating} count={product.rating_count} size={16} />
        </div>
        <div className="mt-6 space-y-5">
          {reviews.length === 0 ? (
            <p className="text-sm text-muted">No reviews yet. Be the first to review this product.</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="rounded-xl border border-border p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink">{r.user_name}</p>
                  {r.verified && (
                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                      Verified Purchase
                    </span>
                  )}
                </div>
                <StarRating rating={r.rating} size={12} className="mt-1" />
                {r.title && <p className="mt-2 text-sm font-semibold text-ink">{r.title}</p>}
                <p className="mt-1 text-sm leading-relaxed text-ink/75">{r.comment}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-serif-display text-2xl font-semibold text-ink">You may also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Size guide modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-serif-display text-lg font-semibold">Size Guide</h3>
              <button onClick={() => setShowSizeGuide(false)} className="text-sm text-muted">Close</button>
            </div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted">
                  <th className="py-2">Size</th>
                  <th className="py-2">Bust (in)</th>
                  <th className="py-2">Waist (in)</th>
                  <th className="py-2">Hip (in)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["XS", "32", "26", "34"],
                  ["S", "34", "28", "36"],
                  ["M", "36", "30", "38"],
                  ["L", "38", "32", "40"],
                  ["XL", "40", "34", "42"],
                  ["XXL", "42", "36", "44"],
                ].map((row) => (
                  <tr key={row[0]} className="border-b border-border/60">
                    {row.map((c, i) => (
                      <td key={i} className="py-2">{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-muted">Measurements are approximate and may vary slightly by style.</p>
          </div>
        </div>
      )}
    </div>
  );
}
