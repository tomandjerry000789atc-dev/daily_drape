import { useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { fetchProducts } from "../../lib/catalog";
import { isSchemaReady, supabase } from "../../lib/supabase";
import type { Product } from "../../lib/types";
import { formatINR } from "../../utils/format";

const emptyForm = {
  name: "",
  slug: "",
  brand: "",
  category: "women",
  price: "",
  mrp: "",
  description: "",
  image_url: "",
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [dbReady, setDbReady] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const ready = await isSchemaReady();
    setDbReady(ready);
    const res = await fetchProducts();
    setProducts(res.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  function startEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      slug: p.slug,
      brand: p.brand,
      category: p.category,
      price: String(p.price),
      mrp: String(p.mrp),
      description: p.description,
      image_url: p.images[0] ?? "",
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dbReady) {
      setMessage(
        "Cannot save: the Supabase `products` table isn't reachable yet. Apply sql/schema.sql and sql/policies.sql first."
      );
      return;
    }
    setSaving(true);
    setMessage("");
    const payload = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
      brand: form.brand,
      category: form.category,
      price: Number(form.price),
      mrp: Number(form.mrp || form.price),
      description: form.description,
      image_url: form.image_url,
      is_active: true,
    };
    const { error } = editingId
      ? await supabase.from("products").update(payload).eq("id", editingId)
      : await supabase.from("products").insert(payload);

    if (error) {
      setMessage(`Save failed: ${error.message}`);
    } else {
      setMessage(editingId ? "Product updated." : "Product created.");
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      load();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!dbReady) {
      setMessage("Cannot delete: database not connected.");
      return;
    }
    if (!confirm("Delete this product? This cannot be undone.")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) setMessage(`Delete failed: ${error.message}`);
    else {
      setMessage("Product deleted.");
      load();
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif-display text-2xl font-semibold text-ink">Products</h1>
        <button
          onClick={() => {
            setEditingId(null);
            setForm(emptyForm);
            setShowForm((v) => !v);
          }}
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Plus size={15} /> Add Product
        </button>
      </div>

      {!dbReady && !loading && (
        <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
          Showing read-only demo catalog data. Connect Supabase (sql/schema.sql
          + sql/policies.sql) to enable creating, editing, or deleting real
          products here.
        </p>
      )}
      {message && <p className="mt-3 rounded-xl bg-cream-dark p-3 text-xs text-ink">{message}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 gap-3 rounded-2xl border border-border bg-white p-5 sm:grid-cols-2">
          <input required placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
          <input placeholder="Slug (auto if blank)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputCls} />
          <input required placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className={inputCls} />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
            {["women", "men", "kids", "accessories"].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input required type="number" placeholder="Price (₹)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputCls} />
          <input type="number" placeholder="MRP (₹)" value={form.mrp} onChange={(e) => setForm({ ...form, mrp: e.target.value })} className={inputCls} />
          <input placeholder="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className={inputCls + " sm:col-span-2"} />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls + " sm:col-span-2"} rows={3} />
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
              {saving && <Loader2 size={14} className="animate-spin" />} {editingId ? "Update" : "Create"} Product
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-ink">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="relative mt-5 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="h-10 w-full rounded-full border border-border pl-9 pr-3 text-sm outline-none focus:border-primary"
        />
      </div>

      {loading ? (
        <div className="mt-10 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border bg-cream text-xs text-muted">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border/60 last:border-0">
                  <td className="flex items-center gap-3 px-4 py-3">
                    <img src={p.images[0]} className="h-12 w-10 rounded-lg object-cover" />
                    <span className="font-medium text-ink">{p.name}</span>
                  </td>
                  <td className="px-4 py-3 capitalize text-ink/70">{p.category}</td>
                  <td className="px-4 py-3 text-ink/70">{formatINR(p.price)}</td>
                  <td className="px-4 py-3 text-ink/70">{p.variants.reduce((s, v) => s + v.stock, 0)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => startEdit(p)} className="grid h-8 w-8 place-items-center rounded-full border border-border text-muted hover:text-primary">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="grid h-8 w-8 place-items-center rounded-full border border-border text-muted hover:text-red-600">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const inputCls = "h-11 w-full rounded-xl border border-border px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10";
