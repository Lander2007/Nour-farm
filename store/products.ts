"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { products as defaultProducts, type Product } from "@/data/products"

type ProductsState = {
  products: Product[]
  isHydrated: boolean
  setHydrated: (val: boolean) => void
  addProduct: (product: Product) => void
  updateProduct: (id: string, updated: Partial<Product>) => void
  deleteProduct: (id: string) => void
  toggleFeatured: (id: string) => void
  resetToDefault: () => void
  setProducts: (products: Product[]) => void
}

export const useProductsStore = create<ProductsState>()(
  persist(
    (set) => ({
      products: defaultProducts,
      isHydrated: false,
      setHydrated: (val: boolean) => set({ isHydrated: val }),
      addProduct: (newProduct) =>
        set((state) => ({
          products: [
            newProduct,
            ...state.products.filter((p) => p.id !== newProduct.id),
          ],
        })),
      updateProduct: (id, updated) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...updated } : p
          ),
        })),
      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),
      toggleFeatured: (id) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, featured: !p.featured } : p
          ),
        })),
      resetToDefault: () =>
        set(() => ({
          products: defaultProducts,
        })),
      setProducts: (newProducts) =>
        set(() => ({
          products: newProducts,
        })),
    }),
    {
      name: "noor-farm-catalog-v1",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    }
  )
)

/**
 * Hook to get the active products list safely with fallback to defaultProducts
 * to ensure SSR / initial mount consistency.
 */
export function useActiveProducts(): Product[] {
  const products = useProductsStore((state) => state.products)
  const isHydrated = useProductsStore((state) => state.isHydrated)
  // If not hydrated yet on client, return store products (or default)
  return products && products.length > 0 ? products : defaultProducts
}
