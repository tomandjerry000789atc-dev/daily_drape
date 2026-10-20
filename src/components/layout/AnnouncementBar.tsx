const messages = [
  "✨ Free shipping on orders above ₹1,999",
  "🎉 Festive Edit — Up to 50% off ethnic wear",
  "🧵 Handwoven stories, delivered to your door",
  "↩️ Easy 7-day returns on all orders",
];

export default function AnnouncementBar() {
  return (
    <div className="bg-ink text-cream overflow-hidden">
      <div className="flex whitespace-nowrap py-2 text-xs sm:text-[13px] tracking-wide">
        <div className="flex animate-marquee gap-16 pr-16">
          {[...messages, ...messages].map((m, i) => (
            <span key={i} className="shrink-0 font-medium">
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
