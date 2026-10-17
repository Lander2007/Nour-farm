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

function createDebouncedStorage(delayMs = 250) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let pendingValue: string | null = null

  return {
    getItem: (name: string): string | null => {
      if (typeof window === "undefined") return null
      try {
        return localStorage.getItem(name)
      } catch {
        return null
      }
    },
    setItem: (name: string, value: string): void => {
      if (typeof window === "undefined") return
      pendingValue = value
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        if (pendingValue !== null) {
          try {
            localStorage.setItem(name, pendingValue)
          } catch (e) {
            console.error("Cart localStorage error:", e)
          }
          pendingValue = null
        }
      }, delayMs)
    },
    removeItem: (name: string): void => {
      if (typeof window === "undefined") return
      if (timeoutId) clearTimeout(timeoutId)
      pendingValue = null
      try {
        localStorage.removeItem(name)
      } catch {}
    },
  }
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: {},
      open: false,
      add: (product) =>
        set((state) => {
          const step = product.step || 1
          const altId = product.id.startsWith("prod-")
            ? product.id.replace(/^prod-/, "")
            : `prod-${product.id}`
          const existing = state.items[product.id] ?? state.items[altId] ?? 0
          const items = { ...state.items }
          delete items[altId]
          items[product.id] = existing > 0 ? existing + step : step
          return { items }
        }),
      change: (product, delta) =>
        set((state) => {
          const altId = product.id.startsWith("prod-")
            ? product.id.replace(/^prod-/, "")
            : `prod-${product.id}`
          const current = state.items[product.id] ?? state.items[altId] ?? 0
          const value = Math.max(0, Number((current + delta).toFixed(2)))
          const items = { ...state.items }
          delete items[altId]
          if (value <= 0) delete items[product.id]
          else items[product.id] = value
          return { items }
        }),
      setOpen: (open) => set({ open }),
      clear: () => set({ items: {} }),
    }),
    {
      name: "noor-farm-cart",
      storage: createJSONStorage(() => createDebouncedStorage(200)),
      partialize: (state) => ({ items: state.items }),
      skipHydration: true,
    },
  ),
)
