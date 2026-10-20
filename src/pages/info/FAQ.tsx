import { useState } from "react";
import { ChevronDown } from "lucide-react";
import SimplePage from "../../components/SimplePage";

const faqs = [
  { q: "What sizes do you offer?", a: "Most styles are available from XS to XXL, with kids sizes listed by age range. Check the Size Guide on each product page for exact measurements." },
  { q: "How long does delivery take?", a: "Orders are typically delivered within 4-7 business days depending on your location." },
  { q: "What is your return policy?", a: "We accept returns within 7 days of delivery for unused items in original packaging. See our Returns & Refunds page for details." },
  { q: "Do you offer Cash on Delivery?", a: "Yes, Cash on Delivery is available for most pin codes at checkout." },
  { q: "How do I track my order?", a: "Visit the Orders section in your account to see live status and tracking details." },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <SimplePage eyebrow="Help Center" title="Frequently Asked Questions">
      <div className="space-y-3">
        {faqs.map((f, i) => (
          <div key={i} className="rounded-xl border border-border">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-ink"
            >
              {f.q}
              <ChevronDown size={16} className={open === i ? "rotate-180 transition" : "transition"} />
            </button>
            {open === i && <p className="px-5 pb-4 text-sm text-ink/75">{f.a}</p>}
          </div>
        ))}
      </div>
    </SimplePage>
  );
}
