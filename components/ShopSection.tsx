"use client" /* Section Heading */ /* 10 Product Cards Grid */ /* Visual Target Slot for Hero Sprite Landing */ /* Subtle ground shadow under the item */ /* Native Card Image: opacity 0 until handoff at p >= 0.97 */ /* Card Content: Name, Unit, Price, Add-To-Cart */ /* Store CTA Card ("عرض المزيد") */ /* Four Trust Badges Strip */

import { useCallback, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  Plus,
  Minus,
  ShoppingBag,
  Leaf,
  ShieldCheck,
  Clock,
  CheckCircle2,
} from "lucide-react"
import { heroProduceItems, type Product } from "@/data/products"
import { useActiveProducts } from "@/store/products"
import { useCart } from "@/store/cart"

interface ShopSectionProps {
  handoffComplete?: boolean
}

export default function ShopSection({
  handoffComplete = false,
}: ShopSectionProps) {
  const activeProducts = useActiveProducts()
  const cartItems = useCart((state) => state.items)
  const addToCart = useCart((state) => state.add)
  const changeQty = useCart((state) => state.change)

  // Map the landing page produce cards dynamically to live database items!
  const displayProducts = useMemo(() => {
    if (!activeProducts || activeProducts.length === 0) {
      return heroProduceItems
    }

    return heroProduceItems.map((defaultItem) => {
      const defId = defaultItem.id.toLowerCase()
      const dbMatch = activeProducts.find((p) => {
        const pId = p.id.toLowerCase()
        return (
          pId === defId ||
          pId === `prod-${defId}` ||
          p.slug === defId ||
          p.name === defaultItem.name ||
          p.name.includes(defaultItem.name.split(" ")[0])
        )
      })

      if (dbMatch) {
        return {
          ...dbMatch,
          tint: defaultItem.tint,
        }
      }

      return defaultItem
    })
  }, [activeProducts])

  const handleAdd = useCallback(
    (product: Product, e: React.MouseEvent) => {
      e.stopPropagation()
      addToCart(product)
    },
    [addToCart],
  )

  return (
    <section
      className="shop-section"
      id="shop"
      aria-label="أصناف الطبق الطازجة"
    >
      <div className="shop-section-container">
        {}
        <div className="shop-header-intro">
          <span className="shop-eyebrow">أصناف مختارة</span>
          <h2 className="shop-main-title">
            نزلت الطازة في <span className="accent-word">سلّتك</span>
          </h2>
          <p className="shop-subtitle">
            خضار وفاكهة اليوم، طازجة ومختارة بالواحدة، جاهزة توصلك فوراً.
          </p>
        </div>

        {}
        <div className="hero-produce-grid">
          {displayProducts.map((product, idx) => {
            const qty =
              cartItems[product.id] ??
              cartItems[product.id.replace(/^prod-/, "")] ??
              cartItems[`prod-${product.id}`] ??
              0

            return (
              <article
                key={product.id}
                className={`produce-card tint-${product.tint}`}
                data-card-index={idx}
                data-product-id={product.id}
              >
                {}
                <div
                  className="card-visual-slot shop-card-visual-slot"
                  data-visual-slot={product.id}
                >
                  {}
                  <div className="card-item-shadow" aria-hidden="true" />

                  {}
                  <div
                    className="card-real-image-wrap"
                    style={{
                      opacity: handoffComplete ? 1 : 0,
                    }}
                    data-handoff-image={product.id}
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
                      className="card-product-img"
                      priority
                    />
                  </div>
                </div>

                {}
                <div className="card-body">
                  <h3 className="card-title">{product.name}</h3>

                  <div className="card-bottom-row">
                    <div className="card-price-col">
                      <span className="price-val">{product.price} ج.م</span>
                      <span className="price-unit">/ {product.unit}</span>
                    </div>

                    {qty === 0 ? (
                      <button
                        type="button"
                        className="hero-card-add-btn"
                        onClick={(e) => handleAdd(product, e)}
                        aria-label={`أضف ${product.name} إلى السلة`}
                      >
                        <ShoppingBag size={14} />
                        <span>أضف</span>
                      </button>
                    ) : (
                      <div
                        className="hero-card-stepper"
                        aria-label={`الكمية ${qty}`}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            changeQty(product, product.step)
                          }}
                          aria-label="زيادة"
                        >
                          <Plus size={12} />
                        </button>
                        <b>{qty}</b>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            changeQty(product, -product.step)
                          }}
                          aria-label="إنقاص"
                        >
                          <Minus size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        {}
        <div className="home-store-cta-card">
          <div className="cta-card-content">
            <h3>هل تبحث عن أصناف أخرى أو كميات لبيتك؟</h3>
            <p>
              متجر نور فارم يحتوي على أكثر من ٢٥٠ صنف من الخضار والورقيات
              والفواكه الطازجة والوجبات المجهزة.
            </p>
          </div>
          <Link href="/products" className="home-cta-button">
            <span>تصفّح كل الأصناف في المتجر</span>
            <ArrowLeft size={18} />
          </Link>
        </div>

        {}
        <div className="home-trust-ribbon">
          <div className="trust-ribbon-item">
            <span className="trust-icon">
              <Leaf size={20} />
            </span>
            <div>
              <strong>قطفة الصباح الطازجة</strong>
              <span>تصلك في أوج نضارتها وجودتها</span>
            </div>
          </div>
          <div className="trust-ribbon-item">
            <span className="trust-icon">
              <ShieldCheck size={20} />
            </span>
            <div>
              <strong>مغسولة ومجهزة فوراً</strong>
              <span>نظيفة ومعقمة توفر وقتك ومجهودك</span>
            </div>
          </div>
          <div className="trust-ribbon-item">
            <span className="trust-icon">
              <Clock size={20} />
            </span>
            <div>
              <strong>توصيل مبرد سريع</strong>
              <span>سيارات مجهزة للحفاظ على البرودة</span>
            </div>
          </div>
          <div className="trust-ribbon-item">
            <span className="trust-icon">
              <CheckCircle2 size={20} />
            </span>
            <div>
              <strong>ضمان استرجاع كامل</strong>
              <span>لو في أي ملاحظة بنبدلهالك فوراً</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
