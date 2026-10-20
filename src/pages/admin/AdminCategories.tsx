import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { brands as seedBrands } from "../../lib/catalog";
import { fetchCategories } from "../../lib/catalog";
import { isSchemaReady, supabase } from "../../lib/supabase";
import type { Category } from "../../lib/types";

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbReady, setDbReady] = useState(false);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    setDbReady(await isSchemaReady());
    const res = await fetchCategories();
    setCategories(res.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!dbReady) {
      setMessage("Cannot save: connect Supabase first (sql/schema.sql + sql/policies.sql).");
      return;
    }
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const { error } = await supabase.from("categories").insert({ name, slug, image });
    if (error) setMessage(`Failed: ${error.message}`);
    else {
      setMessage("Category added.");
      setName("");
      setImage("");
      load();
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif-display text-2xl font-semibold text-ink">Categories</h1>
        {!dbReady && !loading && (
          <p className="mt-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
            Showing demo categories. Connect Supabase to manage real
            categories here.
          </p>
        )}
        {message && <p className="mt-2 rounded-xl bg-cream-dark p-3 text-xs text-ink">{message}</p>}

        <form onSubmit={handleAddCategory} className="mt-4 flex flex-wrap gap-2">
          <input required placeholder="Category name" value={name} onChange={(e) => setName(e.target.value)} className="h-10 flex-1 min-w-[160px] rounded-xl border border-border px-3 text-sm outline-none focus:border-primary" />
          <input placeholder="Image URL" value={image} onChange={(e) => setImage(e.target.value)} className="h-10 flex-1 min-w-[160px] rounded-xl border border-border px-3 text-sm outline-none focus:border-primary" />
          <button type="submit" className="flex items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-white">
            <Plus size={14} /> Add
          </button>
        </form>

        {loading ? (
          <Loader2 className="mt-6 animate-spin text-primary" />
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {categories.map((c) => (
              <div key={c.id} className="overflow-hidden rounded-xl border border-border bg-white">
                <img src={c.image} className="h-24 w-full object-cover" />
                <p className="px-3 py-2 text-sm font-medium text-ink">{c.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-serif-display text-xl font-semibold text-ink">Brands</h2>
        <p className="mt-1 text-xs text-muted">
          Brand management requires a connected `brands` table (see
          sql/schema.sql). Showing current demo brand list below.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {seedBrands.map((b) => (
            <span key={b.id} className="rounded-full border border-border bg-white px-4 py-2 text-sm text-ink">{b.name}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
