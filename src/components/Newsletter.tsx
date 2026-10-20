import { useState } from "react";
import { Mail } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    // NOTE: no email-marketing backend is wired up yet. This is a UI-only
    // capture; integrate with Supabase table or a provider like
    // Mailchimp/Resend before relying on it in production.
    setSubmitted(true);
  }

  return (
    <section className="bg-primary">
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <Mail className="mx-auto mb-4 text-cream" size={28} />
        <h2 className="font-serif-display text-3xl font-semibold text-cream sm:text-4xl">
          Join the Daily Drape circle
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-cream/85">
          Be first to know about new collections, festive edits and
          members-only offers.
        </p>
        {submitted ? (
          <p className="mt-6 font-medium text-cream">
            Thank you! You're on the list. 🎉
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full flex-1 rounded-full border-0 px-5 py-3.5 text-sm outline-none ring-2 ring-transparent focus:ring-cream"
            />
            <button
              type="submit"
              className="rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-cream transition hover:bg-black"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
