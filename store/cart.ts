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
  clear: () => void
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: {},
      open: false,
      add: (product) =>
        set((state) => {
          const altId = product.id.startsWith("prod-")
            ? product.id.replace(/^prod-/, "")
            : `prod-${product.id}`
          const existing = state.items[product.id] ?? state.items[altId] ?? 0
          const items = { ...state.items }
          delete items[altId]
          items[product.id] = existing > 0 ? existing + product.step : product.step
          return { items }
        }),
      change: (product, delta) =>
        set((state) => {
          const altId = product.id.startsWith("prod-")
            ? product.id.replace(/^prod-/, "")
            : `prod-${product.id}`
          const current = state.items[product.id] ?? state.items[altId] ?? 0
          const value = Math.max(0, current + delta)
          const items = { ...state.items }
          delete items[altId]
          if (value === 0) delete items[product.id]
          else items[product.id] = value
          return { items }
        }),
      setOpen: (open) => set({ open }),
      clear: () => set({ items: {} }),
    }),
    {
      name: "noor-farm-cart",
      partialize: (state) => ({ items: state.items }),
      skipHydration: true,
    },
  ),
)
