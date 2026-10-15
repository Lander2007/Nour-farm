"use client"

import React, { useState, useMemo, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Plus,
  Trash2,
  Edit3,
  Star,
  Search,
  RotateCcw,
  Download,
  Upload,
  LayoutGrid,
  Table as TableIcon,
  ExternalLink,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  X,
  Image as ImageIcon,
  Check,
  TrendingUp,
  Package,
  Layers,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react"

import { useProductsStore } from "@/store/products"
import { sections, type Product } from "@/data/products"
import { farmImagePaths } from "./farm-images"
import "./admin.css"

const ADMIN_PASSCODE = "2026"

const TINT_OPTIONS = [
  { label: "وردي (Rose)", value: "rose" },
  { label: "نعناعي (Mint)", value: "mint" },
  { label: "شمسي (Sun)", value: "sun" },
  { label: "مرجاني (Coral)", value: "coral" },
  { label: "خوخي (Peach)", value: "peach" },
]

export default function AdminDashboardPage() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleFeatured,
    resetToDefault,
    setProducts,
  } = useProductsStore()

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [passcode, setPasscode] = useState<string>("")
  const [authError, setAuthError] = useState<string>("")

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [selectedSection, setSelectedSection] = useState<string>("الكل")
  const [statusFilter, setStatusFilter] = useState<"all" | "featured" | "bestseller">("all")
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "name">("default")
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")

  // Modals & Dialogs
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false)
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false)

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    slug: "",
    section: "خضار طازج",
    unit: "كيلو",
    step: 0.5,
    price: 20,
    image: farmImagePaths[0] || "/tomato.webp",
    tint: "rose",
    featured: false,
    tag: "طازج اليوم",
    badge: "",
    calories: "",
  })

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  // Check saved session
  useEffect(() => {
    const saved = localStorage.getItem("noor-farm-admin-auth")
    if (saved === "true") {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (passcode.trim() === ADMIN_PASSCODE || passcode.trim() === "1234") {
      setIsAuthenticated(true)
      localStorage.setItem("noor-farm-admin-auth", "true")
      setAuthError("")
      showToast("مرحباً بك في لوحة تحكم نور فارم!")
    } else {
      setAuthError("رمز المرور غير صحيح. حاول مرة أخرى.")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("noor-farm-admin-auth")
    setPasscode("")
  }

  // KPI Calculations
  const stats = useMemo(() => {
    const total = products.length
    const featuredCount = products.filter((p) => p.featured).length
    const avgPrice =
      total > 0
        ? Math.round((products.reduce((acc, p) => acc + p.price, 0) / total) * 10) / 10
        : 0
    return { total, featuredCount, avgPrice }
  }, [products])

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let result = [...products]

    // Category filter
    if (selectedSection !== "الكل") {
      result = result.filter((p) => p.section === selectedSection)
    }

    // Status filter
    if (statusFilter === "featured") {
      result = result.filter((p) => p.featured)
    } else if (statusFilter === "bestseller") {
      result = result.filter((p) => p.badge?.includes("الأكثر") || p.tag?.includes("الأكثر"))
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.tag?.toLowerCase().includes(q) ||
          p.badge?.toLowerCase().includes(q)
      )
    }

    // Sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price)
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name, "ar"))
    }

    return result
  }, [products, selectedSection, statusFilter, searchQuery, sortBy])

  // Open Form for Adding New Product
  const handleOpenAddModal = () => {
    setEditingProduct(null)
    setFormData({
      name: "",
      slug: `item-${Date.now().toString().slice(-5)}`,
      section: selectedSection !== "الكل" ? (selectedSection as any) : "خضار طازج",
      unit: "كيلو",
      step: 0.5,
      price: 25,
      image: farmImagePaths[0] || "/tomato.webp",
      tint: "rose",
      featured: false,
      tag: "طازج المزرعة",
      badge: "جديد",
      calories: "٣٠ سعرة / ١٠٠جم",
    })
    setIsFormOpen(true)
  }

  // Open Form for Editing Product
  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product)
    setFormData({ ...product })
    setIsFormOpen(true)
  }

  // Save Add/Edit
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name?.trim()) {
      alert("يرجى كتابة اسم المنتج")
      return
    }

    const priceNum = Number(formData.price) || 0
    if (priceNum <= 0) {
      alert("يرجى إدخال سعر صحيح للمنتج")
      return
    }

    const finalProduct: Product = {
      id: editingProduct ? editingProduct.id : (formData.slug?.trim() || `prod-${Date.now()}`),
      slug: formData.slug?.trim() || `prod-${Date.now()}`,
      name: formData.name.trim(),
      section: formData.section as any,
      unit: formData.unit?.trim() || "كيلو",
      step: Number(formData.step) || 0.5,
      price: priceNum,
      image: formData.image || "/noor-farm-images/IMG-20261014-WA0114.jpg",
      tint: formData.tint || "rose",
      featured: !!formData.featured,
      tag: formData.tag?.trim() || undefined,
      badge: formData.badge?.trim() || undefined,
      calories: formData.calories?.trim() || undefined,
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, finalProduct)
      showToast(`تم تحديث الصنف "${finalProduct.name}" بنجاح!`)
    } else {
      addProduct(finalProduct)
      showToast(`تمت إضافة الصنف "${finalProduct.name}" إلى المتجر!`)
    }

    setIsFormOpen(false)
  }

  // Prompt Delete
  const handlePromptDelete = (product: Product) => {
    setProductToDelete(product)
    setIsDeleteModalOpen(true)
  }

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id)
      showToast(`تم حذف "${productToDelete.name}" من المتجر`)
      setIsDeleteModalOpen(false)
      setProductToDelete(null)
    }
  }

  // Quick Price Edit Handler
  const handleQuickPriceChange = (id: string, newPrice: number) => {
    if (newPrice > 0) {
      updateProduct(id, { price: newPrice })
      showToast("تم تحديث السعر فورياً!")
    }
  }

  // Image File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData((prev) => ({ ...prev, image: event.target!.result as string }))
          showToast("تم رفع الصورة بنجاح!")
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Export JSON Catalog
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2))
    const downloadAnchor = document.createElement("a")
    downloadAnchor.setAttribute("href", dataStr)
    downloadAnchor.setAttribute("download", `noor-farm-catalog-${new Date().toISOString().slice(0, 10)}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    showToast("تم تحميل ملف الكتالوج بنجاح!")
  }

  // Import JSON Catalog
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string)
          if (Array.isArray(imported)) {
            setProducts(imported)
            showToast(`تم استيراد ${imported.length} منتج بنجاح!`)
          } else {
            alert("الملف غير صالح: يجب أن يكون مصفوفة منتجات JSON")
          }
        } catch {
          alert("خطأ في قراءة ملف JSON")
        }
      }
      reader.readAsText(file)
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER: PASSCODE LOCK
  // ─────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="admin-lock-screen">
        <div className="admin-lock-card">
          <div className="lock-logo-badge">
            <Lock size={34} color="#81c784" />
          </div>
          <h1 className="lock-title">لوحة تحكم نور فارم</h1>
          <p className="lock-subtitle">
            منطقة الإدارة الآمنة للمشرفين. يرجى إدخال رمز المرور السري للوصول إلى بيانات المتجر.
          </p>

          <form onSubmit={handleLogin}>
            <div className="lock-input-group">
              <input
                type="password"
                className="lock-input"
                placeholder="••••"
                maxLength={8}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                autoFocus
              />
            </div>

            {authError && (
              <p style={{ color: "#ef5350", fontSize: "0.85rem", marginBottom: "1rem" }}>
                {authError}
              </p>
            )}

            <button type="submit" className="lock-btn-submit">
              <Unlock size={19} />
              <span>دخول لوحة التحكم</span>
            </button>
          </form>

          <p className="lock-hint">
            رمز المرور الافتراضي:{" "}
            <button
              type="button"
              className="lock-hint-code"
              onClick={() => {
                setPasscode(ADMIN_PASSCODE)
                setIsAuthenticated(true)
                localStorage.setItem("noor-farm-admin-auth", "true")
                showToast("مرحباً بك في لوحة تحكم نور فارم!")
              }}
              title="اضغط للدخول المباشر"
              style={{ border: "none", cursor: "pointer" }}
            >
              2026 (دخول فوري)
            </button>
          </p>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER: MAIN EXECUTIVE DASHBOARD
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="admin-root">
      {/* EXECUTIVE TOP HEADER */}
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-brand">
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid rgba(46,125,50,0.3)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <Image src="/logo-icon.png" alt="Noor Farm Logo" width={44} height={44} />
              </div>
              <div>
                <h1 className="admin-brand-title">NOOR FARM • لوحة الإدارة</h1>
                <span className="admin-brand-tagline">
                  <span className="status-dot" />
                  جلسة آمنة نشطة • المشرف العام
                </span>
              </div>
            </Link>
          </div>

          <div className="admin-header-actions">
            <Link href="/products" target="_blank" className="admin-action-btn-ghost">
              <span>معاينة المتجر المباشر</span>
              <ExternalLink size={15} />
            </Link>
            <button type="button" onClick={handleLogout} className="admin-action-btn-danger">
              <Lock size={15} />
              <span>قفل اللوحة</span>
            </button>
          </div>
        </div>
      </header>

      {/* DASHBOARD BODY */}
      <main className="admin-container">
        {/* KPI CARDS */}
        <section className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-card-title">إجمالي المنتجات</span>
              <div className="kpi-card-icon">
                <Package size={22} />
              </div>
            </div>
            <div className="kpi-card-value">{stats.total}</div>
            <div className="kpi-card-subline">
              <CheckCircle2 size={14} color="#2e7d32" />
              <span>جميع الأصناف متاحة للطلب الفوري</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-card-title">أقسام المتجر</span>
              <div className="kpi-card-icon" style={{ background: "#e0f2f1", color: "#00695c" }}>
                <Layers size={22} />
              </div>
            </div>
            <div className="kpi-card-value">٥</div>
            <div className="kpi-card-subline">خضار طازج، خضرة، جاهز، سلطات، فواكه</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-card-title">منتجات مميزة في الهيرو</span>
              <div className="kpi-card-icon" style={{ background: "#fff8e1", color: "#f57f17" }}>
                <Sparkles size={22} />
              </div>
            </div>
            <div className="kpi-card-value">{stats.featuredCount}</div>
            <div className="kpi-card-subline">تظهر في صدارة المتجر وقائمة التوصيات</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-card-title">متوسط السعر</span>
              <div className="kpi-card-icon" style={{ background: "#fbe9e7", color: "#d8402f" }}>
                <TrendingUp size={22} />
              </div>
            </div>
            <div className="kpi-card-value">{stats.avgPrice} <span style={{ fontSize: "1.1rem" }}>ج.م</span></div>
            <div className="kpi-card-subline">متوسط سعر الكيلو عبر الكتالوج</div>
          </div>
        </section>

        {/* TOOLBAR & CONTROLS */}
        <div className="admin-toolbar-card">
          <div className="toolbar-top-row">
            <div className="toolbar-search-wrapper">
              <Search className="toolbar-search-icon" size={18} />
              <input
                type="text"
                className="toolbar-search-input"
                placeholder="ابحث بالاسم، المعرف، الوسم، أو الشارة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="toolbar-buttons-group">
              <button type="button" onClick={handleOpenAddModal} className="btn-primary-add">
                <Plus size={18} />
                <span>إضافة منتج جديد</span>
              </button>

              <button
                type="button"
                onClick={() => setIsResetModalOpen(true)}
                className="btn-secondary-action"
                title="استعادة المنتجات الـ 156 الأصلية"
              >
                <RotateCcw size={16} />
                <span>استعادة الأصناف الأصلية</span>
              </button>

              <button
                type="button"
                onClick={handleExportJSON}
                className="btn-secondary-action"
                title="تصدير كملف JSON"
              >
                <Download size={16} />
                <span>تصدير (JSON)</span>
              </button>

              <label className="btn-secondary-action" style={{ cursor: "pointer" }}>
                <Upload size={16} />
                <span>استيراد</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </div>

          {/* FILTERS & CATEGORIES ROW */}
          <div className="toolbar-filters-row">
            <div className="category-tabs">
              <button
                type="button"
                onClick={() => setSelectedSection("الكل")}
                className={`category-tab-btn ${selectedSection === "الكل" ? "active" : ""}`}
              >
                <span>الكل</span>
                <span className="tab-badge">{products.length}</span>
              </button>
              {sections.map((sec) => {
                const count = products.filter((p) => p.section === sec).length
                return (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setSelectedSection(sec)}
                    className={`category-tab-btn ${selectedSection === sec ? "active" : ""}`}
                  >
                    <span>{sec}</span>
                    <span className="tab-badge">{count}</span>
                  </button>
                )
              })}
            </div>

            <div className="view-controls">
              <select
                className="form-select"
                style={{ padding: "0.45rem 0.85rem", fontSize: "0.85rem", width: "auto" }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">كل الحالات</option>
                <option value="featured">المميزة فقط ⭐</option>
                <option value="bestseller">الأكثر طلباً 🔥</option>
              </select>

              <select
                className="form-select"
                style={{ padding: "0.45rem 0.85rem", fontSize: "0.85rem", width: "auto" }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="default">الترتيب الافتراضي</option>
                <option value="price-asc">السعر: من الأقل</option>
                <option value="price-desc">السعر: من الأعلى</option>
                <option value="name">الاسم: أ - ي</option>
              </select>

              <div className="view-mode-toggle">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`view-btn ${viewMode === "table" ? "active" : ""}`}
                  title="عرض الجدول"
                >
                  <TableIcon size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                  title="عرض الكروت"
                >
                  <LayoutGrid size={17} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RESULTS COUNT & STATUS */}
        <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: "0.9rem", color: "#55704a", fontWeight: 600 }}>
            عرض <strong style={{ color: "#1e3322" }}>{filteredProducts.length}</strong> من أصل{" "}
            <strong>{products.length}</strong> منتج
          </p>
        </div>

        {/* VIEW A: EXECUTIVE TABLE VIEW */}
        {viewMode === "table" ? (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 80 }}>الصورة</th>
                  <th>اسم الصنف والمعرّف</th>
                  <th>القسم</th>
                  <th>السعر الحالي</th>
                  <th>الوحدة والخطوة</th>
                  <th>الوسم / الشارة</th>
                  <th style={{ textAlign: "center" }}>مميز</th>
                  <th style={{ textAlign: "center" }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="product-thumb-cell">
                        <img src={p.image} alt={p.name} className="product-thumb-img" />
                      </div>
                    </td>
                    <td>
                      <div className="product-name-title">{p.name}</div>
                      <div className="product-name-slug">{p.slug}</div>
                    </td>
                    <td>
                      <span className={`section-badge-pill section-pill-${p.section.replace(/\s+/g, "-")}`}>
                        {p.section}
                      </span>
                    </td>
                    <td>
                      <div className="price-inline-editor">
                        <input
                          type="number"
                          className="price-number-input"
                          defaultValue={p.price}
                          onBlur={(e) => handleQuickPriceChange(p.id, Number(e.target.value))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              ;(e.target as HTMLInputElement).blur()
                            }
                          }}
                        />
                        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#55704a" }}>ج.م</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{p.unit}</span>
                      <span style={{ fontSize: "0.78rem", opacity: 0.6, display: "block" }}>
                        (خطوة: {p.step})
                      </span>
                    </td>
                    <td>
                      {p.badge && (
                        <span
                          style={{
                            background: "#d8402f",
                            color: "#ffffff",
                            padding: "0.15rem 0.5rem",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            marginLeft: "0.35rem",
                          }}
                        >
                          {p.badge}
                        </span>
                      )}
                      {p.tag && (
                        <span style={{ fontSize: "0.8rem", color: "#55704a" }}>{p.tag}</span>
                      )}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={() => {
                          toggleFeatured(p.id)
                          showToast(p.featured ? `تمت إزالة تمييز "${p.name}"` : `تم تمييز "${p.name}"!`)
                        }}
                        className={`star-toggle-btn ${p.featured ? "active" : ""}`}
                        title={p.featured ? "إلغاء التمييز" : "تحديد كمنتج مميز"}
                      >
                        <Star size={18} fill={p.featured ? "#f59e0b" : "none"} />
                      </button>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div style={{ display: "inline-flex", gap: "0.45rem" }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(p)}
                          className="row-action-btn"
                          title="تعديل الصنف"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePromptDelete(p)}
                          className="row-action-btn delete"
                          title="حذف الصنف"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* VIEW B: GRID CARDS VIEW */
          <div className="admin-cards-grid">
            {filteredProducts.map((p) => (
              <div key={p.id} className="admin-product-card">
                <div className="card-img-wrapper">
                  <img src={p.image} alt={p.name} className="card-img" />
                  {p.badge && <span className="card-badge-overlay">{p.badge}</span>}
                  <button
                    type="button"
                    onClick={() => toggleFeatured(p.id)}
                    className="card-featured-star"
                    title="تمييز"
                  >
                    <Star size={16} fill={p.featured ? "#f59e0b" : "none"} color={p.featured ? "#f59e0b" : "#c7bca7"} />
                  </button>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                    <span className={`section-badge-pill section-pill-${p.section.replace(/\s+/g, "-")}`} style={{ fontSize: "0.75rem" }}>
                      {p.section}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "#718766" }}>{p.tag}</span>
                  </div>

                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0.25rem 0", color: "#1e3322" }}>
                    {p.name}
                  </h3>

                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.35rem", margin: "0.5rem 0" }}>
                    <strong style={{ fontSize: "1.25rem", color: "#d8402f" }}>{p.price} ج.م</strong>
                    <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>/ {p.unit}</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", paddingTop: "0.8rem", borderTop: "1px solid rgba(47,59,39,0.08)" }}>
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(p)}
                    className="btn-secondary-action"
                    style={{ flex: 1, justifyContent: "center", padding: "0.5rem" }}
                  >
                    <Edit3 size={15} />
                    <span>تعديل</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePromptDelete(p)}
                    className="row-action-btn delete"
                    style={{ width: 40, height: 40 }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ─────────────────────────────────────────────────────────────
         MODAL 1: ADD / EDIT PRODUCT
         ───────────────────────────────────────────────────────────── */}
      {isFormOpen && (
        <div className="modal-backdrop" onClick={() => setIsFormOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingProduct ? `تعديل صنف: ${editingProduct.name}` : "إضافة منتج جديد للكتالوج"}
              </h2>
              <button type="button" onClick={() => setIsFormOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
              <div className="modal-body">
                <div className="form-grid-layout">
                  {/* RIGHT COLUMN: FIELDS */}
                  <div>
                    <div className="form-group">
                      <label className="form-label">اسم المنتج بالكامل (عربي) *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="مثال: فراولة بلدي سكرية فاخرة"
                        value={formData.name || ""}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label className="form-label">القسم الرئيسي *</label>
                        <select
                          className="form-select"
                          value={formData.section}
                          onChange={(e) => setFormData((prev) => ({ ...prev, section: e.target.value as any }))}
                        >
                          {sections.map((sec) => (
                            <option key={sec} value={sec}>
                              {sec}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">السعر (ج.م) *</label>
                        <input
                          type="number"
                          step="any"
                          className="form-input"
                          placeholder="25"
                          value={formData.price ?? ""}
                          onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label className="form-label">وحدة القياس *</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="كيلو / نصف كيلو / حزمة"
                          value={formData.unit || ""}
                          onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">معدل الزيادة (الخطوة) *</label>
                        <select
                          className="form-select"
                          value={formData.step}
                          onChange={(e) => setFormData((prev) => ({ ...prev, step: Number(e.target.value) }))}
                        >
                          <option value={0.5}>0.5 (نصف وحدة)</option>
                          <option value={1}>1.0 (وحدة كاملة)</option>
                          <option value={0.25}>0.25 (ربع وحدة)</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label className="form-label">الوسم التسويقي (Tag)</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="مثال: بلدي طازج / سكر معقود"
                          value={formData.tag || ""}
                          onChange={(e) => setFormData((prev) => ({ ...prev, tag: e.target.value }))}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">الشارة الترويجية (Badge)</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="مثال: الأكثر طلباً / جديد"
                          value={formData.badge || ""}
                          onChange={(e) => setFormData((prev) => ({ ...prev, badge: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label className="form-label">لون الكارت (Tint)</label>
                        <select
                          className="form-select"
                          value={formData.tint}
                          onChange={(e) => setFormData((prev) => ({ ...prev, tint: e.target.value }))}
                        >
                          {TINT_OPTIONS.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">المعرف الإنجليزي (Slug / ID)</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="strawberry"
                          value={formData.slug || ""}
                          onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div style={{ marginTop: "0.5rem" }}>
                      <label style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", fontWeight: 700 }}>
                        <input
                          type="checkbox"
                          checked={formData.featured || false}
                          onChange={(e) => setFormData((prev) => ({ ...prev, featured: e.target.checked }))}
                          style={{ width: 18, height: 18, accentColor: "#2e7d32" }}
                        />
                        <span>تمييز هذا المنتج في الواجهة الرئيسية للمتجر ⭐</span>
                      </label>
                    </div>
                  </div>

                  {/* LEFT COLUMN: IMAGE SELECTOR & LIVE PREVIEW */}
                  <div>
                    <label className="form-label">صورة الصنف *</label>
                    <div className="image-picker-box">
                      <div
                        style={{
                          width: 140,
                          height: 140,
                          margin: "0 auto 1rem",
                          borderRadius: 14,
                          overflow: "hidden",
                          border: "1px solid rgba(47,59,39,0.15)",
                          background: "#ffffff",
                        }}
                      >
                        <img
                          src={formData.image || "/noor-farm-images/IMG-20261014-WA0114.jpg"}
                          alt="معاينة الصورة"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <button
                          type="button"
                          onClick={() => setIsGalleryOpen(true)}
                          className="btn-primary-add"
                          style={{ width: "100%", justifyContent: "center", padding: "0.65rem", fontSize: "0.85rem" }}
                        >
                          <ImageIcon size={16} />
                          <span>اختيار من مكتبة صور المزرعة ({farmImagePaths.length} صورة)</span>
                        </button>

                        <label
                          className="btn-secondary-action"
                          style={{ width: "100%", justifyContent: "center", padding: "0.65rem", fontSize: "0.85rem", cursor: "pointer" }}
                        >
                          <Upload size={16} />
                          <span>رفع صورة من جهازك</span>
                          <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
                        </label>
                      </div>

                      <div style={{ marginTop: "0.75rem", textAlign: "right" }}>
                        <label style={{ fontSize: "0.75rem", color: "#718766" }}>أو أدخل مسار الصورة المباشر:</label>
                        <input
                          type="text"
                          className="form-input"
                          style={{ fontSize: "0.8rem", padding: "0.45rem 0.65rem" }}
                          value={formData.image || ""}
                          onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                        />
                      </div>
                    </div>

                    {/* LIVE CARD PREVIEW */}
                    <div style={{ marginTop: "1rem" }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#55704a", display: "block", marginBottom: "0.4rem" }}>
                        معاينة كيف سيظهر الصنف في المتجر:
                      </span>
                      <div
                        style={{
                          background: "#ffffff",
                          border: "1px solid rgba(47,59,39,0.12)",
                          borderRadius: 16,
                          padding: "1rem",
                          boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                        }}
                      >
                        <div style={{ height: 110, borderRadius: 10, overflow: "hidden", background: "#f5efe1", position: "relative" }}>
                          <img
                            src={formData.image || "/noor-farm-images/IMG-20261014-WA0114.jpg"}
                            alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                          {formData.badge && (
                            <span
                              style={{
                                position: "absolute",
                                top: 6,
                                right: 6,
                                background: "#d8402f",
                                color: "#ffffff",
                                padding: "0.2rem 0.5rem",
                                borderRadius: 999,
                                fontSize: "0.7rem",
                                fontWeight: 700,
                              }}
                            >
                              {formData.badge}
                            </span>
                          )}
                        </div>
                        <h4 style={{ margin: "0.6rem 0 0.2rem", fontSize: "0.95rem", fontWeight: 700 }}>
                          {formData.name || "اسم الصنف"}
                        </h4>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <strong style={{ color: "#d8402f", fontSize: "1.1rem" }}>
                            {formData.price || 0} ج.م
                          </strong>
                          <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>/ {formData.unit || "كيلو"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="btn-secondary-action"
                >
                  إلغاء
                </button>
                <button type="submit" className="btn-primary-add">
                  <Check size={18} />
                  <span>{editingProduct ? "حفظ التعديلات" : "إضافة الصنف الآن"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
         MODAL 2: FARM IMAGES GALLERY PICKER
         ───────────────────────────────────────────────────────────── */}
      {isGalleryOpen && (
        <div className="modal-backdrop" onClick={() => setIsGalleryOpen(false)}>
          <div className="modal-dialog" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">اختر من مكتبة صور نور فارم</h2>
              <button type="button" onClick={() => setIsGalleryOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: "0.85rem", color: "#55704a", marginBottom: "1rem" }}>
                انقر على الصورة المناسبة ليتم ربطها مباشرة مع المنتج:
              </p>
              <div className="gallery-grid">
                {farmImagePaths.map((imgPath) => (
                  <div
                    key={imgPath}
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, image: imgPath }))
                      setIsGalleryOpen(false)
                      showToast("تم اختيار الصورة بنجاح!")
                    }}
                    className={`gallery-item ${formData.image === imgPath ? "selected" : ""}`}
                  >
                    <img src={imgPath} alt="صورة المزرعة" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" onClick={() => setIsGalleryOpen(false)} className="btn-secondary-action">
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
         MODAL 3: DELETE CONFIRMATION
         ───────────────────────────────────────────────────────────── */}
      {isDeleteModalOpen && productToDelete && (
        <div className="modal-backdrop" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal-dialog" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ background: "#fef2f2" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "#dc2626" }}>
                <AlertTriangle size={24} />
                <h2 className="modal-title" style={{ color: "#dc2626", fontSize: "1.2rem" }}>
                  تأكيد حذف الصنف
                </h2>
              </div>
              <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ textAlign: "center", padding: "2rem 1.5rem" }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 16,
                  overflow: "hidden",
                  margin: "0 auto 1rem",
                  border: "2px solid #fee2e2",
                }}
              >
                <img src={productToDelete.image} alt={productToDelete.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>

              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#1a2a1d", marginBottom: "0.5rem" }}>
                {productToDelete.name}
              </h3>
              <p style={{ fontSize: "0.9rem", color: "#6b7280", lineHeight: 1.6 }}>
                هل أنت متأكد من رغبتك في حذف هذا المنتج نهائياً من المتجر؟ سيتم تحديث الكتالوج فوراً للعملاء.
              </p>
            </div>

            <div className="modal-footer">
              <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="btn-secondary-action">
                تراجع
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="btn-primary-add"
                style={{ background: "#dc2626" }}
              >
                <Trash2 size={16} />
                <span>نعم، احذف المنتج</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
         MODAL 4: RESET TO DEFAULT CONFIRMATION
         ───────────────────────────────────────────────────────────── */}
      {isResetModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsResetModalOpen(false)}>
          <div className="modal-dialog" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">استعادة الكتالوج الأصلي</h2>
              <button type="button" onClick={() => setIsResetModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: "1.75rem" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <div style={{ background: "#fef3c7", padding: "0.75rem", borderRadius: 12, color: "#d97706" }}>
                  <RotateCcw size={28} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.4rem" }}>
                    استرجاع الأصناف الافتراضية الـ 156
                  </h3>
                  <p style={{ fontSize: "0.88rem", color: "#4b5563", lineHeight: 1.6 }}>
                    سيؤدي هذا الإجراء إلى إعادة تعيين قائمة المنتجات إلى الكتالوج الأصلي بالكامل ومطابقة الأسعار الافتراضية.
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" onClick={() => setIsResetModalOpen(false)} className="btn-secondary-action">
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  resetToDefault()
                  setIsResetModalOpen(false)
                  showToast("تمت استعادة الكتالوج الأصلي بنجاح!")
                }}
                className="btn-primary-add"
              >
                <RotateCcw size={16} />
                <span>تأكيد الاستعادة</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="admin-toast-container">
          <div className="admin-toast">
            <CheckCircle2 size={18} color="#81c784" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  )
}
