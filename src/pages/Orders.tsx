import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Package } from "lucide-react";
import { getOrdersForUser } from "../lib/orders";
import { useAuthStore } from "../store/authStore";
import type { Order } from "../lib/types";
import { formatINR } from "../utils/format";
import { STATUS_LABELS, statusColor } from "../components/orderStatus";

export default function Orders() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getOrdersForUser(user.id).then((o) => {
      setOrders(o);
      setLoading(false);
    });
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-serif-display text-3xl font-semibold text-ink">My Orders</h1>

      {orders.length === 0 ? (
        <div className="mx-auto mt-14 max-w-sm text-center">
          <Package className="mx-auto mb-4 text-muted" size={40} />
          <p className="font-serif-display text-xl font-semibold text-ink">No orders yet</p>
          <p className="mt-2 text-sm text-muted">When you place an order, it'll show up here.</p>
          <Link to="/products" className="mt-6 inline-block rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((o) => (
            <Link
              key={o.id}
              to={`/orders/${o.id}`}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-5 transition hover:border-primary sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {o.items.slice(0, 3).map((it, i) => (
                    <img key={i} src={it.image} className="h-14 w-12 rounded-lg border-2 border-white object-cover" />
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">#{o.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-muted">{new Date(o.createdAt).toLocaleDateString()} • {o.items.length} item(s)</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-6 sm:justify-end">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(o.status)}`}>
                  {STATUS_LABELS[o.status]}
                </span>
                <span className="font-serif-display font-semibold text-ink">{formatINR(o.total)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
