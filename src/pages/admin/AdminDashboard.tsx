import { useEffect, useState } from "react";
import { IndianRupee, Package, ShoppingCart, Users } from "lucide-react";
import { fetchProducts } from "../../lib/catalog";
import { getAllLocalOrders } from "../../lib/orders";
import { isSchemaReady, supabase } from "../../lib/supabase";
import { formatINR } from "../../utils/format";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, customers: 0 });
  const [demo, setDemo] = useState(true);

  useEffect(() => {
    (async () => {
      const ready = await isSchemaReady();
      setDemo(!ready);
      const { data: products } = await fetchProducts();

      if (ready) {
        const [{ count: orderCount }, { data: orderRows }, { count: profileCount }] = await Promise.all([
          supabase.from("orders").select("*", { count: "exact", head: true }),
          supabase.from("orders").select("total"),
          supabase.from("profiles").select("*", { count: "exact", head: true }),
        ]);
        const revenue = (orderRows ?? []).reduce((s: number, o: any) => s + Number(o.total ?? 0), 0);
        setStats({ products: products.length, orders: orderCount ?? 0, revenue, customers: profileCount ?? 0 });
      } else {
        const localOrders = getAllLocalOrders();
        setStats({
          products: products.length,
          orders: localOrders.length,
          revenue: localOrders.reduce((s, o) => s + o.total, 0),
          customers: new Set(localOrders.map((o) => o.userId)).size,
        });
      }
    })();
  }, []);

  const cards = [
    { label: "Total Products", value: stats.products, icon: Package },
    { label: "Total Orders", value: stats.orders, icon: ShoppingCart },
    { label: "Revenue", value: formatINR(stats.revenue), icon: IndianRupee },
    { label: "Customers", value: stats.customers, icon: Users },
  ];

  return (
    <div>
      <h1 className="font-serif-display text-2xl font-semibold text-ink">Dashboard</h1>
      {demo && (
        <p className="mt-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
          Demo mode: the Supabase schema in <code>sql/schema.sql</code>{" "}
          doesn't appear to be applied yet, so these numbers reflect local
          seed/demo data only, not a real database.
        </p>
      )}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-white p-5">
            <c.icon className="text-primary" size={20} />
            <p className="mt-3 text-2xl font-bold text-ink">{c.value}</p>
            <p className="text-xs text-muted">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-white p-6 text-sm text-ink/80">
        <h2 className="font-serif-display text-lg font-semibold text-ink">Setup checklist</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5">
          <li>Run <code>sql/schema.sql</code> in the Supabase SQL editor.</li>
          <li>Run <code>sql/policies.sql</code> to enable Row Level Security.</li>
          <li>Run <code>sql/seed.sql</code> to load starter categories/products (optional).</li>
          <li>Promote your admin account using the instructions in README.md.</li>
          <li>Configure Storage buckets with <code>sql/storage.sql</code> for product images.</li>
        </ul>
      </div>
    </div>
  );
}
