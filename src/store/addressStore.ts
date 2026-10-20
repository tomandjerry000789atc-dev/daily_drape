import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Address } from "../lib/types";

interface AddressState {
  addresses: Address[];
  add: (addr: Omit<Address, "id">) => Address;
  update: (id: string, addr: Partial<Address>) => void;
  remove: (id: string) => void;
  setDefault: (id: string) => void;
}

/**
 * Address book persisted to localStorage for the demo build.
 * When sql/schema.sql's `addresses` table is live and RLS is applied,
 * swap this for direct Supabase reads/writes scoped to auth.uid().
 */
export const useAddressStore = create<AddressState>()(
  persist(
    (set, get) => ({
      addresses: [],
      add: (addr) => {
        const newAddr: Address = { ...addr, id: crypto.randomUUID() };
        const isFirst = get().addresses.length === 0;
        set({
          addresses: [...get().addresses, { ...newAddr, is_default: isFirst || addr.is_default }],
        });
        return newAddr;
      },
      update: (id, patch) =>
        set({
          addresses: get().addresses.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        }),
      remove: (id) => set({ addresses: get().addresses.filter((a) => a.id !== id) }),
      setDefault: (id) =>
        set({
          addresses: get().addresses.map((a) => ({ ...a, is_default: a.id === id })),
        }),
    }),
    { name: "dailydrape-addresses" }
  )
);
