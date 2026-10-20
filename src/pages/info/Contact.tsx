import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import SimplePage from "../../components/SimplePage";

export default function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <SimplePage eyebrow="Get in Touch" title="Contact Us">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div className="space-y-4 text-sm">
          <p className="flex items-center gap-2"><Phone size={16} className="text-primary" /> +91 98XXXXXX10 (placeholder)</p>
          <p className="flex items-center gap-2"><Mail size={16} className="text-primary" /> support@dailydrape.example (placeholder)</p>
          <p className="flex items-center gap-2"><MapPin size={16} className="text-primary" /> Mumbai, Maharashtra, India (placeholder)</p>
          <p className="text-xs text-amber-700">Replace these with your real support contact details.</p>
        </div>
        {sent ? (
          <p className="rounded-xl bg-green-50 p-4 text-sm text-green-700">
            Thanks for reaching out! This is a demo form — no message was
            actually sent. Wire it up to an email service or Supabase table
            to receive real messages.
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="space-y-3"
          >
            <input required placeholder="Your Name" className="h-11 w-full rounded-xl border border-border px-4 text-sm outline-none focus:border-primary" />
            <input required type="email" placeholder="Your Email" className="h-11 w-full rounded-xl border border-border px-4 text-sm outline-none focus:border-primary" />
            <textarea required placeholder="Your Message" rows={4} className="w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-primary" />
            <button type="submit" className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white">
              Send Message
            </button>
          </form>
        )}
      </div>
    </SimplePage>
  );
}
