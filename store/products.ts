"use client"

import { useEffect } from "react"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { products as defaultProducts, type Product } from "@/data/products"
import type { Product as DbProduct } from "@/lib/db/types"

export function mapDbProductToProduct(db: DbProduct): Product {
  let unit = "كيلو"
  if (db.unit_type === "bunch") unit = "حزمة"
  else if (db.unit_type === "piece") unit = "واحدة"
  else if (db.unit_type === "box") unit = db.pack_label || "صندوق"
  else if (db.unit_type === "pack") unit = db.pack_label || "طبق"

  return {
    id: db.id,
    slug: db.id,
    name: db.name_ar,
    section: (db.section_id === "herbs"
      ? "الخضرة"
      : db.section_id === "ready-vegetables"
      ? "جاهز للطبخ"
      : db.section_id === "salads"
      ? "السلطات"
      : db.section_id === "fresh-fruits" || db.section_id === "cut-fruits"
      ? "فواكه طازجة"
      : "خضار طازج") as Product["section"],
    unit,
    step: db.step || (db.unit_type === "kg" ? 0.5 : 1),
    price: db.price || 0,
    image: db.image_url || "/noor-farm-images/IMG-20261014-WA0114.jpg",
    tint: "emerald",
    featured: false,
  }
}

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
  fetchFromDb: () => Promise<void>
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
      fetchFromDb: async () => {
        try {
          const res = await fetch("/api/products")
          if (!res.ok) return
          const data = await res.json()
          if (Array.isArray(data.products) && data.products.length > 0) {
            const mapped = data.products.map(mapDbProductToProduct)
            set({ products: mapped })
          }
        } catch {
          // ignore network failures, keep cached/default
        }
      },
    }),
    {
      name: "noor-farm-catalog-v2",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    }
  )
)

let hasFetchedFromDb = false

export function useActiveProducts(): Product[] {
  const products = useProductsStore((state) => state.products)
  const fetchFromDb = useProductsStore((state) => state.fetchFromDb)

  useEffect(() => {
    if (!hasFetchedFromDb) {
      hasFetchedFromDb = true
      void fetchFromDb()
    }
  }, [fetchFromDb])

  return products && products.length > 0 ? products : defaultProducts
}
