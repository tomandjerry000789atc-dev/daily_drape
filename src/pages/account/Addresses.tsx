import { useState } from "react";
import { Plus, Star, Trash2 } from "lucide-react";
import { useAddressStore } from "../../store/addressStore";
import { useAuthStore } from "../../store/authStore";

const empty = { label: "Home", full_name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" };

export default function Addresses() {
  const { user } = useAuthStore();
  const store = useAddressStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  function handleSave() {
    if (!form.full_name || !form.phone || !form.line1 || !form.city || !form.state || !/^\d{6}$/.test(form.pincode)) {
      setError("Please fill all required fields with a valid 6-digit pincode.");
      return;
    }
    store.add({ ...form, user_id: user?.id ?? "guest", is_default: store.addresses.length === 0 });
    setForm(empty);
    setShowForm(false);
    setError("");
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif-display text-2xl font-semibold text-ink">Saved Addresses</h1>
          <p className="mt-1 text-sm text-muted">Manage your delivery addresses.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Plus size={15} /> Add Address
        </button>
      </div>

      {showForm && (
        <div className="mt-6 space-y-3 rounded-xl border border-dashed border-border p-4">
          {error && <p className="rounded-lg bg-red-50 p-2.5 text-xs text-red-700">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className={inputCls} />
            <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
          </div>
          <input placeholder="Address Line 1" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} className={inputCls} />
          <input placeholder="Address Line 2 (optional)" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} className={inputCls} />
          <div className="grid grid-cols-3 gap-3">
            <input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputCls} />
            <input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className={inputCls} />
            <input placeholder="Pincode" maxLength={6} value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "") })} className={inputCls} />
          </div>
          <div className="flex gap-2">
            <select value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className={inputCls + " w-32"}>
              <option>Home</option>
              <option>Work</option>
              <option>Other</option>
            </select>
            <button onClick={handleSave} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white">
              Save Address
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {store.addresses.length === 0 && !showForm && (
          <p className="text-sm text-muted">You haven't saved any addresses yet.</p>
        )}
        {store.addresses.map((a) => (
          <div key={a.id} className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
            <div>
              <p className="flex items-center gap-2 font-semibold text-ink">
                {a.full_name}
                <span className="rounded-full bg-cream-dark px-2 py-0.5 text-[10px] font-semibold text-ink/70">{a.label}</span>
                {a.is_default && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">Default</span>}
              </p>
              <p className="mt-1 text-sm text-ink/70">{a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} - {a.pincode}</p>
              <p className="text-sm text-ink/70">Phone: {a.phone}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              {!a.is_default && (
                <button onClick={() => store.setDefault(a.id)} className="grid h-8 w-8 place-items-center rounded-full border border-border text-muted hover:text-primary" title="Set as default">
                  <Star size={14} />
                </button>
              )}
              <button onClick={() => store.remove(a.id)} className="grid h-8 w-8 place-items-center rounded-full border border-border text-muted hover:text-red-600" title="Delete">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const inputCls = "h-11 w-full rounded-xl border border-border px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10";
