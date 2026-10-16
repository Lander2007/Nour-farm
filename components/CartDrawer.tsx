"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, ShoppingBasket, X } from "lucide-react"
import { useActiveProducts } from "@/store/products"
import { useCart } from "@/store/cart"
import BrandMark from "./BrandMark"

const number = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 1 })

export default function CartDrawer() {
  const products = useActiveProducts()
  const { items, open, setOpen, change } = useCart()
  const getQty = (product: Product) => {
    return (
      items[product.id] ??
      items[product.id.replace(/^prod-/, "")] ??
      items[`prod-${product.id}`] ??
      0
    )
  }
  const selected = products.filter((product) => getQty(product) > 0)
  const total = selected.reduce(
    (sum, product) => sum + product.price * getQty(product),
    0,
  )

  return (
    <>
      <button
        type="button"
        aria-label="إغلاق السلة"
        className={`drawer-scrim ${open ? "is-open" : ""}`}
        onClick={() => setOpen(false)}
      />
      <aside
        className={`cart-drawer ${open ? "is-open" : ""}`}
        aria-hidden={!open}
      >
        <div className="drawer-head">
          <div>
            <span className="eyebrow">سلّتك</span>
            <h2>اختياراتك الطازة</h2>
          </div>
          <button
            type="button"
            aria-label="إغلاق"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>
        </div>
        {selected.length === 0 ? (
          <div className="empty-cart">
            <BrandMark compact />
            <ShoppingBasket />
            <p>لسه سلّتك فاضية</p>
            <span>اختار اللي تحبه وإحنا نرتّبهولك.</span>
          </div>
        ) : (
          <div className="drawer-items">
            {selected.map((product) => (
              <div className="drawer-item" key={product.id}>
                <Image
                  src={product.image}
                  alt={product.name}
                  width={76}
                  height={76}
                />
                <div>
                  <strong>{product.name}</strong>
                  <span>
                    {number.format(product.price)} ج.م / {product.unit}
                  </span>
                </div>
                <div className="mini-stepper">
                  <button
                    type="button"
                    aria-label="زيادة"
                    onClick={() => change(product, product.step)}
                  >
                    <Plus />
                  </button>
                  <b>{number.format(getQty(product))}</b>
                  <button
                    type="button"
                    aria-label="نقصان"
                    onClick={() => change(product, -product.step)}
                  >
                    <Minus />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="drawer-total">
          <span>الإجمالي</span>
          <strong>{number.format(total)} ج.م</strong>
          {selected.length > 0 ? (
            <Link href="/checkout" onClick={() => setOpen(false)}>
              إتمام الطلب
            </Link>
          ) : (
            <button type="button" disabled>
              إتمام الطلب
            </button>
          )}
        </div>
      </aside>
    </>
  )
}
