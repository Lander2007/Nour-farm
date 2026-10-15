"use client"

// Initialize from searchParams if present

// Sync state if URL searchParams change

// Count items per section for tabs and sidebar

// Filter and sort products
// 1. Category filter

// 2. Search query filter

// 3. Price filter

// 4. Special tag filter

// Sorting
// default: featured first, then original order

// Reset page to 1 whenever any filter changes

// Pagination calculation

// Generate pagination page numbers
/* ═══════════════════════════════════════════════════════════════
          BREADCRUMB & STORE BANNER
          ═══════════════════════════════════════════════════════════════ */ /* ═══════════════════════════════════════════════════════════════
          TOP CONTROLS BAR: SEARCH, SORT & MOBILE FILTER TOGGLE
          ═══════════════════════════════════════════════════════════════ */ /* Search Field */ /* Right controls: Sort + Page Size + Mobile Toggle */ /* Sort Select */ /* Mobile Filter Toggle Button */ /* ═══════════════════════════════════════════════════════════════
          MAIN STORE LAYOUT: SIDEBAR + PRODUCTS GRID
          ═══════════════════════════════════════════════════════════════ */ /* ═══════════════════════════════════════════════════════════
              DESKTOP FILTER SIDEBAR (RIGHT COLUMN IN RTL)
              ═══════════════════════════════════════════════════════════ */ /* 1. Category Filter */ /* 2. Price Filter */ /* Quick price presets */ /* Min / Max numeric inputs */ /* 3. Special Tags Filter */ /* Trust Box */ /* ═══════════════════════════════════════════════════════════
              PRODUCTS GRID & PAGINATION AREA (LEFT COLUMN IN RTL)
              ═══════════════════════════════════════════════════════════ */ /* Active Filters Row */ /* Products Grid or Empty State */ /* ═══════════════════════════════════════════════════════
                    PAGINATION BAR ("slice them in different pages")
                    ═══════════════════════════════════════════════════════ */ /* Previous Button */ /* Page Numbers */ /* Next Button */ /* Page Size Selector */ /* ═══════════════════════════════════════════════════════════════
          MOBILE FILTER DRAWER (SLIDE-IN MODAL)
          ═══════════════════════════════════════════════════════════════ */ /* Category */ /* Price */ /* Tags */ /* Catalog Footer */

import { useState, useMemo, useEffect, useRef } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Tag,
  X,
  Leaf,
  ShieldCheck,
  Truck,
} from "lucide-react"
import { sections, type Product } from "@/data/products"
import { useActiveProducts } from "@/store/products"
import Header from "./Header"
import ProductCard from "./ProductCard"
import CartDrawer from "./CartDrawer"
import Footer from "./Footer"

const number = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 1 })

const pricePresets = [
  { label: "كل الأسعار", min: 0, max: 9999 },
  { label: "أقل من ٢٠ ج.م", min: 0, max: 20 },
  { label: "من ٢٠ إلى ٤٠ ج.م", min: 20, max: 40 },
  { label: "من ٤٠ إلى ٨٠ ج.م", min: 40, max: 80 },
  { label: "أكثر من ٨٠ ج.م", min: 80, max: 9999 },
]

const specialTags = ["الأكثر طلباً", "طازج اليوم", "عضوي", "جاهز فوراً"]

type SortOption = "featured" | "price-asc" | "price-desc" | "rating" | "name"

const PAGE_SIZE_OPTIONS = [12, 16, 24, 36]

