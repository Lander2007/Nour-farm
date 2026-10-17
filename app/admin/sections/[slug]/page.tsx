"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  Plus,
  Trash2,
  Edit3,
  Search,
  Upload,
  Image as ImageIcon,
  Check,
  X,
  AlertTriangle,
  Layers,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Eye,
  EyeOff,
  Filter,
} from "lucide-react"

import type { Product, Section, UnitType } from "@/lib/db/types"
import { farmImagePaths } from "@/app/admin/farm-images"
import { resizeImageToWebP } from "@/lib/utils/image-resize"
import "@/app/admin/admin.css"

const UNIT_OPTIONS: { value: UnitType; label: string; defaultStep: number }[] = [
  { value: "kg", label: "كيلو (kg)", defaultStep: 0.5 },
  { value: "piece", label: "بالقطعة / الواحدة", defaultStep: 1 },
  { value: "bunch", label: "حزمة", defaultStep: 1 },
  { value: "pack", label: "طبق مغلف", defaultStep: 1 },
  { value: "box", label: "علبة / كرتونة", defaultStep: 1 },
]

export default function AdminSectionManagerPage() {
  const params = useParams()
  const router = useRouter()
  const slug = (params?.slug as string) || ""

  // State
  const [sections, setSections] = useState<Section[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [savingPriceId, setSavingPriceId] = useState<string | null>(null)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("")
  const [filterMode, setFilterMode] = useState<"all" | "missing" | "published" | "draft">("all")

  // Modals & Sheets
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false)
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [bulkUploading, setBulkUploading] = useState(false)
  const [bulkProgress, setBulkProgress] = useState("")

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name_ar: "",
    section_id: slug,
    image_url: null,
    price: null,
    unit_type: "kg",
    pack_label: "",
    step: 0.5,
    published: false,
    sort: 0,
  })

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Fetch sections and products
  const loadData = async () => {
    try {
      setLoading(true)
      const [secRes, prodRes] = await Promise.all([
        fetch("/api/admin/sections"),
        fetch(`/api/admin/products?sectionId=${encodeURIComponent(slug)}`),
      ])

      if (secRes.status === 401 || prodRes.status === 401) {
        router.push("/admin/login")
        return
      }

      if (secRes.ok) {
        const secData = await secRes.json()
        setSections(secData.sections || [])
      }

      if (prodRes.ok) {
        const prodData = await prodRes.json()
        setProducts(prodData.products || [])
      }
    } catch (err) {
      console.error("Failed to load section data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (slug) {
      loadData()
    }
  }, [slug])

  // Current section details
  const currentSection = useMemo(() => {
    return (
      sections.find((s) => s.id === slug) || {
        id: slug,
        name_ar: slug,
        department_id: "vegetables",
        cover_image: null,
        sort: 1,
      }
    )
  }, [sections, slug])

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        searchQuery === "" ||
        p.name_ar.toLowerCase().includes(searchQuery.toLowerCase())

      const isMissing = !p.image_url || p.price === null || p.price === undefined || p.price <= 0

      if (filterMode === "missing") {
        return matchSearch && isMissing
      }
      if (filterMode === "published") {
        return matchSearch && p.published
      }
      if (filterMode === "draft") {
        return matchSearch && !p.published
      }
      return matchSearch
    })
  }, [products, searchQuery, filterMode])

  // Counts
  const counts = useMemo(() => {
    const total = products.length
    const missing = products.filter(
      (p) => !p.image_url || p.price === null || p.price === undefined || p.price <= 0
    ).length
    const published = products.filter((p) => p.published).length
    const drafts = total - published
    return { total, missing, published, drafts }
  }, [products])

  // Quick Inline Price Save
  const handleQuickPriceChange = async (p: Product, newPriceStr: string) => {
    const val = Number(newPriceStr.trim())
    if (isNaN(val) || val < 0 || val === p.price) return

    try {
      setSavingPriceId(p.id)
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: val }),
      })
      if (res.ok) {
        setProducts((prev) =>
          prev.map((item) => (item.id === p.id ? { ...item, price: val } : item))
        )
        showToast(`تم حفظ سعر "${p.name_ar}" إلى ${val} ج.م`)
      }
    } catch {
      showToast("فشل تحديث السعر")
    } finally {
      setTimeout(() => setSavingPriceId(null), 1200)
    }
  }

  // Quick Toggle Published
  const handleTogglePublished = async (p: Product) => {
    if (!p.published && (!p.price || p.price <= 0)) {
      alert("⚠️ يرجى تحديد سعر صالح للمنتج أولاً قبل نشره في المتجر.")
      return
    }

    try {
      const newStatus = !p.published
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: newStatus }),
      })
      if (res.ok) {
        setProducts((prev) =>
          prev.map((item) =>
            item.id === p.id ? { ...item, published: newStatus } : item
          )
        )
        showToast(
          newStatus
            ? `تم نشر "${p.name_ar}" في المتجر!`
            : `تم تحويل "${p.name_ar}" إلى مسودة.`
        )
      }
    } catch {
      showToast("فشل تغيير حالة النشر")
    }
  }

  // Open Edit Sheet
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p)
    setFormData({ ...p })
    setIsEditSheetOpen(true)
  }

  // Open Create Sheet
  const handleOpenCreate = () => {
    setEditingProduct(null)
    setFormData({
      name_ar: "",
      section_id: slug,
      image_url: null,
      price: null,
      unit_type: "kg",
      pack_label: "",
      step: 0.5,
      published: false,
      sort: products.length + 1,
    })
    setIsEditSheetOpen(true)
  }

  // Image Upload handler with WebP resize
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      showToast("جاري تحويل وضغط الصورة إلى WebP...")
      const webpFile = await resizeImageToWebP(file, 1200, 0.85)

      const bodyData = new FormData()
      bodyData.append("file", webpFile)

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: bodyData,
      })

      const data = await res.json()
      if (!res.ok) {
        alert(data.error || "فشل رفع الصورة")
        return
      }

      setFormData((prev) => ({ ...prev, image_url: data.url }))
      showToast("تم رفع وتعيين الصورة بنجاح!")
    } catch (err: any) {
      alert("خطأ أثناء معالجة الصورة: " + err.message)
    }
  }

  // Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name_ar?.trim()) {
      alert("اسم المنتج بالعربية مطلوب")
      return
    }

    if (formData.published && (!formData.price || formData.price <= 0)) {
      alert("لا يمكن نشر المنتج بدون تحديد سعر صالح")
      return
    }

    const payload = {
      ...formData,
      section_id: formData.section_id || slug,
      price: formData.price !== null && formData.price !== undefined ? Number(formData.price) : null,
      step: formData.unit_type === "kg" ? 0.5 : 1,
      sort: Number(formData.sort) || 0,
    }

    try {
      if (editingProduct) {
        const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const err = await res.json()
          alert(err.error || "فشل تحديث المنتج")
          return
        }
        showToast(`تم تحديث الصنف "${formData.name_ar}" بنجاح!`)
      } else {
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const err = await res.json()
          alert(err.error || "فشل إنشاء المنتج")
          return
        }
        showToast(`تمت إضافة الصنف "${formData.name_ar}" بنجاح!`)
      }

      setIsEditSheetOpen(false)
      loadData()
    } catch {
      alert("حدث خطأ أثناء حفظ الصنف")
    }
  }

  // Delete product
  const handleConfirmDelete = async () => {
    if (!productToDelete) return

    try {
      const res = await fetch(`/api/admin/products/${productToDelete.id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        alert("فشل حذف المنتج")
        return
      }

      showToast(`تم حذف الصنف "${productToDelete.name_ar}"`)
      setIsDeleteModalOpen(false)
      setProductToDelete(null)
      loadData()
    } catch {
      alert("حدث خطأ أثناء حذف الصنف")
    }
  }

  // Bulk Image Import
  const handleBulkFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setBulkUploading(true)
    setBulkProgress(`جاري فحص وتجهيز ${files.length} ملف...`)

    const draftItems: { name_ar: string; image_url: string; section_id: string }[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setBulkProgress(`جاري رفع وضغط (${i + 1}/${files.length}): ${file.name}...`)

      const rawName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name
      const cleanName = rawName.replace(/[_-]+/g, " ").trim()

      try {
        const webpFile = await resizeImageToWebP(file, 1200, 0.85)
        const fd = new FormData()
        fd.append("file", webpFile)

        const upRes = await fetch("/api/admin/upload", {
          method: "POST",
          body: fd,
        })

        if (upRes.ok) {
          const upData = await upRes.json()
          draftItems.push({
            name_ar: cleanName,
            image_url: upData.url,
            section_id: slug,
          })
        }
      } catch (err) {
        console.error("Bulk upload item error:", err)
      }
    }

    setBulkProgress(`جاري حفظ ${draftItems.length} صنف كمسودات...`)

    for (const item of draftItems) {
      try {
        await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name_ar: item.name_ar,
            section_id: item.section_id,
            image_url: item.image_url,
            price: null,
            published: false,
            unit_type: "kg",
            step: 0.5,
          }),
        })
      } catch (err) {
        console.error("Failed to insert draft:", err)
      }
    }

    setBulkUploading(false)
    setIsBulkModalOpen(false)
    showToast(`تم استيراد ${draftItems.length} مسودة بنجاح!`)
    loadData()
  }

  return (
    <div className="admin-root min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="admin-toast-container">
          <div className="admin-toast">
            <Check size={18} color="#4ade80" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Bar / Breadcrumb */}
      <header className="admin-header">
        <div className="admin-header-inner" style={{ flexWrap: "wrap", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Link
              href="/admin"
              className="touch-target-44"
              style={{
                borderRadius: "12px",
                background: "rgba(46, 125, 50, 0.1)",
                color: "#1b5e20",
                textDecoration: "none",
                padding: "0.4rem 0.75rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                fontSize: "0.85rem",
                fontWeight: 700,
              }}
              title="العودة لكافة الأقسام"
            >
              <ArrowRight size={18} />
              <span>لوحة الإدارة</span>
            </Link>

            <span style={{ color: "#9ca3af" }}>/</span>

            <div>
              <h1 className="admin-brand-title" style={{ fontSize: "1.25rem", margin: 0 }}>
                معرض منتجات: {currentSection.name_ar}
              </h1>
              <span className="admin-brand-tagline">
                <span className="status-dot" /> قسم{" "}
                {currentSection.department_id === "fruits" ? "الفاكهة" : "الخضار"} • إجمالي{" "}
                {products.length} صنف
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {/* Section Switcher dropdown */}
            <select
              value={slug}
              onChange={(e) => router.push(`/admin/sections/${e.target.value}`)}
              style={{
                padding: "0.55rem 0.85rem",
                borderRadius: "10px",
                border: "1.5px solid #d1d5db",
                background: "#ffffff",
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "#1f2937",
                cursor: "pointer",
                minHeight: "44px",
              }}
              title="الانتقال السريع لقسم آخر"
            >
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.department_id === "fruits" ? "🍎" : "🥬"} {s.name_ar}
                </option>
              ))}
            </select>

            <Link
              href={
                currentSection.department_id === "fruits"
                  ? `/fruits#${currentSection.id}`
                  : `/vegetables#${currentSection.id}`
              }
              target="_blank"
              className="admin-action-btn-ghost touch-target-44"
              title="معاينة القسم في المتجر"
            >
              <ExternalLink size={16} />
              <span>المتجر</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="admin-container">
        {/* Top Actions & Filters */}
        <div
          style={{
            background: "#ffffff",
            padding: "1rem",
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            marginBottom: "1.25rem",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
          }}
        >
          {/* Action Buttons Row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "0.75rem",
              flexWrap: "wrap",
              marginBottom: "1rem",
            }}
          >
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", width: "100%", maxWidth: "480px" }}>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="btn-primary-add touch-target-44"
                style={{
                  flex: "1 1 auto",
                  padding: "0.6rem 1.25rem",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  boxShadow: "0 4px 12px rgba(46, 125, 50, 0.2)",
                }}
              >
                <Plus size={18} />
                <span>إضافة منتج جديد</span>
              </button>

              <button
                type="button"
                onClick={() => setIsBulkModalOpen(true)}
                className="btn-secondary-action touch-target-44"
                style={{
                  flex: "1 1 auto",
                  padding: "0.6rem 1rem",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "#1e3322",
                }}
              >
                <Upload size={16} />
                <span>استيراد صور جماعي</span>
              </button>
            </div>

            {/* Search Input */}
            <div style={{ position: "relative", minWidth: "220px", flex: "1 1 220px" }}>
              <Search
                size={16}
                color="#9ca3af"
                style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type="text"
                placeholder="بحث في أصناف القسم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.6rem 2.2rem 0.6rem 0.85rem",
                  borderRadius: "10px",
                  border: "1.5px solid #d1d5db",
                  fontSize: "0.85rem",
                  outline: "none",
                  minHeight: "44px",
                }}
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => setFilterMode("all")}
              className={`category-tab-btn touch-target-44 ${filterMode === "all" ? "active" : ""}`}
              style={{ padding: "0.4rem 0.85rem", fontSize: "0.82rem" }}
            >
              <span>الكل ({counts.total})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterMode("missing")}
              className={`category-tab-btn touch-target-44 ${filterMode === "missing" ? "active" : ""}`}
              style={{
                padding: "0.4rem 0.85rem",
                fontSize: "0.82rem",
                background: filterMode === "missing" ? "#f59e0b" : counts.missing > 0 ? "#fffbeb" : "#f3f4f6",
                color: filterMode === "missing" ? "#ffffff" : counts.missing > 0 ? "#b45309" : "#6b7280",
                borderColor: counts.missing > 0 ? "#fcd34d" : "transparent",
              }}
            >
              <AlertTriangle size={14} />
              <span>بدون صورة / بدون سعر ({counts.missing})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterMode("published")}
              className={`category-tab-btn touch-target-44 ${filterMode === "published" ? "active" : ""}`}
              style={{ padding: "0.4rem 0.85rem", fontSize: "0.82rem" }}
            >
              <span>منشور فقط ({counts.published})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterMode("draft")}
              className={`category-tab-btn touch-target-44 ${filterMode === "draft" ? "active" : ""}`}
              style={{ padding: "0.4rem 0.85rem", fontSize: "0.82rem" }}
            >
              <span>مسودة فقط ({counts.drafts})</span>
            </button>
          </div>
        </div>

        {/* Gallery Product Cards Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280", fontWeight: 600 }}>
            <div className="animate-spin" style={{ display: "inline-block", marginBottom: "0.5rem" }}>
              ⏳
            </div>
            <div>جاري تحميل منتجات قسم {currentSection.name_ar}...</div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div
            style={{
              background: "#ffffff",
              padding: "3rem 1.5rem",
              borderRadius: "16px",
              textAlign: "center",
              border: "1px solid #e5e7eb",
              color: "#6b7280",
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📦</div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1f2937", marginBottom: "0.25rem" }}>
              لا توجد منتجات تطابق البحث أو الفلتر
            </h3>
            <p style={{ fontSize: "0.85rem", margin: 0 }}>
              {filterMode === "missing"
                ? "ممتاز! لا توجد منتجات ناقصة صورة أو سعر في هذا القسم."
                : "يمكنك إضافة أول منتج في هذا القسم بالضغط على زر إضافة منتج جديد بالرأس."}
            </p>
          </div>
        ) : (
          <div className="section-gallery-grid">
            {filteredProducts.map((p) => {
              const isMissingImg = !p.image_url
              const isMissingPrice = p.price === null || p.price === undefined || p.price <= 0
              const isMissing = isMissingImg || isMissingPrice

              return (
                <div
                  key={p.id}
                  className={`gallery-product-card relative ${isMissing ? "is-missing" : ""}`}
                >
                  {/* Missing Indicator Badge */}
                  {isMissing && (
                    <div
                      style={{
                        background: "#fef3c7",
                        color: "#92400e",
                        border: "1px solid #fde68a",
                        borderRadius: "8px",
                        padding: "0.3rem 0.6rem",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                      }}
                    >
                      <AlertTriangle size={13} color="#d97706" />
                      <span>
                        {isMissingImg && isMissingPrice
                          ? "بدون صورة وبدون سعر"
                          : isMissingImg
                          ? "بدون صورة (صورة ناقصة)"
                          : "بدون سعر (حدد السعر)"}
                      </span>
                    </div>
                  )}

                  {/* Top: Thumbnail & Basic Info */}
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                    {/* Thumbnail */}
                    <div
                      style={{
                        width: 76,
                        height: 76,
                        borderRadius: "12px",
                        overflow: "hidden",
                        border: "1.5px solid #e5e7eb",
                        background: "#f9fafb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        position: "relative",
                      }}
                    >
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.name_ar}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          style={{
                            textAlign: "center",
                            color: "#9ca3af",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            padding: "4px",
                          }}
                        >
                          بدون صورة
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3
                        style={{
                          fontSize: "0.95rem",
                          fontWeight: 700,
                          color: "#1e3322",
                          margin: 0,
                          marginBottom: "0.25rem",
                        }}
                      >
                        {p.name_ar}
                      </h3>
                      <div
                        style={{
                          fontSize: "0.78rem",
                          color: "#6b7280",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>
                          الوحدة: {UNIT_OPTIONS.find((u) => u.value === p.unit_type)?.label || p.unit_type}
                        </span>
                        {p.pack_label && (
                          <span
                            style={{
                              background: "#f3f4f6",
                              padding: "1px 6px",
                              borderRadius: "4px",
                              fontSize: "0.72rem",
                            }}
                          >
                            {p.pack_label}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: "0.25rem" }}>
                        ترتيب: {p.sort}
                      </div>
                    </div>
                  </div>

                  {/* Quick Inline Price Editor */}
                  <div
                    style={{
                      background: "#fcfbf9",
                      padding: "0.6rem 0.75rem",
                      borderRadius: "10px",
                      border: "1px solid #f0ede6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1e3322" }}>
                      السعر السريع:
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        defaultValue={p.price !== null && p.price !== undefined ? p.price : ""}
                        placeholder="0"
                        onBlur={(e) => handleQuickPriceChange(p, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            ;(e.target as HTMLInputElement).blur()
                          }
                        }}
                        style={{
                          width: "74px",
                          padding: "0.35rem 0.5rem",
                          borderRadius: "8px",
                          border: isMissingPrice ? "1.5px solid #f59e0b" : "1.5px solid #d1d5db",
                          textAlign: "center",
                          fontWeight: 700,
                          fontSize: "0.95rem",
                          fontFamily: "monospace",
                          color: "#1e3322",
                          background: "#ffffff",
                          minHeight: "36px",
                        }}
                      />
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#55704a" }}>
                        ج.م
                      </span>
                      {savingPriceId === p.id && (
                        <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 700 }}>
                          ✓ تم
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.5rem",
                      paddingTop: "0.5rem",
                      borderTop: "1px solid #f3f4f6",
                    }}
                  >
                    {/* Published Toggle Button (min 44px touch target) */}
                    <button
                      type="button"
                      onClick={() => handleTogglePublished(p)}
                      className="touch-target-44"
                      style={{
                        padding: "0.4rem 0.85rem",
                        borderRadius: "10px",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                        background: p.published ? "#2e7d32" : "#e5e7eb",
                        color: p.published ? "#ffffff" : "#4b5563",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        flex: 1,
                      }}
                      title={p.published ? "إلغاء النشر من المتجر" : "نشر المنتج في المتجر"}
                    >
                      {p.published ? <Eye size={15} /> : <EyeOff size={15} />}
                      <span>{p.published ? "منشور ✓" : "مسودة ✕"}</span>
                    </button>

                    {/* Edit Sheet Button (44px touch target) */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(p)}
                      className="touch-target-44"
                      style={{
                        padding: "0.4rem 0.75rem",
                        borderRadius: "10px",
                        border: "1.5px solid #d1d5db",
                        background: "#ffffff",
                        color: "#1e3322",
                        fontWeight: 700,
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.3rem",
                      }}
                      title="فتح نموذج التعديل الشامل"
                    >
                      <Edit3 size={15} color="#1b5e20" />
                      <span>تعديل</span>
                    </button>

                    {/* Delete Button (44px touch target) */}
                    <button
                      type="button"
                      onClick={() => {
                        setProductToDelete(p)
                        setIsDeleteModalOpen(true)
                      }}
                      className="touch-target-44"
                      style={{
                        padding: "0.4rem",
                        borderRadius: "10px",
                        border: "1.5px solid #fecaca",
                        background: "#fef2f2",
                        color: "#dc2626",
                        cursor: "pointer",
                      }}
                      title="حذف المنتج"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Mobile Floating Add Button */}
        <button
          type="button"
          onClick={handleOpenCreate}
          className="admin-mobile-fab"
          title="إضافة صنف جديد لهذا القسم"
        >
          <Plus size={18} />
          <span>إضافة منتج للقسم</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
         FULL SCREEN EDIT / ADD SHEET (Optimized for Mobile Phone 390px)
         ───────────────────────────────────────────────────────────── */}
      {isEditSheetOpen && (
        <div className="modal-backdrop" onClick={() => setIsEditSheetOpen(false)}>
          <div
            className="modal-dialog admin-sheet-dialog"
            style={{ maxWidth: 580 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Header */}
            <div className="modal-header" style={{ padding: "1rem 1.25rem" }}>
              <div>
                <h2 className="modal-title" style={{ fontSize: "1.1rem", margin: 0 }}>
                  {editingProduct ? `تعديل صنف: ${editingProduct.name_ar}` : "إضافة منتج جديد للقسم"}
                </h2>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "#6b7280" }}>
                  قسم: {currentSection.name_ar}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditSheetOpen(false)}
                className="modal-close-btn touch-target-44"
              >
                <X size={20} />
              </button>
            </div>

            {/* Sheet Body (Scrollable with 44px inputs) */}
            <form onSubmit={handleSaveProduct} style={{ display: "contents" }}>
              <div className="modal-body admin-sheet-body">
                {/* Product Name */}
                <div className="form-group" style={{ marginBottom: "1rem" }}>
                  <label className="form-label">
                    اسم المنتج بالعربية <span style={{ color: "#d8402f" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input touch-target-44"
                    value={formData.name_ar || ""}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    placeholder="مثال: طماطم بلدي طازجة"
                  />
                </div>

                {/* Section Selector (Move to another section if needed) */}
                <div className="form-group" style={{ marginBottom: "1rem" }}>
                  <label className="form-label">القسم التابع له:</label>
                  <select
                    className="form-select touch-target-44"
                    value={formData.section_id || slug}
                    onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
                  >
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.department_id === "fruits" ? "🍎" : "🥬"} {s.name_ar}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price & Unit Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">السعر (ج.م):</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      className="form-input touch-target-44"
                      value={formData.price !== null && formData.price !== undefined ? formData.price : ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      placeholder="مثال: 35"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">الوحدة:</label>
                    <select
                      className="form-select touch-target-44"
                      value={formData.unit_type || "kg"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          unit_type: e.target.value as UnitType,
                          step: e.target.value === "kg" ? 0.5 : 1,
                        })
                      }
                    >
                      {UNIT_OPTIONS.map((u) => (
                        <option key={u.value} value={u.value}>
                          {u.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pack Label & Sort Order */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">تسمية العبوة (اختياري):</label>
                    <input
                      type="text"
                      className="form-input touch-target-44"
                      value={formData.pack_label || ""}
                      onChange={(e) => setFormData({ ...formData, pack_label: e.target.value })}
                      placeholder="مثال: طبق ٥٠٠ جم"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">الترتيب:</label>
                    <input
                      type="number"
                      className="form-input touch-target-44"
                      value={formData.sort !== undefined ? formData.sort : 0}
                      onChange={(e) => setFormData({ ...formData, sort: Number(e.target.value) })}
                    />
                  </div>
                </div>

                {/* Published Checkbox */}
                <div
                  style={{
                    marginBottom: "1.25rem",
                    padding: "0.85rem",
                    borderRadius: "12px",
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <strong style={{ display: "block", fontSize: "0.88rem", color: "#1e3322" }}>
                      نشر المنتج في المتجر
                    </strong>
                    <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                      إذا كان مفعلاً ومعه سعر سيظهر للزبائن فوراً
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(formData.published)}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    style={{ width: "22px", height: "22px", accentColor: "#2e7d32", cursor: "pointer" }}
                  />
                </div>

                {/* Image Management Section */}
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, marginBottom: "0.5rem", display: "block" }}>
                    صورة المنتج (كاميرا الهاتف أو المعرض):
                  </label>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      padding: "1rem",
                      background: "#fcfbf9",
                      borderRadius: "14px",
                      border: "1.5px solid #e5e7eb",
                      flexWrap: "wrap",
                    }}
                  >
                    {/* Preview */}
                    <div
                      style={{
                        width: 90,
                        height: 90,
                        borderRadius: "12px",
                        overflow: "hidden",
                        border: "1.5px solid #d1d5db",
                        background: "#f3f4f6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {formData.image_url ? (
                        <img
                          src={formData.image_url}
                          alt="معاينة"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div style={{ textAlign: "center", color: "#9ca3af", fontSize: "0.75rem", fontWeight: 700 }}>
                          بدون صورة
                        </div>
                      )}
                    </div>

                    {/* Image Action Buttons */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1, minWidth: "180px" }}>
                      <label
                        className="btn-primary-add touch-target-44"
                        style={{
                          cursor: "pointer",
                          padding: "0.55rem 0.85rem",
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          textAlign: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Upload size={16} />
                        <span>كاميرا / رفع من الهاتف (WebP)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          style={{ display: "none" }}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => setIsGalleryModalOpen(true)}
                        className="btn-secondary-action touch-target-44"
                        style={{
                          padding: "0.55rem 0.85rem",
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          justifyContent: "center",
                        }}
                      >
                        <ImageIcon size={16} />
                        <span>مكتبة صور المزرعة المتاحة</span>
                      </button>

                      {formData.image_url && (
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, image_url: null }))}
                          className="btn-secondary-action touch-target-44"
                          style={{
                            color: "#dc2626",
                            borderColor: "#fca5a5",
                            background: "#fef2f2",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            justifyContent: "center",
                          }}
                        >
                          <Trash2 size={14} />
                          <span>إزالة الصورة الحالية</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sheet Sticky Bottom Bar */}
              <div className="modal-footer admin-sheet-footer">
                <button
                  type="button"
                  onClick={() => setIsEditSheetOpen(false)}
                  className="btn-secondary-action touch-target-44"
                  style={{ flex: 1, padding: "0.75rem", fontSize: "0.9rem" }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-primary-add touch-target-44"
                  style={{
                    flex: 2,
                    padding: "0.75rem",
                    fontSize: "0.95rem",
                    fontWeight: 800,
                    boxShadow: "0 4px 14px rgba(46, 125, 50, 0.3)",
                  }}
                >
                  <Check size={18} />
                  <span>{editingProduct ? "حفظ التعديلات" : "إضافة الصنف"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
         MODAL: FARM STOCK IMAGES PICKER
         ───────────────────────────────────────────────────────────── */}
      {isGalleryModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsGalleryModalOpen(false)}>
          <div
            className="modal-dialog"
            style={{ maxWidth: 680, maxHeight: "90vh", display: "flex", flexDirection: "column" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title" style={{ fontSize: "1.1rem" }}>
                اختر صورة من مكتبة صور نور فارم
              </h2>
              <button
                type="button"
                onClick={() => setIsGalleryModalOpen(false)}
                className="modal-close-btn touch-target-44"
              >
                <X size={20} />
              </button>
            </div>

            <div
              className="modal-body"
              style={{
                flex: 1,
                overflowY: "auto",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                gap: "0.6rem",
                padding: "1rem",
              }}
            >
              {farmImagePaths.map((imgPath, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, image_url: imgPath }))
                    setIsGalleryModalOpen(false)
                    showToast("تم اختيار الصورة بنجاح!")
                  }}
                  style={{
                    cursor: "pointer",
                    borderRadius: "10px",
                    overflow: "hidden",
                    border: formData.image_url === imgPath ? "3px solid #2e7d32" : "1px solid #e5e7eb",
                    aspectRatio: "1/1",
                    position: "relative",
                  }}
                >
                  <img
                    src={imgPath}
                    alt="صورة مزرعة"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              ))}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setIsGalleryModalOpen(false)}
                className="btn-secondary-action touch-target-44"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
         MODAL: BULK DRAFT IMPORT
         ───────────────────────────────────────────────────────────── */}
      {isBulkModalOpen && (
        <div className="modal-backdrop" onClick={() => !bulkUploading && setIsBulkModalOpen(false)}>
          <div className="modal-dialog" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ fontSize: "1.1rem" }}>
                استيراد صور جماعي لقسم {currentSection.name_ar}
              </h2>
              {!bulkUploading && (
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="modal-close-btn touch-target-44"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            <div className="modal-body" style={{ padding: "1.25rem" }}>
              <p style={{ fontSize: "0.85rem", color: "#4b5563", lineHeight: 1.6, marginBottom: "1rem" }}>
                حدد مجموعة من الصور من هاتفك أو جهازك. سيتم إنشاء <strong>مسودة</strong> لكل صورة تلقائياً
                مضغوطة بصيغة WebP باسم الصورة، ثم يمكنك كتابة الأسعار ونشرها بضغطة زر!
              </p>

              {bulkUploading ? (
                <div style={{ textAlign: "center", padding: "1.5rem" }}>
                  <div className="animate-spin" style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>
                    ⏳
                  </div>
                  <strong style={{ color: "#1e3322", display: "block", marginBottom: "0.5rem" }}>
                    {bulkProgress}
                  </strong>
                  <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>يرجى الانتظار حتى اكتمال المعالجة...</span>
                </div>
              ) : (
                <div>
                  <label
                    className="btn-primary-add touch-target-44"
                    style={{
                      width: "100%",
                      padding: "0.85rem",
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <Upload size={18} />
                    <span>اختر عدة صور من جهازك</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleBulkFilesSelect}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                disabled={bulkUploading}
                onClick={() => setIsBulkModalOpen(false)}
                className="btn-secondary-action touch-target-44"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
         MODAL: DELETE CONFIRMATION
         ───────────────────────────────────────────────────────────── */}
      {isDeleteModalOpen && productToDelete && (
        <div className="modal-backdrop" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal-dialog" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ fontSize: "1.1rem" }}>
                تأكيد حذف المنتج
              </h2>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="modal-close-btn touch-target-44"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ textAlign: "center", padding: "1.5rem" }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "#fee2e2",
                  color: "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem",
                }}
              >
                <Trash2 size={24} />
              </div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#991b1b", marginBottom: "0.5rem" }}>
                هل تريد بالتأكيد حذف صنف &quot;{productToDelete.name_ar}&quot;؟
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: 0 }}>
                سيتم حذف الصنف نهائياً ولن يظهر في المتجر أو لوحة الإدارة.
              </p>
            </div>

            <div className="modal-footer" style={{ justifyContent: "space-between" }}>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="btn-secondary-action touch-target-44"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="btn-primary-add touch-target-44"
                style={{ background: "#dc2626", borderColor: "#b91c1c" }}
              >
                <Trash2 size={16} />
                <span>تأكيد الحذف</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
