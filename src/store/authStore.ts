import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { Profile, UserRole } from "../lib/types";

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: UserRole;
  initialized: boolean;
  setSession: (session: Session | null) => void;
  loadProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  role: "customer",
  initialized: false,

  setSession: (session) => {
    set({ session, user: session?.user ?? null });
  },

  loadProfile: async () => {
    const user = get().user;
    if (!user) {
      set({ profile: null, role: "customer" });
      return;
    }
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error || !data) {
        // Fallback: derive a minimal profile from auth metadata only.
        // Role NEVER comes from client metadata — defaults to customer
        // until a trusted `profiles.role` row says otherwise.
        set({
          profile: {
            id: user.id,
            full_name: (user.user_metadata as any)?.full_name ?? null,
            phone: (user.user_metadata as any)?.phone ?? null,
            email: user.email ?? null,
            role: "customer",
          },
          role: "customer",
        });
        return;
      }
      set({ profile: data as Profile, role: (data as Profile).role ?? "customer" });
    } catch {
      set({
        profile: {
          id: user.id,
          full_name: (user.user_metadata as any)?.full_name ?? null,
          phone: (user.user_metadata as any)?.phone ?? null,
          email: user.email ?? null,
          role: "customer",
        },
        role: "customer",
      });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null, role: "customer" });
  },
}));

// Wire up Supabase auth listener once.
let listenerAttached = false;
export function attachAuthListener() {
  if (listenerAttached) return;
  listenerAttached = true;
  supabase.auth.getSession().then(({ data }) => {
    useAuthStore.getState().setSession(data.session ?? null);
    useAuthStore.getState().loadProfile();
    useAuthStore.setState({ initialized: true });
  });
  supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.getState().setSession(session);
    useAuthStore.getState().loadProfile();
  });
}
