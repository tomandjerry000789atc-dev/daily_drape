import type { ReactNode } from "react";

export default function SimplePage({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="text-xs font-bold tracking-[2.5px] text-primary">{eyebrow.toUpperCase()}</p>
      <h1 className="mt-2 font-serif-display text-4xl font-semibold text-ink">{title}</h1>
      <div className="prose prose-sm mt-8 max-w-none space-y-4 text-[15px] leading-relaxed text-ink/80">
        {children}
      </div>
    </div>
  );
}
