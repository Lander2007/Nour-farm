"use client"

// Filter products for quick search modal
/* Right side in RTL: Brand Logo Badge */ /* Center: Main Navigation */ /* Left side in RTL: Action Icons (Search & Cart, Profile Removed) */ /* ═══════════════════════════════════════════════════════════════
          INTERACTIVE SEARCH MODAL OVERLAY
          ═══════════════════════════════════════════════════════════════ */ /* Live Search Quick Results */ /* Mobile Drawer Menu */

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, Menu, Search, ShoppingBag, X } from "lucide-react"
import BrandMark from "./BrandMark"
import { useCart } from "@/store/cart"
import { useActiveProducts } from "@/store/products"
import { type Product } from "@/data/products"

const number = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 1 })

export default function Header({
  solid = true,
  hideLogo = false,
}: {
  solid?: boolean
  hideLogo?: boolean
}) {
  const count = useCart((state) => Object.keys(state.items).length)
  const setOpen = useCart((state) => state.setOpen)
  const add = useCart((state) => state.add)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    void useCart.persist.rehydrate()
    const handleScroll = () => {
      const isPast =
        window.scrollY >
        24
      setScrolled((prev) =>
        prev !==
        isPast
          ? isPast
          : prev,
      )
    }
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 80)
      const onKeyDown = (e: KeyboardEvent) => {
        if (
          e.key ===
          "Escape"
        )
          setSearchOpen(false)
      }
      window.addEventListener("keydown", onKeyDown)
      return () => window.removeEventListener("keydown", onKeyDown)
    }
  }, [searchOpen])

  const isSolid =
    solid ||
    scrolled
  const cleanSearch = searchQuery.trim().toLowerCase()
  const searchResults = cleanSearch
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(cleanSearch) ||
            p.section.toLowerCase().includes(cleanSearch) ||
            (p.tag && p.tag.toLowerCase().includes(cleanSearch)),
        )
        .slice(0, 6)
    : []

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!cleanSearch) return
    setSearchOpen(false)
    router.push(`/products?search=${encodeURIComponent(cleanSearch)}`)
  }

  return (
    <>
      <header className={`site-header ${isSolid ? "header-solid" : ""}`}>
        {/* Right side in RTL: Brand Logo Badge */}
        <Link
          href="/"
          className={`logo-link ${hideLogo ? "invisible pointer-events-none select-none opacity-0" : ""}`}
          aria-label="الصفحة الرئيسية - نور فارم"
          tabIndex={hideLogo ? -1 : undefined}
        >
          <BrandMark />
        </Link>

        {/* Center: Main Navigation */}
        <nav className="desktop-nav" aria-label="التنقل الرئيسي">
          <Link href="/" className="nav-item">
            الرئيسية
          </Link>
          <Link href="/vegetables" className="nav-item">
            قسم الخضار
          </Link>
          <Link href="/fruits" className="nav-item">
            قسم الفاكهة
          </Link>
          <Link href="/all" className="nav-item">
            الكل
          </Link>
        </nav>

        {}
        <div className="header-tools">
          <button
            type="button"
            className="tool-btn"
            aria-label="بحث في المنتجات"
            title="بحث"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="tool-icon" />
          </button>

          <button
            type="button"
            className="tool-btn cart-button"
            aria-label="سلة التسوق"
            title="السلة"
            onClick={() => setOpen(true)}
          >
            <ShoppingBag className="tool-icon" />
            {count > 0 && (
              <span
                className="cart-badge"
                aria-label={`${count} عناصر في السلة`}
              >
                {new Intl.NumberFormat("ar-EG").format(count)}
              </span>
            )}
          </button>

          <button
            type="button"
            className="tool-btn mobile-menu-toggle"
            aria-label="فتح القائمة"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="tool-icon" />
          </button>
        </div>
      </header>

      {}
      {searchOpen && (
        <div
          className="search-modal-overlay"
          onClick={() => setSearchOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="نافذة البحث السريع"
        >
          <div
            className="search-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="search-modal-header">
              <form onSubmit={handleSearchSubmit} className="search-modal-form">
                <Search className="search-modal-icon" />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن خضار، ورقيات، بطاطس، طماطم، أو وجبات جاهزة..."
                  className="search-modal-input"
                  aria-label="اكتب للبحث"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="search-clear-btn"
                    onClick={() => setSearchQuery("")}
                    aria-label="مسح البحث"
                  >
                    <X />
                  </button>
                )}
              </form>
              <button
                type="button"
                className="search-close-btn"
                onClick={() => setSearchOpen(false)}
                aria-label="إغلاق البحث"
              >
                <X size={20} />
              </button>
            </div>

            {}
            {cleanSearch ? (
              <div className="search-results-list">
                {searchResults.length > 0 ? (
                  <>
                    <div className="search-results-title">
                      <span>المنتجات المطابقة ({searchResults.length})</span>
                    </div>
                    {searchResults.map((product) => (
                      <div key={product.id} className="search-result-row">
                        <Link
                          href={`/products?search=${encodeURIComponent(product.name)}`}
                          onClick={() => setSearchOpen(false)}
                          className="search-result-link"
                        >
                          <div className="search-result-thumb">
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="search-thumb-img"
                            />
                          </div>
                          <div className="search-result-info">
                            <span className="search-result-name">
                              {product.name}
                            </span>
                            <span className="search-result-section">
                              {product.section}
                            </span>
                          </div>
                        </Link>
                        <div className="search-result-action">
                          <span className="search-result-price">
                            {number.format(product.price)} ج.م
                          </span>
                          <button
                            type="button"
                            className="search-quick-add"
                            onClick={() => add(product)}
                            title="أضف للسلة"
                          >
                            + أضف
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="search-modal-footer">
                      <button
                        type="button"
                        className="search-view-all-btn"
                        onClick={() => handleSearchSubmit()}
                      >
                        عرض جميع النتائج في صفحة المتجر <ArrowLeft />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="search-no-results">
                    <p>لم نعثر على أي صنف مطابق لـ &quot;{searchQuery}&quot;</p>
                    <button
                      type="button"
                      className="search-browse-store-btn"
                      onClick={() => {
                        setSearchOpen(false)
                        router.push("/products")
                      }}
                    >
                      تصفّح كل الأصناف في المتجر
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="search-suggestions">
                <span className="search-suggestions-title">
                  أكثر عمليات البحث شيوعاً:
                </span>
                <div className="search-pills">
                  {[
                    "طماطم",
                    "بطاطس تحمير",
                    "خيار",
                    "ملوخية",
                    "بصل",
                    "سلطة",
                    "كوسة",
                  ].map((kw) => (
                    <button
                      key={kw}
                      type="button"
                      className="search-suggest-pill"
                      onClick={() => {
                        setSearchQuery(kw)
                        router.push(
                          `/products?search=${encodeURIComponent(kw)}`,
                        )
                        setSearchOpen(false)
                      }}
                    >
                      {kw}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {}
      {mobileMenuOpen && (
        <div
          className="mobile-nav-overlay"
          onClick={() => setMobileMenuOpen(false)}
        >
          <nav
            className="mobile-nav-panel"
            onClick={(e) => e.stopPropagation()}
            aria-label="قائمة الهاتف"
          >
            <div className="mobile-nav-header">
              <BrandMark />
              <button
                type="button"
                className="close-menu-btn"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="إغلاق القائمة"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mobile-nav-links">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                الرئيسية
              </Link>
              <Link
                href="/vegetables"
                onClick={() => setMobileMenuOpen(false)}
              >
                قسم الخضار
              </Link>
              <Link
                href="/fruits"
                onClick={() => setMobileMenuOpen(false)}
              >
                قسم الفاكهة
              </Link>
              <Link
                href="/all"
                onClick={() => setMobileMenuOpen(false)}
              >
                الكل
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
