import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getAllLocalOrders } from "../../lib/orders";
import { isSchemaReady, supabase } from "../../lib/supabase";
import type { Order, OrderStatus } from "../../lib/types";
import { formatINR } from "../../utils/format";
import { STATUS_LABELS, statusColor } from "../../components/orderStatus";

const STATUS_OPTIONS: OrderStatus[] = [
  "placed",
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbReady, setDbReady] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const ready = await isSchemaReady();
    setDbReady(ready);
    if (ready) {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (!error && data) {
        setOrders(
          data.map((row: any) => ({
            id: row.id,
            userId: row.user_id,
            items: row.items ?? [],
            address: row.address,
            subtotal: Number(row.subtotal),
            discount: Number(row.discount ?? 0),
            shipping: Number(row.shipping ?? 0),
            total: Number(row.total),
            paymentMethod: row.payment_method,
            paymentStatus: row.payment_status,
            status: row.status,
            trackingNumber: row.tracking_number,
            createdAt: row.created_at,
            statusHistory: row.status_history ?? [],
          }))
        );
      }
    } else {
      setOrders(getAllLocalOrders());
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(order: Order, status: OrderStatus) {
    if (!dbReady) {
      setMessage("Cannot update: connect Supabase to manage real orders (admin-only via RLS).");
      return;
    }
    const { error } = await supabase.from("orders").update({ status }).eq("id", order.id);
    if (error) setMessage(`Update failed: ${error.message}`);
    else {
      setMessage("Order status updated.");
      load();
    }
  }

  return (
    <div>
      <h1 className="font-serif-display text-2xl font-semibold text-ink">Orders</h1>
      {!dbReady && !loading && (
        <p className="mt-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
          Showing orders saved locally in this browser (demo mode). Connect
          Supabase with an admin-scoped RLS policy to manage real customer
          orders here.
        </p>
      )}
      {message && <p className="mt-2 rounded-xl bg-cream-dark p-3 text-xs text-ink">{message}</p>}

      {loading ? (
        <Loader2 className="mt-8 animate-spin text-primary" />
      ) : orders.length === 0 ? (
        <p className="mt-6 text-sm text-muted">No orders yet.</p>
      ) : (
        <div className="mt-5 space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="rounded-2xl border border-border bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">#{o.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-muted">{new Date(o.createdAt).toLocaleString()} • {o.items.length} item(s)</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(o.status)}`}>
                    {STATUS_LABELS[o.status]}
                  </span>
                  <span className="font-serif-display font-semibold text-ink">{formatINR(o.total)}</span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-muted">Update status:</span>
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(o, s)}
                    disabled={o.status === s}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      o.status === s ? "cursor-default border-primary bg-primary text-white" : "border-border text-ink hover:border-primary"
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
