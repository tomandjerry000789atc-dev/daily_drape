import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WishlistItem } from "../lib/types";

interface WishlistState {
  items: WishlistItem[];
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
  remove: (productId: string) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (productId) => {
        const exists = get().items.some((i) => i.productId === productId);
        if (exists) {
          set({ items: get().items.filter((i) => i.productId !== productId) });
        } else {
          set({ items: [...get().items, { productId, addedAt: new Date().toISOString() }] });
        }
      },
      has: (productId) => get().items.some((i) => i.productId === productId),
      remove: (productId) =>
        set({ items: get().items.filter((i) => i.productId !== productId) }),
    }),
    { name: "dailydrape-wishlist" }
  )
);
