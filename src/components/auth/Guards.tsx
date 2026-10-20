import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import type { UserRole } from "../../lib/types";

/** Blocks access until a session exists; otherwise redirects to /login. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, initialized } = useAuthStore();
  const location = useLocation();

  if (!initialized) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}

/**
 * Blocks access unless the signed-in user's trusted `profiles.role`
 * (loaded from Supabase, never from client-editable storage) matches one
 * of the allowed roles. This is a UX convenience only — the real
 * authorization boundary MUST be enforced by Postgres RLS policies
 * (see sql/policies.sql), since a determined user can still hit the
 * Supabase REST/API directly.
 */
export function RequireRole({ roles, children }: { roles: UserRole[]; children: ReactNode }) {
  const { user, initialized, role, profile } = useAuthStore();
  const location = useLocation();

  if (!initialized || (user && !profile)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (!roles.includes(role)) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-serif-display text-2xl font-semibold text-ink">Access restricted</h1>
        <p className="mt-3 text-sm text-muted">
          Your account ({role}) does not have permission to view this page.
          This area requires the <strong>{roles.join(" or ")}</strong> role,
          granted only through a trusted database record — not by frontend
          settings.
        </p>
      </div>
    );
  }
  return <>{children}</>;
}
