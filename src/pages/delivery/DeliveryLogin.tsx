import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Truck } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";
import { friendlyAuthError } from "../auth/Login";

export default function DeliveryLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError || !data.user) {
        setError(friendlyAuthError(signInError?.message ?? "Login failed."));
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError || !profile || profile.role !== "delivery") {
        await supabase.auth.signOut();
        setError(
          "This sign-in is reserved for Daily Drape delivery partners. If you believe this is a mistake, contact support@dailydrape.example."
        );
        return;
      }

      await useAuthStore.getState().loadProfile();
      navigate("/delivery");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#4c2638] via-primary to-primary-light px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl sm:p-10">
        <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-[#f6edf1] text-primary">
          <Truck size={26} />
        </div>
        <h1 className="text-center font-serif-display text-2xl font-semibold text-ink">
          Delivery Partner Login
        </h1>
        <p className="mt-2 text-center text-sm text-muted">
          Sign in with your delivery partner credentials to view assigned
          orders.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div>
            <label className="mb-2 block text-[13px] font-semibold text-ink">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-[48px] w-full rounded-xl border border-border px-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </div>
          <div>
            <label className="mb-2 block text-[13px] font-semibold text-ink">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-[48px] w-full rounded-xl border border-border px-4 pr-12 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center text-muted"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-white transition hover:bg-primary-dark disabled:opacity-70"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          Delivery accounts are created by Daily Drape admins only. Not a
          delivery partner? <Link to="/login" className="font-semibold text-primary">Customer sign in</Link>
        </p>
      </div>
    </main>
  );
}
