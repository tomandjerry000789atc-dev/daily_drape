import { NavLink, Outlet } from "react-router-dom";
import { Heart, LogOut, MapPin, Package, User } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { cn } from "../../utils/cn";

const links = [
  { to: "/account", label: "Profile", icon: User, end: true },
  { to: "/account/addresses", label: "Addresses", icon: MapPin },
  { to: "/orders", label: "Orders", icon: Package },
  { to: "/wishlist", label: "Wishlist", icon: Heart },
];

export default function AccountLayout() {
  const { profile, signOut } = useAuthStore();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]">
        <aside className="h-fit rounded-2xl border border-border bg-white p-5">
          <div className="mb-5 flex items-center gap-3 border-b border-border pb-5">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 font-serif-display text-lg font-semibold text-primary">
              {(profile?.full_name ?? "D")[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">{profile?.full_name ?? "Daily Drape Member"}</p>
              <p className="text-xs text-muted">{profile?.email}</p>
            </div>
          </div>
          <nav className="space-y-1">
            {links.map((l) => (
              <NavLink
                key={l.label}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink/80 transition hover:bg-cream",
                    isActive && "bg-primary/10 text-primary"
                  )
                }
              >
                <l.icon size={16} /> {l.label}
              </NavLink>
            ))}
            <button
              onClick={signOut}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </nav>
        </aside>
        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
