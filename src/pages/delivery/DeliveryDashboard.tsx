import { useEffect, useState } from "react";
import { Loader2, LogOut, MapPin, Package } from "lucide-react";
import { isSchemaReady, supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";
import type { Order, OrderStatus } from "../../lib/types";
import { formatINR } from "../../utils/format";
import { STATUS_LABELS, statusColor } from "../../components/orderStatus";

const DELIVERY_TRANSITIONS: Record<string, OrderStatus[]> = {
  shipped: ["out_for_delivery"],
  out_for_delivery: ["delivered"],
};

export default function DeliveryDashboard() {
  const { user, profile, signOut } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbReady, setDbReady] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    if (!user) return;
    setLoading(true);
    const ready = await isSchemaReady();
    setDbReady(ready);
    if (ready) {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("assigned_delivery_id", user.id)
        .order("created_at", { ascending: false });
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
      setOrders([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [user?.id]);

  async function updateStatus(order: Order, status: OrderStatus) {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", order.id)
      .eq("assigned_delivery_id", user?.id);
    if (error) setMessage(`Update failed: ${error.message}`);
    else {
      setMessage("Delivery status updated.");
      load();
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="flex items-center justify-between border-b border-border bg-white px-6 py-4">
        <div>
          <p className="font-serif-display text-lg font-semibold text-ink">Daily Drape — Delivery</p>
          <p className="text-xs text-muted">{profile?.full_name ?? profile?.email}</p>
        </div>
        <button onClick={signOut} className="flex items-center gap-1.5 text-sm font-semibold text-red-600">
          <LogOut size={15} /> Sign Out
        </button>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="font-serif-display text-2xl font-semibold text-ink">Assigned Deliveries</h1>

        {!dbReady && (
          <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
            The delivery workflow requires the Supabase schema and RLS
            policies in sql/schema.sql and sql/policies.sql (specifically the
            `orders.assigned_delivery_id` column and delivery-role policies)
            to be applied. Until then, no real assignments can be shown here
            — nothing is fabricated.
          </p>
        )}
        {message && <p className="mt-3 rounded-xl bg-cream-dark p-3 text-xs text-ink">{message}</p>}

        {loading ? (
          <Loader2 className="mt-8 animate-spin text-primary" />
        ) : orders.length === 0 ? (
          <div className="mt-10 text-center text-sm text-muted">
            <Package className="mx-auto mb-3 text-muted" size={32} />
            No orders are currently assigned to you.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {orders.map((o) => (
              <div key={o.id} className="rounded-2xl border border-border bg-white p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink">#{o.id.slice(0, 8).toUpperCase()}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(o.status)}`}>
                    {STATUS_LABELS[o.status]}
                  </span>
                </div>
                <p className="mt-2 flex items-start gap-2 text-sm text-ink/75">
                  <MapPin size={15} className="mt-0.5 shrink-0 text-primary" />
                  {o.address.full_name}, {o.address.line1}, {o.address.city}, {o.address.state} - {o.address.pincode} (Ph: {o.address.phone})
                </p>
                <p className="mt-1 text-sm text-ink/70">Amount to collect: {o.paymentMethod === "cod" ? formatINR(o.total) : "Prepaid"}</p>

                {DELIVERY_TRANSITIONS[o.status] && (
                  <div className="mt-3 flex gap-2">
                    {DELIVERY_TRANSITIONS[o.status].map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(o, s)}
                        className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white"
                      >
                        Mark as {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
