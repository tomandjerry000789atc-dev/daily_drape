import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { fetchProducts } from "../lib/catalog";
import type { Product } from "../lib/types";
import { useCartStore } from "../store/cartStore";
import { formatINR } from "../utils/format";

const FREE_SHIPPING_THRESHOLD = 1999;
const SHIPPING_FEE = 99;

export default function Cart() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const cart = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts().then((res) => {
      setProducts(res.data);
      setLoading(false);
    });
  }, []);

  const lines = useMemo(() => {
    return cart.items
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        const variant = product?.variants.find((v) => v.id === item.variantId);
        if (!product || !variant) return null;
        return { item, product, variant };
      })
      .filter(Boolean) as { item: typeof cart.items[0]; product: Product; variant: Product["variants"][0] }[];
  }, [cart.items, products]);

  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.item.quantity, 0);
  const originalTotal = lines.reduce((sum, l) => sum + l.product.mrp * l.item.quantity, 0);
  const discount = Math.max(0, originalTotal - subtotal);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <ShoppingBag className="mx-auto mb-4 text-muted" size={40} />
        <h1 className="font-serif-display text-2xl font-semibold text-ink">Your bag is empty</h1>
        <p className="mt-2 text-sm text-muted">Looks like you haven't added anything yet.</p>
        <Link to="/products" className="mt-6 inline-block rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif-display text-3xl font-semibold text-ink">Shopping Bag</h1>
      <p className="mt-1 text-sm text-muted">{lines.length} item(s) in your bag</p>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {lines.map(({ item, product, variant }) => {
            const unavailable = variant.stock === 0;
            const exceedsStock = item.quantity > variant.stock;
            return (
              <div key={`${item.productId}-${item.variantId}`} className="flex gap-4 rounded-2xl border border-border bg-white p-4">
                <Link to={`/products/${product.slug}`} className="h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-cream-dark">
                  <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                </Link>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex justify-between gap-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted">{product.brand}</p>
                      <Link to={`/products/${product.slug}`} className="text-sm font-medium text-ink hover:text-primary">
                        {product.name}
                      </Link>
                      <p className="mt-1 text-xs text-muted">Size: {variant.size} • Color: {variant.color}</p>
                    </div>
                    <button
                      onClick={() => cart.removeItem(item.productId, item.variantId)}
                      className="h-fit text-muted hover:text-red-600"
                      aria-label="Remove item"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  {unavailable && (
                    <p className="mt-1 text-xs font-semibold text-red-600">
                      This item is currently out of stock and won't be included at checkout.
                    </p>
                  )}
                  {!unavailable && exceedsStock && (
                    <p className="mt-1 text-xs font-semibold text-amber-600">
                      Only {variant.stock} left — quantity will be limited at checkout.
                    </p>
                  )}

                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-border">
                      <button
                        onClick={() => cart.updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                        className="grid h-9 w-9 place-items-center"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => cart.updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                        className="grid h-9 w-9 place-items-center"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-serif-display font-semibold text-ink">
                        {formatINR(product.price * item.quantity)}
                      </p>
                      {product.mrp > product.price && (
                        <p className="text-xs text-muted line-through">{formatINR(product.mrp * item.quantity)}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-fit rounded-2xl border border-border bg-white p-6">
          <h2 className="font-serif-display text-lg font-semibold text-ink">Order Summary</h2>
          <div className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between text-ink/80">
              <span>Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Discount</span>
                <span>-{formatINR(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-ink/80">
              <span>Shipping</span>
              <span>{shipping === 0 ? "FREE" : formatINR(shipping)}</span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-muted">
                Add {formatINR(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping.
              </p>
            )}
            <div className="mt-3 flex justify-between border-t border-border pt-3 text-base font-bold text-ink">
              <span>Total</span>
              <span>{formatINR(total)}</span>
            </div>
          </div>
          <button
            onClick={() => navigate("/checkout")}
            className="mt-6 w-full rounded-full bg-primary py-3.5 text-sm font-bold text-white transition hover:bg-primary-dark"
          >
            Proceed to Checkout
          </button>
          <Link to="/products" className="mt-3 block text-center text-xs font-semibold text-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
