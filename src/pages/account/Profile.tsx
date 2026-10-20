import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";

export default function Profile() {
  const { profile, user, loadProfile } = useAuthStore();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setPhone(profile?.phone ?? "");
  }, [profile]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .upsert({ id: user.id, full_name: fullName, phone, email: user.email }, { onConflict: "id" });
      if (updateError) {
        setError(
          "Could not save your profile to the database (it may not be configured yet). Your changes were not persisted."
        );
        return;
      }
      await supabase.auth.updateUser({ data: { full_name: fullName, phone } });
      await loadProfile();
      setMessage("Profile updated successfully.");
    } catch {
      setError("Something went wrong while saving your profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-6 sm:p-8">
      <h1 className="font-serif-display text-2xl font-semibold text-ink">My Profile</h1>
      <p className="mt-1 text-sm text-muted">Manage your personal information.</p>

      <form onSubmit={handleSave} className="mt-6 max-w-md space-y-4">
        {message && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>}
        {error && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{error}</p>}

        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">Full Name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-11 w-full rounded-xl border border-border px-4 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">Email Address</label>
          <input
            value={user?.email ?? ""}
            disabled
            className="h-11 w-full rounded-xl border border-border bg-cream-dark px-4 text-sm text-muted"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">Mobile Number</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            maxLength={10}
            className="h-11 w-full rounded-xl border border-border px-4 text-sm outline-none focus:border-primary"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
