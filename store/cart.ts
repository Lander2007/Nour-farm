"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Product } from "@/data/products"

type CartState = {
  items: Record<string, number>
  open: boolean
  add: (product: Product) => void
  change: (product: Product, delta: number) => void
  setOpen: (open: boolean) => void
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: {},
      open: false,
      add: (product) =>
        set((state) => ({
          items: { ...state.items, [product.id]: product.step },
        })),
      change: (product, delta) =>
        set((state) => {
          const value = Math.max(0, (state.items[product.id] || 0) + delta)
          const items = { ...state.items }
          if (value === 0) delete items[product.id]
          else items[product.id] = value
          return { items }
        }),
      setOpen: (open) => set({ open }),
    }),
    {
      name: "noor-farm-cart",
      partialize: (state) => ({ items: state.items }),
      skipHydration: true,
    },
  ),
)