export default function Catalog() {
  const products = useActiveProducts()
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialCategory =
    searchParams.get("category") ||
    "الكل"
  const initialSearch =
    searchParams.get("search") ||
    ""

  const [section, setSection] = useState<string>(initialCategory)
  const [query, setQuery] = useState(initialSearch)
  const [selectedTag, setSelectedTag] = useState<string>("الكل")
  const [minPrice, setMinPrice] = useState<number | "">("")
  const [maxPrice, setMaxPrice] = useState<number | "">("")
  const [pricePresetIdx, setPricePresetIdx] = useState<number>(0)
  const [sortBy, setSortBy] = useState<SortOption>("featured")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(16)
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false)

  const resultsTopRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const cat = searchParams.get("category")
    if (
      cat &&
      cat !==
        section
    ) {
      setSection(cat)
      setCurrentPage(1)
    }
    const q = searchParams.get("search")
    if (
      q !==
        null &&
      q !==
        query
    ) {
      setQuery(q)
      setCurrentPage(1)
    }
  }, [searchParams])
  const sectionCounts = useMemo(() => {
    const counts: Record<string, number> = { الكل: products.length }
    sections.forEach((sec) => {
      counts[sec] = products.filter(
        (p) =>
          p.section ===
          sec,
      ).length
    })
    return counts
  }, [products])
  const filteredProducts = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase()
    const activeMin =
      minPrice !==
      ""
        ? Number(minPrice)
        : pricePresets[pricePresetIdx].min
    const activeMax =
      maxPrice !==
      ""
        ? Number(maxPrice)
        : pricePresets[pricePresetIdx].max

    const list = products.filter((p) => {
      const matchesSection =
        section ===
          "الكل" ||
        p.section ===
          section
      const matchesQuery =
        !cleanQuery ||
        p.name.toLowerCase().includes(cleanQuery) ||
        p.section.toLowerCase().includes(cleanQuery) ||
        (p.tag && p.tag.toLowerCase().includes(cleanQuery)) ||
        (p.badge && p.badge.toLowerCase().includes(cleanQuery))
      const matchesPrice =
        p.price >=
          activeMin &&
        p.price <=
          activeMax
      const matchesTag =
        selectedTag ===
          "الكل" ||
        p.tag ===
          selectedTag ||
        p.badge ===
          selectedTag

      return matchesSection && matchesQuery && matchesPrice && matchesTag
    })
    return [...list].sort((a, b) => {
      if (
        sortBy ===
        "price-asc"
      )
        return (
          a.price -
          b.price
        )
      if (
        sortBy ===
        "price-desc"
      )
        return (
          b.price -
          a.price
        )
      if (
        sortBy ===
        "rating"
      )
        return (
          (b.rating ||
            0) -
          (a.rating ||
            0)
        )
      if (
        sortBy ===
        "name"
      )
        return a.name.localeCompare(b.name, "ar")
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      return 0
    })
  }, [products, section, query, minPrice, maxPrice, pricePresetIdx, selectedTag, sortBy])
  const handleCategoryChange = (cat: string) => {
    setSection(cat)
    setCurrentPage(1)
  }

  const handleQueryChange = (val: string) => {
    setQuery(val)
    setCurrentPage(1)
  }

  const handlePresetChange = (idx: number) => {
    setPricePresetIdx(idx)
    setMinPrice("")
    setMaxPrice("")
    setCurrentPage(1)
  }

  const handleTagChange = (t: string) => {
    setSelectedTag(
      selectedTag ===
        t
        ? "الكل"
        : t,
    )
    setCurrentPage(1)
  }

  const handleSortChange = (opt: SortOption) => {
    setSortBy(opt)
    setCurrentPage(1)
  }

  const resetAllFilters = () => {
    setSection("الكل")
    setQuery("")
    setMinPrice("")
    setMaxPrice("")
    setPricePresetIdx(0)
    setSelectedTag("الكل")
    setSortBy("featured")
    setCurrentPage(1)
  }

  const hasActiveFilters =
    section !==
      "الكل" ||
    query !==
      "" ||
    pricePresetIdx !==
      0 ||
    minPrice !==
      "" ||
    maxPrice !==
      "" ||
    selectedTag !==
      "الكل" ||
    sortBy !==
      "featured"
  const totalItems = filteredProducts.length
  const totalPages = Math.max(
    1,
    Math.ceil(
      totalItems /
        pageSize,
    ),
  )
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * pageSize
  const endIndex = Math.min(
    startIndex +
      pageSize,
    totalItems,
  )
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    if (
      page <
        1 ||
      page >
        totalPages
    )
      return
    setCurrentPage(page)
    if (resultsTopRef.current) {
      resultsTopRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (safePage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages)
      } else if (safePage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        )
      } else {
        pages.push(
          1,
          "...",
          safePage - 1,
          safePage,
          safePage + 1,
          "...",
          totalPages,
        )
      }
    }
    return pages
  }, [totalPages, safePage])

  return (
    <main className="catalog-page">
      <Header solid />
      <CartDrawer />

      {}
      <section className="catalog-banner-section">
        <div className="catalog-banner-inner">
          <nav className="catalog-breadcrumbs" aria-label="مسار التصفح">
            <Link href="/">الرئيسية</Link>
            <span>/</span>
            <Link href="/products">المتجر</Link>
            {section !== "الكل" && (
              <>
                <span>/</span>
                <span className="current-crumb">{section}</span>
              </>
            )}
          </nav>

          <div className="catalog-banner-header">
            <div>
              <span className="eyebrow">سوق نور فارم الطازج</span>
              <h1 className="catalog-title">
                {section === "الكل" ? "كل منتجات المزرعة" : section}
              </h1>
              <p className="catalog-subtitle">
                تصفّح تشكيلة متكاملة من أجود أنواع الخضار والفواكه المقطوفة طازجة
                والمجهزة بكل عناية لتصلك نظيفة وجاهزة فوراً.
              </p>
            </div>

            <div className="catalog-quick-stats">
              <div className="stat-card">
                <b>{products.length}</b>
                <span>صنف متاح</span>
              </div>
              <div className="stat-card">
                <b>١٠٠٪</b>
                <span>طازج ومغسول</span>
              </div>
              <div className="stat-card">
                <b>٦٠ د</b>
                <span>توصيل سريع</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {}
      <div className="catalog-controls-bar" ref={resultsTopRef}>
        <div className="catalog-controls-container">
          {}
          <div className="catalog-search-wrap">
            <Search className="catalog-search-icon" />
            <input
              type="search"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="ابحث بالاسم (طماطم، بطاطس، ملوخية، خيار...)"
              className="catalog-search-input"
              aria-label="ابحث في المنتجات"
            />
            {query && (
              <button
                type="button"
                className="catalog-search-clear"
                onClick={() => handleQueryChange("")}
                aria-label="مسح البحث"
              >
                <X />
              </button>
            )}
          </div>

          {}
          <div className="catalog-actions-wrap">
            {}
            <div className="catalog-sort-group">
              <SlidersHorizontal className="sort-icon" />
              <label htmlFor="catalog-sort" className="sr-only">
                ترتيب حسب
              </label>
              <select
                id="catalog-sort"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                className="catalog-sort-select"
              >
                <option value="featured">الموصى به (الأكثر تميزاً)</option>
                <option value="price-asc">السعر: من الأقل للأعلى</option>
                <option value="price-desc">السعر: من الأعلى للأقل</option>
                <option value="rating">الأعلى تقييماً</option>
                <option value="name">الاسم أبجدياً (أ - ي)</option>
              </select>
            </div>

            {}
            <button
              type="button"
              className="mobile-filter-btn"
              onClick={() => setShowMobileFilters(true)}
              aria-label="تصفية المنتجات"
            >
              <Filter />
              <span>تصفية</span>
              {hasActiveFilters && <span className="active-filter-dot" />}
            </button>
          </div>
        </div>
      </div>

      {}
      <section className="catalog-main-layout">
        <div className="catalog-layout-container">
          {}
          <aside className="catalog-sidebar">
            <div className="sidebar-sticky-box">
              <div className="sidebar-header">
                <h3>
                  <Filter className="sidebar-title-icon" />
                  <span>تصفية المنتجات</span>
                </h3>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="sidebar-reset-btn"
                    title="إلغاء كل الفلاتر"
                  >
                    <RotateCcw /> مسح الكل
                  </button>
                )}
              </div>

              {}
              <div className="filter-group">
                <h4 className="filter-group-title">
                  <Layers className="filter-icon" /> الأقسام
                </h4>
                <div className="category-filter-list">
                  <button
                    type="button"
                    className={`category-filter-item ${
                      section === "الكل" ? "active" : ""
                    }`}
                    onClick={() => handleCategoryChange("الكل")}
                  >
                    <span>الكل</span>
                    <span className="count-pill">
                      {sectionCounts["الكل"] || 0}
                    </span>
                  </button>
                  {sections.map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      className={`category-filter-item ${
                        section === sec ? "active" : ""
                      }`}
                      onClick={() => handleCategoryChange(sec)}
                    >
                      <span>{sec}</span>
                      <span className="count-pill">
                        {sectionCounts[sec] || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {}
              <div className="filter-group">
                <h4 className="filter-group-title">
                  <span>السعر (ج.م)</span>
                </h4>
                {}
                <div className="price-preset-chips">
                  {pricePresets.map((preset, idx) => (
                    <button
                      key={preset.label}
                      type="button"
                      className={`price-preset-chip ${
                        pricePresetIdx === idx &&
                        minPrice === "" &&
                        maxPrice === ""
                          ? "active"
                          : ""
                      }`}
                      onClick={() => handlePresetChange(idx)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {}
                <div className="custom-price-inputs">
                  <div className="price-input-field">
                    <label>من</label>
                    <input
                      type="number"
                      min={0}
                      value={minPrice}
                      onChange={(e) => {
                        setMinPrice(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                        setCurrentPage(1)
                      }}
                      placeholder="٠"
                    />
                  </div>
                  <span className="price-dash">—</span>
                  <div className="price-input-field">
                    <label>إلى</label>
                    <input
                      type="number"
                      min={0}
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                        setCurrentPage(1)
                      }}
                      placeholder="١٥٠"
                    />
                  </div>
                </div>
              </div>

              {}
              <div className="filter-group">
                <h4 className="filter-group-title">
                  <Tag className="filter-icon" /> السمات والمميزات
                </h4>
                <div className="tag-checkbox-list">
                  {specialTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className={`tag-checkbox-item ${
                        selectedTag === tag ? "active" : ""
                      }`}
                      onClick={() => handleTagChange(tag)}
                    >
                      <span className="checkbox-indicator">
                        {selectedTag === tag && <Check className="check-svg" />}
                      </span>
                      <span className="tag-name">{tag}</span>
                      {tag === "الأكثر طلباً" && (
                        <Sparkles className="sparkle-svg" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {}
              <div className="sidebar-trust-box">
                <div className="trust-item">
                  <Leaf size={16} className="text-emerald-700 shrink-0" />
                  <p>قطفة الصباح طازجة يومياً من المزرعة</p>
                </div>
                <div className="trust-item">
                  <ShieldCheck
                    size={16}
                    className="text-emerald-700 shrink-0"
                  />
                  <p>مغسولة ومعقمة وجاهزة للطهي الفوري</p>
                </div>
                <div className="trust-item">
                  <Truck size={16} className="text-emerald-700 shrink-0" />
                  <p>توصيل سريع حتى باب المطبخ</p>
                </div>
              </div>
            </div>
          </aside>

          {}
          <main className="catalog-content-main">
            {}
            <div className="catalog-status-header">
              <div className="catalog-count-badge">
                عرض <b>{totalItems > 0 ? startIndex + 1 : 0}</b> -{" "}
                <b>{endIndex}</b> من أصل <b>{totalItems}</b> صنف طازج
              </div>

              {hasActiveFilters && (
                <div className="active-filter-chips">
                  {section !== "الكل" && (
                    <span className="filter-chip">
                      القسم: {section}
                      <button
                        type="button"
                        onClick={() => handleCategoryChange("الكل")}
                      >
                        <X />
                      </button>
                    </span>
                  )}
                  {query && (
                    <span className="filter-chip">
                      بحث: &quot;{query}&quot;
                      <button
                        type="button"
                        onClick={() => handleQueryChange("")}
                      >
                        <X />
                      </button>
                    </span>
                  )}
                  {(pricePresetIdx !== 0 ||
                    minPrice !== "" ||
                    maxPrice !== "") && (
                    <span className="filter-chip">
                      السعر:{" "}
                      {minPrice !== "" || maxPrice !== ""
                        ? `${minPrice || 0} إلى ${maxPrice || "..."} ج.م`
                        : pricePresets[pricePresetIdx].label}
                      <button
                        type="button"
                        onClick={() => {
                          setPricePresetIdx(0)
                          setMinPrice("")
                          setMaxPrice("")
                        }}
                      >
                        <X />
                      </button>
                    </span>
                  )}
                  {selectedTag !== "الكل" && (
                    <span className="filter-chip">
                      السمة: {selectedTag}
                      <button
                        type="button"
                        onClick={() => handleTagChange("الكل")}
                      >
                        <X />
                      </button>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="clear-all-chip"
                  >
                    مسح الكل
                  </button>
                </div>
              )}
            </div>

            {}
            {paginatedProducts.length > 0 ? (
              <>
                <div className="ecommerce-products-grid">
                  {paginatedProducts.map((product, index) => (
                    <ProductCard
                      product={product}
                      index={startIndex + index}
                      key={product.id}
                    />
                  ))}
                </div>

                {}
                {totalPages > 1 && (
                  <nav
                    className="catalog-pagination"
                    aria-label="ترقيم الصفحات"
                  >
                    {}
                    <button
                      type="button"
                      className="pagination-btn prev-btn"
                      disabled={safePage === 1}
                      onClick={() => goToPage(safePage - 1)}
                      aria-label="الانتقال إلى الصفحة السابقة"
                    >
                      <ArrowRight />
                      <span>السابق</span>
                    </button>

                    {}
                    <div className="pagination-numbers">
                      {pageNumbers.map((p, idx) =>
                        typeof p === "number" ? (
                          <button
                            key={p}
                            type="button"
                            className={`page-num-btn ${
                              safePage === p ? "active" : ""
                            }`}
                            onClick={() => goToPage(p)}
                            aria-label={`الصفحة ${p}`}
                            aria-current={safePage === p ? "page" : undefined}
                          >
                            {number.format(p)}
                          </button>
                        ) : (
                          <span
                            key={`dots-${idx}`}
                            className="pagination-ellipsis"
                          >
                            …
                          </span>
                        ),
                      )}
                    </div>

                    {}
                    <button
                      type="button"
                      className="pagination-btn next-btn"
                      disabled={safePage === totalPages}
                      onClick={() => goToPage(safePage + 1)}
                      aria-label="الانتقال إلى الصفحة التالية"
                    >
                      <span>التالي</span>
                      <ArrowLeft />
                    </button>

                    {}
                    <div className="page-size-selector">
                      <span>عرض:</span>
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value))
                          setCurrentPage(1)
                        }}
                        aria-label="عدد المنتجات في كل صفحة"
                      >
                        {PAGE_SIZE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt} صنف
                          </option>
                        ))}
                      </select>
                    </div>
                  </nav>
                )}
              </>
            ) : (
              <div className="empty-catalog-state">
                <div className="empty-icon-box">
                  <Search />
                </div>
                <h3>لم نعثر على أي صنف مطابق لاختياراتك</h3>
                <p>
                  جرّب إزالة بعض الفلاتر أو استخدام كلمات بحث مختلفة للاطلاع على
                  تشكيلة المنتجات المتوفرة.
                </p>
                <div className="empty-actions">
                  <button
                    type="button"
                    className="primary-button"
                    onClick={resetAllFilters}
                  >
                    <RotateCcw /> عرض كل المنتجات ({products.length})
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </section>

      {}
      {showMobileFilters && (
        <div
          className="mobile-filter-overlay"
          onClick={() => setShowMobileFilters(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="mobile-filter-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-filter-header">
              <h3>
                <Filter className="sidebar-title-icon" />
                <span>تصفية المنتجات</span>
              </h3>
              <button
                type="button"
                className="close-drawer-btn"
                onClick={() => setShowMobileFilters(false)}
                aria-label="إغلاق التصفية"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mobile-filter-body">
              {}
              <div className="filter-group">
                <h4 className="filter-group-title">الأقسام</h4>
                <div className="category-filter-list">
                  <button
                    type="button"
                    className={`category-filter-item ${
                      section === "الكل" ? "active" : ""
                    }`}
                    onClick={() => handleCategoryChange("الكل")}
                  >
                    <span>الكل</span>
                    <span className="count-pill">
                      {sectionCounts["الكل"] || 0}
                    </span>
                  </button>
                  {sections.map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      className={`category-filter-item ${
                        section === sec ? "active" : ""
                      }`}
                      onClick={() => handleCategoryChange(sec)}
                    >
                      <span>{sec}</span>
                      <span className="count-pill">
                        {sectionCounts[sec] || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {}
              <div className="filter-group">
                <h4 className="filter-group-title">السعر (ج.م)</h4>
                <div className="price-preset-chips">
                  {pricePresets.map((preset, idx) => (
                    <button
                      key={preset.label}
                      type="button"
                      className={`price-preset-chip ${
                        pricePresetIdx === idx ? "active" : ""
                      }`}
                      onClick={() => handlePresetChange(idx)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {}
              <div className="filter-group">
                <h4 className="filter-group-title">السمات</h4>
                <div className="tag-checkbox-list">
                  {specialTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className={`tag-checkbox-item ${
                        selectedTag === tag ? "active" : ""
                      }`}
                      onClick={() => handleTagChange(tag)}
                    >
                      <span className="checkbox-indicator">
                        {selectedTag === tag && <Check className="check-svg" />}
                      </span>
                      <span>{tag}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mobile-filter-footer">
              <button
                type="button"
                className="primary-button"
                style={{ width: "100%" }}
                onClick={() => setShowMobileFilters(false)}
              >
                عرض ({totalItems}) صنف مطابق
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      <Footer />
    </main>
  )
}
