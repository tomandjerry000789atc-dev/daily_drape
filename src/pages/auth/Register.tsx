import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import AuthShell from "../../components/auth/AuthShell";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";
import { friendlyAuthError } from "./Login";

export default function Register() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) navigate("/account", { replace: true });
  }, [user, navigate]);

  function validate(): string | null {
    if (!fullName.trim()) return "Please enter your full name.";
    if (!email.trim()) return "Please enter your email address.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Please enter a valid email address.";
    if (!/^\d{10}$/.test(mobile.trim())) return "Please enter a valid 10-digit mobile number.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
    if (!agreed) return "Please accept the Terms and Privacy Policy to continue.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setSuccess("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: mobile.trim(),
          },
        },
      });

      if (signUpError) {
        setError(friendlyAuthError(signUpError.message));
        return;
      }

      // Best-effort: also upsert a profiles row so full name / phone are
      // queryable immediately, in case the DB trigger documented in
      // sql/schema.sql (handle_new_user) hasn't been applied yet.
      if (data.user) {
        await supabase
          .from("profiles")
          .upsert(
            {
              id: data.user.id,
              full_name: fullName.trim(),
              phone: mobile.trim(),
              email: email.trim(),
            },
            { onConflict: "id" }
          )
          .then(
            () => {},
            () => {}
          );
      }

      if (data.session) {
        // Email confirmation disabled on this project -> signed in immediately.
        navigate("/account");
        return;
      }

      setSuccess(
        "Account created! 🎉 Please check your email to verify your account before signing in."
      );
    } catch {
      setError("Something went wrong while creating your account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="YOUR STYLE. YOUR STORY."
      title="Find pieces"
      italicWord="that feel like you."
      tagline="Create your Daily Drape account and discover fashion made for every moment."
    >
      <p className="mb-2 text-[11px] font-bold tracking-[2.5px] text-primary">JOIN DAILY DRAPE</p>
      <h2 className="font-serif-display text-4xl font-semibold leading-tight text-ink">
        Create your account
      </h2>
      <p className="mt-3 text-sm text-muted">Start discovering styles you'll love.</p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <Field label="Full Name">
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            className={inputCls}
          />
        </Field>

        <Field label="Email Address">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className={inputCls}
          />
        </Field>

        <Field label="Mobile Number">
          <input
            type="tel"
            required
            maxLength={10}
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter your mobile number"
            className={inputCls}
          />
        </Field>

        <Field label="Password">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password (min. 6 characters)"
              className={inputCls + " pr-12"}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center text-muted"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </Field>

        <Field label="Confirm Password">
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className={inputCls + " pr-12"}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center text-muted"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </Field>

        <label className="flex cursor-pointer items-start gap-2.5 text-[11px] leading-relaxed text-muted">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 accent-primary"
          />
          <span>
            I agree to the <Link to="/terms" className="font-semibold text-primary">Terms</Link> and{" "}
            <Link to="/privacy" className="font-semibold text-primary">Privacy Policy</Link>.
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-[13px] text-muted">
        Already have an account?
        <Link to="/login" className="ml-1 font-bold text-primary">Sign in</Link>
      </p>
    </AuthShell>
  );
}

const inputCls =
  "h-[48px] w-full rounded-[11px] border border-border px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-[13px] font-semibold text-ink">{label}</label>
      {children}
    </div>
  );
}
