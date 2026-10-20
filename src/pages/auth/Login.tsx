import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Truck } from "lucide-react";
import AuthShell from "../../components/auth/AuthShell";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";

export default function Login() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) navigate("/account", { replace: true });
  }, [user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError("");
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError(friendlyAuthError(signInError.message));
        return;
      }
      navigate("/account");
    } catch {
      setError("Something went wrong while signing in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="EVERYDAY • ELEGANT • YOU"
      title="Dress your"
      italicWord="everyday."
      tagline="Discover styles that feel like you. From everyday essentials to outfits made for special moments."
    >
      <p className="mb-2 text-[11px] font-bold tracking-[2.5px] text-primary">WELCOME BACK</p>
      <h2 className="font-serif-display text-4xl font-semibold leading-tight text-ink">
        Sign in to your account
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Continue your fashion journey with Daily Drape.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="mb-2 block text-[13px] font-semibold text-ink">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="h-[52px] w-full rounded-xl border border-border px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="password" className="block text-[13px] font-semibold text-ink">
              Password
            </label>
            <Link to="/forgot-password" className="text-xs font-semibold text-primary">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="h-[52px] w-full rounded-xl border border-border px-4 pr-12 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center text-muted"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex h-[53px] w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="my-7 flex items-center gap-3.5">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[10px] tracking-[1.5px] text-muted">OR</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Link
        to="/delivery/login"
        className="flex min-h-[65px] items-center gap-3.5 rounded-xl border border-border px-4 py-3 text-left transition hover:border-primary hover:bg-[#fdf9fb]"
      >
        <span className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[10px] bg-[#f6edf1]">
          <Truck size={18} className="text-primary" />
        </span>
        <span className="flex-1">
          <strong className="block text-[13px] text-ink">Delivery Person Login</strong>
          <small className="text-[11px] text-muted">Access delivery dashboard</small>
        </span>
        <span className="text-xl text-primary">→</span>
      </Link>

      <p className="mt-7 text-center text-[13px] text-muted">
        Don't have an account?
        <Link to="/register" className="ml-1 font-bold text-primary">
          Create account
        </Link>
      </p>

      <p className="mt-7 text-center text-[10px] leading-relaxed text-[#aaa]">
        By continuing, you agree to our{" "}
        <Link to="/terms" className="text-[#777]">Terms</Link> and{" "}
        <Link to="/privacy" className="text-[#777]">Privacy Policy</Link>.
      </p>
    </AuthShell>
  );
}

export function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) {
    return "Incorrect email or password. Please try again.";
  }
  if (m.includes("email not confirmed")) {
    return "Please verify your email address before signing in. Check your inbox for the confirmation link.";
  }
  if (m.includes("user already registered")) {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (m.includes("password should be at least")) {
    return "Password must be at least 6 characters long.";
  }
  if (m.includes("rate limit")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  return message;
}
