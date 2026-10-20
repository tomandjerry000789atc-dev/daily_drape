import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { useAuthStore } from "../../store/authStore";
import { cn } from "../../utils/cn";

const navLinks = [
  { label: "Women", to: "/products?category=women" },
  { label: "Men", to: "/products?category=men" },
  { label: "Kids", to: "/products?category=kids" },
  { label: "Accessories", to: "/products?category=accessories" },
  { label: "Sale", to: "/products?category=sale" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const { user } = useAuthStore();

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate(`/products${query ? `?q=${encodeURIComponent(query)}` : ""}`);
    setSearchOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <button
          className="grid h-9 w-9 place-items-center lg:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Open menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <img
            src="/images/logo.png"
            alt="Daily Drape"
            className="h-11 w-11 sm:h-12 sm:w-12 rounded-full object-cover shadow-sm ring-1 ring-primary/20 transition-transform group-hover:scale-105"
          />
          <span className="font-serif-display text-xl sm:text-2xl font-semibold tracking-tight text-ink">
            Daily Drape
          </span>
        </Link>

        <nav className="hidden items-center gap-7 px-6 lg:flex">
          {navLinks.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  "text-[13.5px] font-medium tracking-wide text-ink/80 transition hover:text-primary",
                  isActive && "text-primary"
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <form
          onSubmit={submitSearch}
          className="relative ml-auto hidden max-w-sm flex-1 items-center md:flex"
        >
          <Search size={16} className="absolute left-3 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Search for sarees, kurtas, dresses..."
            className="w-full rounded-full border border-border bg-cream py-2 pl-9 pr-3 text-sm outline-none transition focus:border-primary"
          />
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-3">
          <button
            className="grid h-9 w-9 place-items-center text-ink md:hidden"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search"
          >
            <Search size={20} />
          </button>
          <Link
            to={user ? "/account" : "/login"}
            className="hidden h-9 w-9 place-items-center text-ink hover:text-primary sm:grid"
            aria-label="Account"
          >
            <User size={20} />
          </Link>
          <Link
            to="/wishlist"
            className="relative grid h-9 w-9 place-items-center text-ink hover:text-primary"
            aria-label="Wishlist"
          >
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="absolute right-0 top-0 grid h-4 w-4 place-items-center rounded-full bg-primary text-[9px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            to="/cart"
            className="relative grid h-9 w-9 place-items-center text-ink hover:text-primary"
            aria-label="Cart"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute right-0 top-0 grid h-4 w-4 place-items-center rounded-full bg-primary text-[9px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {searchOpen && (
        <form onSubmit={submitSearch} className="border-t border-border px-4 py-3 md:hidden">
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-3 text-muted" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search Daily Drape..."
              className="w-full rounded-full border border-border bg-cream py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>
        </form>
      )}

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-border px-4 py-3 lg:hidden">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-2 py-2.5 text-sm font-medium text-ink hover:bg-cream"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to={user ? "/account" : "/login"}
            onClick={() => setMenuOpen(false)}
            className="rounded-lg px-2 py-2.5 text-sm font-medium text-ink hover:bg-cream"
          >
            {user ? "My Account" : "Sign In"}
          </Link>
        </nav>
      )}
    </header>
  );
}
