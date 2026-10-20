import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import AuthShell from "../../components/auth/AuthShell";
import { supabase } from "../../lib/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError("");
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) {
        setError(resetError.message);
        return;
      }
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="ACCOUNT RECOVERY"
      title="Forgot your"
      italicWord="password?"
      tagline="No worries — we'll send a secure link to your email so you can set a new password."
    >
      <p className="mb-2 text-[11px] font-bold tracking-[2.5px] text-primary">RESET PASSWORD</p>
      <h2 className="font-serif-display text-4xl font-semibold leading-tight text-ink">
        Reset your password
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Enter the email associated with your account and we'll send a
        password reset link.
      </p>

      {sent ? (
        <div className="mt-8 rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-700">
          📧 If an account exists for <strong>{email}</strong>, a password
          reset email has been sent. Please check your inbox (and spam
          folder) and follow the link to set a new password.
          <p className="mt-3 text-xs text-green-700/80">
            Note: this requires the Supabase project's Auth redirect URL
            to include <code>{window.location.origin}/reset-password</code>.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div>
            <label className="mb-2 block text-[13px] font-semibold text-ink">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your account email"
              className="h-[52px] w-full rounded-xl border border-border px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex h-[53px] w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-white transition hover:bg-primary-dark disabled:opacity-70"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      )}

      <p className="mt-7 text-center text-[13px] text-muted">
        Remembered your password?
        <Link to="/login" className="ml-1 font-bold text-primary">Sign in</Link>
      </p>
    </AuthShell>
  );
}
