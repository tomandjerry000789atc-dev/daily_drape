import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Check, Loader2, MapPin, Truck } from "lucide-react";
import { cancelOrder, getOrderById } from "../lib/orders";
import type { Order } from "../lib/types";
import { formatINR } from "../utils/format";
import { STATUS_LABELS, STATUS_ORDER, statusColor } from "../components/orderStatus";
import { cn } from "../utils/cn";

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!id) return;
    getOrderById(id).then((o) => {
      setOrder(o);
      setLoading(false);
    });
  }, [id]);

  async function handleCancel() {
    if (!order) return;
    setCancelling(true);
    const ok = await cancelOrder(order.id);
    if (ok) {
      const refreshed = await getOrderById(order.id);
      setOrder(refreshed);
    }
    setCancelling(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-serif-display text-2xl font-semibold">Order not found</h1>
        <Link to="/orders" className="mt-5 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white">
          Back to Orders
        </Link>
      </div>
    );
  }

  const currentIndex = STATUS_ORDER.indexOf(order.status);
  const eligibleForCancel = ["placed", "confirmed", "packed"].includes(order.status);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif-display text-2xl font-semibold text-ink">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="mt-1 text-sm text-muted">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(order.status)}`}>
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      {/* Timeline */}
      {order.status !== "cancelled" ? (
        <div className="mt-8 flex items-center justify-between overflow-x-auto rounded-2xl border border-border bg-white p-6">
          {STATUS_ORDER.map((s, i) => (
            <div key={s} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-2 text-center">
                <div
                  className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-full border-2",
                    i <= currentIndex ? "border-primary bg-primary text-white" : "border-border text-muted"
                  )}
                >
                  {i <= currentIndex ? <Check size={15} /> : i + 1}
                </div>
                <span className="w-20 text-[11px] font-medium text-ink/70">{STATUS_LABELS[s]}</span>
              </div>
              {i < STATUS_ORDER.length - 1 && (
                <div className={cn("mx-2 h-0.5 flex-1", i < currentIndex ? "bg-primary" : "bg-border")} />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          This order was cancelled.
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-5">
          <h3 className="flex items-center gap-2 font-semibold text-ink"><MapPin size={16} className="text-primary" /> Delivery Address</h3>
          <p className="mt-2 text-sm text-ink/75">
            {order.address.full_name}<br />
            {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}<br />
            {order.address.city}, {order.address.state} - {order.address.pincode}<br />
            Phone: {order.address.phone}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <h3 className="flex items-center gap-2 font-semibold text-ink"><Truck size={16} className="text-primary" /> Tracking</h3>
          <p className="mt-2 text-sm text-ink/75">Tracking Number: <strong>{order.trackingNumber ?? "Not yet assigned"}</strong></p>
          <p className="mt-1 text-sm text-ink/75">Payment: <span className="capitalize">{order.paymentMethod.replace("_", " ")}</span> ({order.paymentStatus})</p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-white p-6">
        <h3 className="font-semibold text-ink">Items</h3>
        <div className="mt-4 space-y-4">
          {order.items.map((it, i) => (
            <div key={i} className="flex gap-4 text-sm">
              <img src={it.image} className="h-16 w-14 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="font-medium text-ink">{it.name}</p>
                <p className="text-xs text-muted">{it.size} / {it.color} × {it.quantity}</p>
              </div>
              <p className="font-semibold text-ink">{formatINR(it.price * it.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-1.5 border-t border-border pt-4 text-sm">
          <div className="flex justify-between text-ink/70"><span>Subtotal</span><span>{formatINR(order.subtotal)}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-green-700"><span>Discount</span><span>-{formatINR(order.discount)}</span></div>}
          <div className="flex justify-between text-ink/70"><span>Shipping</span><span>{order.shipping === 0 ? "FREE" : formatINR(order.shipping)}</span></div>
          <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-ink"><span>Total</span><span>{formatINR(order.total)}</span></div>
        </div>
      </div>

      {eligibleForCancel && (
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="mt-6 rounded-full border border-red-300 px-6 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
        >
          {cancelling ? "Cancelling..." : "Cancel Order"}
        </button>
      )}
    </div>
  );
}
