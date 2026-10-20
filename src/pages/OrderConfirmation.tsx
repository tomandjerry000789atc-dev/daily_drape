import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import { getOrderById } from "../lib/orders";
import type { Order } from "../lib/types";
import { formatINR } from "../utils/format";

export default function OrderConfirmation() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const demo = (location.state as any)?.demo;

  useEffect(() => {
    if (!id) return;
    getOrderById(id).then((o) => {
      setOrder(o);
      setLoading(false);
    });
  }, [id]);

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
        <Link to="/" className="mt-5 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <CheckCircle2 className="mx-auto mb-4 text-green-600" size={56} />
      <h1 className="font-serif-display text-3xl font-semibold text-ink">Order Placed Successfully!</h1>
      <p className="mt-2 text-sm text-muted">
        Thank you for shopping with Daily Drape. A confirmation has been recorded for order <strong>#{order.id.slice(0, 8).toUpperCase()}</strong>.
      </p>

      {demo && (
        <p className="mx-auto mt-4 max-w-md rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
          Demo mode: this order was saved locally in your browser because the
          live Supabase <code>orders</code> table isn't connected yet. See
          sql/schema.sql to enable real persistence.
        </p>
      )}

      <div className="mt-8 rounded-2xl border border-border bg-white p-6 text-left">
        <div className="flex justify-between text-sm">
          <span className="text-muted">Tracking Number</span>
          <span className="font-semibold text-ink">{order.trackingNumber}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-muted">Payment Method</span>
          <span className="font-semibold capitalize text-ink">{order.paymentMethod.replace("_", " ")}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-muted">Total Paid</span>
          <span className="font-semibold text-ink">{formatINR(order.total)}</span>
        </div>
      </div>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link to={`/orders/${order.id}`} className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white">
          View Order Details
        </Link>
        <Link to="/products" className="rounded-full border border-border px-7 py-3 text-sm font-semibold text-ink">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
