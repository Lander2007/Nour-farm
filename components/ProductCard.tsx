"use client"
// Safe fallback if DOM measurement fails

import Image from "next/image"
import { Minus, Plus, ShoppingBag, Star } from "lucide-react"
import type { Product } from "@/data/products"
import { useCart } from "@/store/cart"

const number = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 1 })

let activeFlyingCount = 0
const MAX_CONCURRENT_FLYING = 3

export default function ProductCard({
  product,
  index = 0,
}: {
  product: Product
  index?: number
}) {
  const quantity = useCart(
    (state) =>
      state.items[product.id] ||
      0,
  )
  const add = useCart((state) => state.add)
  const change = useCart((state) => state.change)

  const addWithFlight = (event: React.MouseEvent<HTMLButtonElement>) => {
    add(product)
    if (activeFlyingCount >= MAX_CONCURRENT_FLYING) return

    try {
      const card = event.currentTarget.closest(".product-card")
      const image = card?.querySelector("img")
      const cart = document.querySelector(".cart-button")
      if (!image || !cart) return

      const from = image.getBoundingClientRect()
      const to = cart.getBoundingClientRect()
      const flying = document.createElement("img")
      flying.src = product.image
      flying.alt = ""
      flying.className = "flying-product"
      flying.style.left = `${from.left + from.width / 2 - 25}px`
      flying.style.top = `${from.top + from.height / 2 - 25}px`

      activeFlyingCount++
      let rafId: number | null = null

      const cleanup = () => {
        if (rafId !== null) cancelAnimationFrame(rafId)
        if (flying.parentNode) flying.remove()
        activeFlyingCount = Math.max(0, activeFlyingCount - 1)
      }

      flying.addEventListener("animationend", cleanup, { once: true })
      const timeoutId = window.setTimeout(cleanup, 500)

      document.body.appendChild(flying)

      rafId = requestAnimationFrame(() => {
        flying.style.transform = `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(0.2)`
        flying.style.opacity = "0"
      })
    } catch {
      activeFlyingCount = Math.max(0, activeFlyingCount - 1)
    }
  }

  return (
    <article
      className={`product-card tint-${product.tint} ${
        product.featured ? "featured" : ""
      }`}
      data-product-card
      style={{ "--card-index": index } as React.CSSProperties}
    >
      <div className="product-visual">
        {product.badge && (
          <span className="product-badge-tag">{product.badge}</span>
        )}
        <Image
          src={product.image}
          alt={`صورة ${product.name}`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="product-card-img"
        />
      </div>
      <div className="product-info">
        <div>
          <div className="product-meta-row">
            {product.rating && (
              <span className="product-rating">
                <Star className="rating-star" />
                {number.format(product.rating)}
              </span>
            )}
            {product.tag && (
              <span className="product-subtag">{product.tag}</span>
            )}
          </div>
          <h3>{product.name}</h3>
          <p>
            {number.format(product.price)} ج.م <span>/ {product.unit}</span>
          </p>
        </div>
        {quantity === 0 ? (
          <button
            type="button"
            className="add-button"
            onClick={addWithFlight}
            aria-label={`أضف ${product.name} إلى السلة`}
          >
            <ShoppingBag />
            <span>أضف</span>
          </button>
        ) : (
          <div className="stepper" aria-label={`كمية ${product.name}`}>
            <button
              type="button"
              onClick={() => change(product, product.step)}
              aria-label="زيادة الكمية"
            >
              <Plus />
            </button>
            <b>{number.format(quantity)}</b>
            <button
              type="button"
              onClick={() => change(product, -product.step)}
              aria-label="إنقاص الكمية"
            >
              <Minus />
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
