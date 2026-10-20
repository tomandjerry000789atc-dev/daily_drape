import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import AuthShell from "../../components/auth/AuthShell";
import { supabase } from "../../lib/supabase";

/**
 * Handles the Supabase password-recovery deep link.
 * When a user clicks the email link, Supabase redirects back here with a
 * recovery token in the URL; the JS client (detectSessionInUrl: true)
 * exchanges it for a temporary "recovery" session automatically and fires
 * a PASSWORD_RECOVERY auth event, which we listen for below.
 */
export default function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    // Also check if a session already exists (e.g. hash was processed before mount)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch {
      setError("Something went wrong updating your password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="ACCOUNT RECOVERY"
      title="Set a new"
      italicWord="password."
      tagline="Choose a strong new password to keep your Daily Drape account secure."
    >
      <p className="mb-2 text-[11px] font-bold tracking-[2.5px] text-primary">NEW PASSWORD</p>
      <h2 className="font-serif-display text-4xl font-semibold leading-tight text-ink">
        Create a new password
      </h2>

      {!ready && !success && (
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
          Waiting for a valid password-recovery link. Please open this page
          using the link from your password-reset email. If you arrived
          here directly, request a new link from the{" "}
          <Link to="/forgot-password" className="font-semibold underline">
            forgot password
          </Link>{" "}
          page.
        </div>
      )}

      {success ? (
        <div className="mt-8 rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-700">
          Password updated successfully! Redirecting you to sign in...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div>
            <label className="mb-2 block text-[13px] font-semibold text-ink">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                disabled={!ready}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a new password"
                className="h-[52px] w-full rounded-xl border border-border px-4 pr-12 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-cream-dark"
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
          <div>
            <label className="mb-2 block text-[13px] font-semibold text-ink">Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              required
              disabled={!ready}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter new password"
              className="h-[52px] w-full rounded-xl border border-border px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-cream-dark"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !ready}
            className="flex h-[53px] w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
