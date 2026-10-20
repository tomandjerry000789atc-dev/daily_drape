import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, MapPin, Plus, ShieldCheck } from "lucide-react";
import { fetchProducts } from "../lib/catalog";
import type { Order, OrderStatus, Product } from "../lib/types";
import { useCartStore } from "../store/cartStore";
import { useAddressStore } from "../store/addressStore";
import { useAuthStore } from "../store/authStore";
import { createOrder } from "../lib/orders";
import { formatINR } from "../utils/format";
import { cn } from "../utils/cn";

const FREE_SHIPPING_THRESHOLD = 1999;
const SHIPPING_FEE = 99;

const COUPONS: Record<string, { type: "percent" | "flat"; value: number; label: string }> = {
  WELCOME10: { type: "percent", value: 10, label: "10% off your order" },
  FESTIVE200: { type: "flat", value: 200, label: "₹200 off your order" },
};

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const cart = useCartStore();
  const addressStore = useAddressStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "demo_card" | "demo_upi">("cod");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const [newAddress, setNewAddress] = useState({
    label: "Home",
    full_name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    fetchProducts().then((res) => {
      setProducts(res.data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const def = addressStore.addresses.find((a) => a.is_default) ?? addressStore.addresses[0];
    if (def) setSelectedAddressId(def.id);
    else setShowNewAddress(true);
  }, [addressStore.addresses.length]);

  const lines = useMemo(() => {
    return cart.items
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        const variant = product?.variants.find((v) => v.id === item.variantId);
        if (!product || !variant || variant.stock === 0) return null;
        const qty = Math.min(item.quantity, variant.stock);
        return { item: { ...item, quantity: qty }, product, variant };
      })
      .filter(Boolean) as { item: typeof cart.items[0]; product: Product; variant: Product["variants"][0] }[];
  }, [cart.items, products]);

  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.item.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    const c = COUPONS[appliedCoupon];
    if (!c) return 0;
    return c.type === "percent" ? Math.round((subtotal * c.value) / 100) : Math.min(c.value, subtotal);
  }, [appliedCoupon, subtotal]);
  const total = Math.max(0, subtotal + shipping - couponDiscount);

  function applyCoupon() {
    setCouponError("");
    const code = couponInput.trim().toUpperCase();
    if (!COUPONS[code]) {
      setCouponError("Invalid or expired coupon code.");
      return;
    }
    setAppliedCoupon(code);
  }

  function saveNewAddress() {
    if (!newAddress.full_name || !newAddress.phone || !newAddress.line1 || !newAddress.city || !newAddress.state || !/^\d{6}$/.test(newAddress.pincode)) {
      setError("Please fill all required address fields with a valid 6-digit pincode.");
      return;
    }
    const added = addressStore.add({ ...newAddress, user_id: user?.id ?? "guest", is_default: addressStore.addresses.length === 0 });
    setSelectedAddressId(added.id);
    setShowNewAddress(false);
    setError("");
  }

  async function handlePlaceOrder() {
    setError("");
    if (!user) {
      navigate("/login");
      return;
    }
    const address = addressStore.addresses.find((a) => a.id === selectedAddressId);
    if (!address) {
      setError("Please select or add a delivery address.");
      return;
    }
    if (lines.length === 0) {
      setError("Your bag has no available items to order.");
      return;
    }
    setPlacing(true);
    try {
      const now = new Date().toISOString();
      const order: Order = {
        id: crypto.randomUUID(),
        userId: user.id,
        items: lines.map((l) => ({
          productId: l.product.id,
          variantId: l.variant.id,
          name: l.product.name,
          image: l.product.images[0],
          size: l.variant.size,
          color: l.variant.color,
          price: l.product.price, // trusted price recomputed from catalog, not cart/browser input
          quantity: l.item.quantity,
        })),
        address: {
          label: address.label,
          full_name: address.full_name,
          phone: address.phone,
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
        },
        subtotal,
        discount: couponDiscount,
        shipping,
        total,
        couponCode: appliedCoupon ?? undefined,
        paymentMethod,
        // Demo payments are never marked "paid" by client claim for card/upi;
        // only COD has a well-defined pending-until-delivery status here.
        paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
        status: "placed" as OrderStatus,
        trackingNumber: `DD${Math.floor(10000000 + Math.random() * 89999999)}`,
        createdAt: now,
        statusHistory: [{ status: "placed", at: now }],
      };

      const result = await createOrder(order);
      cart.clear();
      navigate(`/order-confirmation/${order.id}`, { state: { demo: result.source === "demo" } });
    } catch {
      setError("We couldn't place your order right now. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif-display text-3xl font-semibold text-ink">Checkout</h1>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          {/* Address */}
          <section className="rounded-2xl border border-border bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-serif-display text-lg font-semibold">
                <MapPin size={18} className="text-primary" /> Delivery Address
              </h2>
              <button
                onClick={() => setShowNewAddress((v) => !v)}
                className="flex items-center gap-1 text-xs font-semibold text-primary"
              >
                <Plus size={14} /> Add New
              </button>
            </div>

            <div className="space-y-3">
              {addressStore.addresses.map((a) => (
                <label
                  key={a.id}
                  className={cn(
                    "block cursor-pointer rounded-xl border p-4 text-sm",
                    selectedAddressId === a.id ? "border-primary bg-[#fdf9fb]" : "border-border"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      checked={selectedAddressId === a.id}
                      onChange={() => setSelectedAddressId(a.id)}
                      className="mt-1 accent-primary"
                    />
                    <div>
                      <p className="font-semibold text-ink">{a.full_name} <span className="ml-2 rounded-full bg-cream-dark px-2 py-0.5 text-[10px] font-semibold text-ink/70">{a.label}</span></p>
                      <p className="mt-1 text-ink/70">{a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} - {a.pincode}</p>
                      <p className="text-ink/70">Phone: {a.phone}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {showNewAddress && (
              <div className="mt-5 space-y-3 rounded-xl border border-dashed border-border p-4">
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Full Name" value={newAddress.full_name} onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })} className={inputCls} />
                  <input placeholder="Phone Number" value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} className={inputCls} />
                </div>
                <input placeholder="Address Line 1" value={newAddress.line1} onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })} className={inputCls} />
                <input placeholder="Address Line 2 (optional)" value={newAddress.line2} onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })} className={inputCls} />
                <div className="grid grid-cols-3 gap-3">
                  <input placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className={inputCls} />
                  <input placeholder="State" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} className={inputCls} />
                  <input placeholder="Pincode" value={newAddress.pincode} onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value.replace(/\D/g, "") })} maxLength={6} className={inputCls} />
                </div>
                <div className="flex gap-2">
                  <select value={newAddress.label} onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })} className={inputCls + " w-32"}>
                    <option>Home</option>
                    <option>Work</option>
                    <option>Other</option>
                  </select>
                  <button onClick={saveNewAddress} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white">
                    Save Address
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Payment */}
          <section className="rounded-2xl border border-border bg-white p-6">
            <h2 className="font-serif-display text-lg font-semibold">Payment Method</h2>
            <div className="mt-4 space-y-3">
              {[
                { id: "cod", label: "Cash on Delivery", desc: "Pay when your order arrives." },
                { id: "demo_upi", label: "UPI (Demo)", desc: "Simulated UPI flow for demo purposes only — no real payment is processed." },
                { id: "demo_card", label: "Credit / Debit Card (Demo)", desc: "Simulated card flow — we never collect real card numbers or CVV." },
              ].map((m) => (
                <label
                  key={m.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm",
                    paymentMethod === m.id ? "border-primary bg-[#fdf9fb]" : "border-border"
                  )}
                >
                  <input
                    type="radio"
                    checked={paymentMethod === m.id}
                    onChange={() => setPaymentMethod(m.id as any)}
                    className="mt-1 accent-primary"
                  />
                  <div>
                    <p className="font-semibold text-ink">{m.label}</p>
                    <p className="mt-0.5 text-xs text-muted">{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
              <ShieldCheck size={15} className="mt-0.5 shrink-0" />
              This is a demo storefront. No real payment gateway is connected
              and no card data is ever collected or stored.
            </p>
          </section>
        </div>

        {/* Summary */}
        <div className="h-fit space-y-5 rounded-2xl border border-border bg-white p-6">
          <h2 className="font-serif-display text-lg font-semibold">Order Summary</h2>
          <div className="max-h-56 space-y-3 overflow-y-auto">
            {lines.map((l) => (
              <div key={`${l.product.id}-${l.variant.id}`} className="flex gap-3 text-sm">
                <img src={l.product.images[0]} className="h-14 w-12 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="line-clamp-2 font-medium text-ink">{l.product.name}</p>
                  <p className="text-xs text-muted">{l.variant.size} / {l.variant.color} × {l.item.quantity}</p>
                </div>
                <p className="font-semibold text-ink">{formatINR(l.product.price * l.item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="Coupon code (try WELCOME10)"
              className={inputCls}
            />
            <button onClick={applyCoupon} className="shrink-0 rounded-xl border border-primary px-4 text-sm font-semibold text-primary">
              Apply
            </button>
          </div>
          {couponError && <p className="text-xs text-red-600">{couponError}</p>}
          {appliedCoupon && (
            <p className="text-xs font-semibold text-green-700">
              "{appliedCoupon}" applied — {COUPONS[appliedCoupon].label}
            </p>
          )}

          <div className="space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between text-ink/80"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
            <div className="flex justify-between text-ink/80"><span>Shipping</span><span>{shipping === 0 ? "FREE" : formatINR(shipping)}</span></div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-green-700"><span>Coupon Discount</span><span>-{formatINR(couponDiscount)}</span></div>
            )}
            <div className="flex justify-between border-t border-border pt-3 text-base font-bold text-ink">
              <span>Total</span><span>{formatINR(total)}</span>
            </div>
          </div>

          {error && <p className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</p>}

          <button
            onClick={handlePlaceOrder}
            disabled={placing || lines.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-white transition hover:bg-primary-dark disabled:opacity-60"
          >
            {placing && <Loader2 size={16} className="animate-spin" />}
            {placing ? "Placing Order..." : `Place Order • ${formatINR(total)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "h-11 w-full rounded-xl border border-border px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10";
