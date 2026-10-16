"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Minus, Plus, ShoppingBasket, Trash2, Leaf } from "lucide-react"
import { useCart } from "@/store/cart"
import type { Product as DbProduct } from "@/lib/db/types"
import { mapDbProductToProduct } from "@/store/products"

interface NeutralProductCardProps {
  product: DbProduct
}

const arNum = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 1 })

export default function NeutralProductCard({ product }: NeutralProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const items = useCart((state) => state.items)
  const add = useCart((state) => state.add)
  const change = useCart((state) => state.change)

  const quantity = items[product.id] || 0
  const storeProduct = mapDbProductToProduct(product)
  const step = product.step || (product.unit_type === "kg" ? 0.5 : 1)

  // Unit display label
  const unitLabel =
    product.unit_type === "kg"
      ? "كجم"
      : product.unit_type === "bunch"
      ? "حزمة"
      : product.unit_type === "piece"
      ? "واحدة"
      : product.unit_type === "box"
      ? product.pack_label || "صندوق"
      : product.pack_label || "طبق"

  const handleAdd = () => {
    add(storeProduct)
  }

  const handleIncrease = () => {
    change(storeProduct, step)
  }

  const handleDecrease = () => {
    change(storeProduct, -step)
  }

  return (
    <article
      className="group relative flex flex-col justify-between rounded-2xl bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 border border-stone-200/80"
      dir="rtl"
    >
      {/* Product Image / Neutral Fallback */}
      <div className="relative mb-3.5 aspect-square w-full overflow-hidden rounded-xl bg-stone-100">
        {product.image_url && !imageError ? (
          <Image
            src={product.image_url}
            alt={product.name_ar}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
            priority={false}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-emerald-50/60 p-4 text-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100/70 text-emerald-800">
              <Leaf size={24} />
            </div>
            <span className="text-xs font-semibold text-emerald-900/80 line-clamp-1">
              {product.name_ar}
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div className="mb-3">
          <h3 className="text-base font-bold text-stone-900 leading-snug line-clamp-1">
            {product.name_ar}
          </h3>
          <p className="mt-1 text-xs text-stone-500">
            {product.pack_label ? product.pack_label : `يباع بالـ${unitLabel}`}
          </p>
        </div>

        {/* Price & Cart Actions */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1 text-emerald-800">
              <span className="text-lg font-black tracking-tight">
                {product.price != null ? arNum.format(product.price) : "—"}
              </span>
              <span className="text-xs font-bold text-stone-600">ج.م</span>
            </div>
            <span className="text-[11px] text-stone-600">/ {unitLabel}</span>
          </div>

          {/* Stepper / Add to Cart */}
          <div className="shrink-0">
            {quantity === 0 ? (
              <button
                type="button"
                onClick={handleAdd}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-800 active:scale-95"
                aria-label={`إضافة ${product.name_ar} إلى السلة`}
              >
                <ShoppingBasket size={15} />
                <span>إضافة</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 rounded-xl bg-stone-100 p-1 border border-stone-200">
                <button
                  type="button"
                  onClick={handleDecrease}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-stone-700 shadow-xs transition-colors hover:bg-stone-200 active:scale-90"
                  aria-label="تقليل الكمية"
                >
                  {quantity <= step ? <Trash2 size={13} className="text-red-500" /> : <Minus size={13} />}
                </button>
                <span className="min-w-[2.2rem] text-center text-xs font-bold text-stone-900">
                  {arNum.format(quantity)}
                </span>
                <button
                  type="button"
                  onClick={handleIncrease}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-xs transition-colors hover:bg-emerald-800 active:scale-90"
                  aria-label="زيادة الكمية"
                >
                  <Plus size={13} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
