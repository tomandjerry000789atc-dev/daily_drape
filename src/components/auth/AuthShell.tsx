import { Link } from "react-router-dom";
import type { ReactNode } from "react";

export default function AuthShell({
  eyebrow,
  title,
  italicWord,
  tagline,
  children,
}: {
  eyebrow: string;
  title: string;
  italicWord: string;
  tagline: string;
  children: ReactNode;
}) {
  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
      {/* Left visual panel */}
      <section className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-gradient-to-br from-[#4c2638] via-primary to-primary-light p-12 text-cream lg:flex">
        <Link to="/" className="relative z-10 flex items-center gap-3.5 group">
          <div className="grid h-14 w-14 place-items-center rounded-full border border-cream/70 p-0.5 shadow-md transition-transform group-hover:scale-105">
            <img src="/images/logo.png" alt="Daily Drape" className="h-full w-full rounded-full object-cover" />
          </div>
          <span className="font-serif-display text-2xl tracking-wide">Daily Drape</span>
        </Link>

        <div className="relative z-10 mb-16 max-w-xl">
          <p className="mb-5 text-xs font-bold tracking-[3px] text-cream/75">{eyebrow}</p>
          <h1 className="font-serif-display text-6xl font-bold leading-[0.98] xl:text-7xl">
            {title}
            <span className="block font-medium italic">{italicWord}</span>
          </h1>
          <p className="mt-7 max-w-md text-[15px] leading-loose text-cream/80">{tagline}</p>
        </div>

        <div className="pointer-events-none absolute -right-56 top-20 h-[500px] w-[500px] rounded-full border border-white/15" />
        <div className="pointer-events-none absolute -right-20 bottom-[-160px] h-80 w-80 rounded-full border border-white/15" />
      </section>

      {/* Right form panel */}
      <section className="flex min-h-screen items-center justify-center bg-white px-6 py-10 sm:px-10">
        <div className="w-full max-w-[470px]">
          <Link to="/" className="mb-10 flex items-center justify-center gap-3 lg:hidden">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-primary text-primary p-0.5 shadow-sm">
              <img src="/images/logo.png" alt="Daily Drape" className="h-full w-full rounded-full object-cover" />
            </span>
            <span className="font-serif-display text-2xl text-ink">Daily Drape</span>
          </Link>
          {children}
        </div>
      </section>
    </main>
  );
}
