import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, LogOut, Package, ShoppingCart, Tags } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { cn } from "../../utils/cn";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories & Brands", icon: Tags },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
];

export default function AdminLayout() {
  const { signOut, profile } = useAuthStore();
  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <aside className="h-fit w-60 shrink-0 rounded-2xl border border-border bg-white p-5">
          <p className="font-serif-display text-lg font-semibold text-ink">Daily Drape Admin</p>
          <p className="mt-1 text-xs text-muted">{profile?.email}</p>
          <nav className="mt-6 space-y-1">
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
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
