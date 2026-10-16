"use client"

import React, { useState, useMemo, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  Plus,
  Trash2,
  Edit3,
  Search,
  ExternalLink,
  Lock,
  CheckCircle2,
  AlertTriangle,
  X,
  Image as ImageIcon,
  Check,
  Package,
  Layers,
  ArrowRight,
  Upload,
  Eye,
  EyeOff,
  ShoppingBag,
  Clock,
  Sparkles,
} from "lucide-react"

import type { Product, Section, DepartmentId } from "@/lib/db/types"
import { farmImagePaths } from "./farm-images"
import { resizeImageToWebP } from "@/lib/utils/image-resize"
import "./admin.css"

const DEFAULT_SECTIONS = [
  { id: "fresh-vegetables", dept: "vegetables", name: "خضار طازج" },
  { id: "herbs", dept: "vegetables", name: "الخضرة" },
  { id: "ready-vegetables", dept: "vegetables", name: "خضار متقطع ومجهّز" },
  { id: "salads", dept: "vegetables", name: "السلطات" },
  { id: "fresh-fruits", dept: "fruits", name: "فاكهة طازجة" },
  { id: "cut-fruits", dept: "fruits", name: "فاكهة متقطعة ومجهّزة" },
]

const UNIT_OPTIONS = [
  { value: "kg", label: "كيلو (kg)", defaultStep: 0.5 },
  { value: "piece", label: "بالقطعة / الواحدة", defaultStep: 1 },
  { value: "bunch", label: "حزمة", defaultStep: 1 },
  { value: "pack", label: "طبق مغلف", defaultStep: 1 },
  { value: "box", label: "علبة / كرتونة", defaultStep: 1 },
]

export default function AdminProductsPage() {
  const router = useRouter()

  // State
  const [products, setProducts] = useState<Product[]>([])
  const [sections, setSections] = useState<Array<{ id: string; dept: string; name: string }>>(DEFAULT_SECTIONS)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isDevFallback, setIsDevFallback] = useState<boolean>(false)

  // New Section Modal State
  const [isNewSectionModalOpen, setIsNewSectionModalOpen] = useState<boolean>(false)
  const [newSectionName, setNewSectionName] = useState<string>("")
  const [newSectionDept, setNewSectionDept] = useState<"vegetables" | "fruits">("vegetables")
  const [isCreatingSection, setIsCreatingSection] = useState<boolean>(false)

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [activeDepartment, setActiveDepartment] = useState<"all" | "vegetables" | "fruits">("all")
  const [activeSection, setActiveSection] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft" | "no-image">("all")
  const [sortBy, setSortBy] = useState<"sort" | "price-asc" | "price-desc" | "name">("sort")

  // Modals
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState<boolean>(false)
  const [isDeletingAll, setIsDeletingAll] = useState<boolean>(false)
  const [isResequencing, setIsResequencing] = useState<boolean>(false)
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false)
  const [isBulkModalOpen, setIsBulkModalOpen] = useState<boolean>(false)

  // Bulk Import State
  const [bulkSectionId, setBulkSectionId] = useState<string>("fresh-vegetables")
  const [bulkUploading, setBulkUploading] = useState<boolean>(false)
  const [bulkProgress, setBulkProgress] = useState<string>("")

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name_ar: "",
    section_id: "fresh-vegetables",
    image_url: null,
    price: null,
    unit_type: "kg",
    pack_label: null,
    step: 0.5,
    published: false,
    sort: 0,
  })

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Check Session & Load Products and Sections
  const loadData = async () => {
    setIsLoading(true)
    try {
      // Check auth session
      const sessRes = await fetch("/api/admin/session")
      const sessData = await sessRes.json()

      if (!sessData.authenticated) {
        router.push("/admin/login")
        return
      }

      setIsDevFallback(sessData.isDevFallback)

      // Fetch products
      const prodRes = await fetch("/api/admin/products")
      if (prodRes.ok) {
        const prodData = await prodRes.json()
        setProducts(prodData.products || [])
      }

      // Fetch sections dynamically from DB
      try {
        const secRes = await fetch("/api/admin/sections")
        if (secRes.ok) {
          const secData = await secRes.json()
          if (Array.isArray(secData.sections) && secData.sections.length > 0) {
            const mapped = secData.sections.map((s: any) => ({
              id: s.id,
              dept: s.department_id,
              name: s.name_ar,
            }))
            const mapIds = new Set(mapped.map((m: any) => m.id))
            const merged = [...mapped]
            for (const d of DEFAULT_SECTIONS) {
              if (!mapIds.has(d.id)) merged.push(d)
            }
            setSections(merged)
          }
        }
      } catch (err) {
        console.error("Failed to load dynamic sections:", err)
      }
    } catch (err) {
      console.error("Failed to load admin data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Handler to create a new section
  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newSectionName.trim()
    if (!trimmed) {
      alert("يرجى كتابة اسم القسم الجديد")
      return
    }

    setIsCreatingSection(true)
    try {
      const res = await fetch("/api/admin/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name_ar: trimmed,
          department_id: newSectionDept,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        alert(data.error || "فشل إنشاء القسم")
        return
      }

      const created = data.section
      const newOpt = {
        id: created.id,
        dept: created.department_id,
        name: created.name_ar,
      }

      setSections((prev) => {
        const exists = prev.some((s) => s.id === newOpt.id)
        return exists ? prev : [...prev, newOpt]
      })

      // If user was adding/editing product, automatically select the new section!
      setFormData((prev) => ({ ...prev, section_id: newOpt.id }))
      setBulkSectionId(newOpt.id)
      showToast(`تم إنشاء قسم "${created.name_ar}" بنجاح وتحديده!`)
      setIsNewSectionModalOpen(false)
      setNewSectionName("")
    } catch {
      alert("حدث خطأ أثناء إنشاء القسم")
    } finally {
      setIsCreatingSection(false)
    }
  }

  // Logout
  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
  }

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    let result = [...products]

    if (activeDepartment !== "all") {
      const deptSectionIds = sections.filter((s) => s.dept === activeDepartment).map((s) => s.id)
      result = result.filter((p) => deptSectionIds.includes(p.section_id))
    }

    if (activeSection !== "all") {
      result = result.filter((p) => p.section_id === activeSection)
    }

    if (statusFilter === "published") {
      result = result.filter((p) => p.published)
    } else if (statusFilter === "draft") {
      result = result.filter((p) => !p.published)
    } else if (statusFilter === "no-image") {
      result = result.filter((p) => !p.image_url)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (p) =>
          p.name_ar.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.pack_label?.toLowerCase().includes(q)
      )
    }

    if (sortBy === "price-asc") {
      result.sort((a, b) => (a.price || 0) - (b.price || 0))
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => (b.price || 0) - (a.price || 0))
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name_ar.localeCompare(b.name_ar, "ar"))
    } else {
      result.sort((a, b) => a.sort - b.sort)
    }

    return result
  }, [products, activeDepartment, activeSection, statusFilter, searchQuery, sortBy])

  // Open Modal for Add
  const handleOpenAdd = () => {
    setEditingProduct(null)
    const maxSort =
      products.length > 0
        ? Math.max(...products.map((p) => Number(p.sort) || 0), 0)
        : 0

    setFormData({
      name_ar: "",
      section_id: activeSection !== "all" ? activeSection : "fresh-vegetables",
      image_url: null,
      price: null,
      unit_type: "kg",
      pack_label: null,
      step: 0.5,
      published: false,
      sort: maxSort + 1,
    })
    setIsModalOpen(true)
  }

  // Open Modal for Edit
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p)
    setFormData({ ...p })
    setIsModalOpen(true)
  }

  // Image upload handler with browser WebP resize
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      showToast("جاري ضغط وتحويل الصورة إلى WebP...")
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
      showToast("تم رفع الصورة بنجاح!")
    } catch (err: any) {
      alert("خطأ أثناء معالجة الصورة: " + err.message)
    }
  }

  // Save Add/Edit
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name_ar?.trim()) {
      alert("يرجى كتابة اسم المنتج بالعربية")
      return
    }

    if (formData.published) {
      if (formData.price === null || formData.price === undefined || formData.price <= 0) {
        alert("لا يمكن نشر المنتج (Published) بدون تحديد سعر صالح")
        return
      }
    }

    const payload = {
      ...formData,
      price: formData.price !== null && formData.price !== undefined ? Number(formData.price) : null,
      step: formData.unit_type === "kg" ? 0.5 : 1,
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

      setIsModalOpen(false)
      loadData()
    } catch {
      alert("حدث خطأ أثناء حفظ الصنف")
    }
  }

  // Delete
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

  // Delete All Products
  const handleDeleteAllProducts = async () => {
    setIsDeletingAll(true)
    try {
      const res = await fetch("/api/admin/products", {
        method: "DELETE",
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "فشل حذف المنتجات")
      }

      setProducts([])
      showToast("تم حذف جميع المنتجات وتفريغ قاعدة البيانات بنجاح")
      setIsDeleteAllModalOpen(false)
      loadData()
    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء حذف المنتجات")
    } finally {
      setIsDeletingAll(false)
    }
  }

  // Resequence all products 1, 2, 3...
  const handleResequence = async () => {
    if (!confirm("هل تريد إعادة ترقيم جميع المنتجات تسلسلياً (1، 2، 3...) وفق الأقسام وترتيبها الحالي لتفادي أي تكرار؟")) return
    setIsResequencing(true)
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resequence: true }),
      })
      if (!res.ok) throw new Error("فشل إعادة الترقيم")
      const data = await res.json()
      if (data.products) {
        setProducts(data.products)
      }
      showToast("تمت إعادة الترقيم التسلسلي لجميع المنتجات بنجاح")
      loadData()
    } catch {
      alert("حدث خطأ أثناء إعادة الترقيم")
    } finally {
      setIsResequencing(false)
    }
  }

  // Quick Toggle Published
  const handleTogglePublished = async (p: Product) => {
    if (!p.published && (!p.price || p.price <= 0)) {
      alert("لا يمكن نشر المنتج بدون تحديد سعر أولاً. قم بتعديل السعر أولاً.")
      return
    }

    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !p.published }),
      })
      if (res.ok) {
        showToast(p.published ? `تم إلغاء نشر "${p.name_ar}" (أصبح مسودة)` : `تم نشر "${p.name_ar}" على المتجر!`)
        loadData()
      }
    } catch {
      alert("فشل تغيير حالة النشر")
    }
  }

  // Quick Inline Price Change
  const handleQuickPriceBlur = async (p: Product, newPriceStr: string) => {
    const newPrice = Number(newPriceStr)
    if (isNaN(newPrice) || newPrice < 0 || newPrice === p.price) return

    try {
      await fetch(`/api/admin/products/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: newPrice }),
      })
      showToast(`تم تحديث سعر "${p.name_ar}" إلى ${newPrice} ج.م`)
      loadData()
    } catch {
      alert("فشل تحديث السعر")
    }
  }

  // Bulk Import Images as Drafts
  const handleBulkFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setBulkUploading(true)
    setBulkProgress(`جاري تجهيز ${files.length} ملف...`)

    const draftItems: { name_ar: string; image_url: string; section_id: string }[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setBulkProgress(`جاري رفع ومعالجة (${i + 1}/${files.length}): ${file.name}...`)

      // Clean name: trim, remove ext, replace _ and - with spaces
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
            section_id: bulkSectionId,
          })
        }
      } catch (err) {
        console.error("Bulk item upload error:", err)
      }
    }

    if (draftItems.length > 0) {
      setBulkProgress(`جاري حفظ ${draftItems.length} صنف كمسودات...`)
      const res = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: draftItems }),
      })

      if (res.ok) {
        showToast(`تم إنشاء ${draftItems.length} مسودة بنجاح! يمكنك الآن تسعيرها ونشرها.`)
        setIsBulkModalOpen(false)
        loadData()
      } else {
        alert("فشل حفظ المسودات على الخادم")
      }
    } else {
      alert("لم تنجح معالجة أي من الصور المرفقة")
    }

    setBulkUploading(false)
    setBulkProgress("")
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f4efe4" }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid #c7bca7",
              borderTopColor: "#2e7d32",
              borderRadius: "50%",
              margin: "0 auto 1rem",
              animation: "spin 1s linear infinite",
            }}
          />
          <p style={{ fontWeight: 700, color: "#1e3322" }}>جاري تحميل بيانات لوحة الإدارة...</p>
        </div>
      </div>
    )
  }

  const publishedCount = products.filter((p) => p.published).length
  const draftCount = products.filter((p) => !p.published).length

  return (
    <div className="admin-root">
      {/* HEADER */}
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
                <h1 className="admin-brand-title">لوحة إدارة نور فارم</h1>
                <span className="admin-brand-tagline">
                  <span className="status-dot" />
                  جلسة مشرف مصرحة • التحديثات تظهر فوراً للعملاء
                </span>
              </div>
            </Link>
          </div>

          <div className="admin-header-actions">
            <Link
              href="/admin/orders"
              className="admin-action-btn-ghost"
              style={{ background: "#e8f5e9", borderColor: "#a5d6a7", color: "#1b5e20", fontWeight: 700 }}
            >
              <ShoppingBag size={16} />
              <span>إدارة الطلبات</span>
            </Link>

            <Link href="/" target="_blank" className="admin-action-btn-ghost">
              <span>المتجر المباشر</span>
              <ExternalLink size={15} />
            </Link>

            <button type="button" onClick={handleLogout} className="admin-action-btn-danger">
              <Lock size={15} />
              <span>تسجيل خروج</span>
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
              <span className="kpi-card-title">إجمالي الأصناف</span>
              <div className="kpi-card-icon">
                <Package size={22} />
              </div>
            </div>
            <div className="kpi-card-value">{products.length}</div>
            <div className="kpi-card-subline">
              <CheckCircle2 size={14} color="#2e7d32" />
              <span>منها {publishedCount} منشور و {draftCount} مسودة</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-card-title">الأقسام الرئيسية</span>
              <div className="kpi-card-icon" style={{ background: "#e0f2f1", color: "#00695c" }}>
                <Layers size={22} />
              </div>
            </div>
            <div className="kpi-card-value">٧</div>
            <div className="kpi-card-subline">٤ للخضار و ٣ للفاكهة</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-card-title">المنتجات المنشورة</span>
              <div className="kpi-card-icon" style={{ background: "#e8f5e9", color: "#2e7d32" }}>
                <Eye size={22} />
              </div>
            </div>
            <div className="kpi-card-value">{publishedCount}</div>
            <div className="kpi-card-subline">معروضة للطلب المباشر في المتجر</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-card-title">المسودات (غير منشورة)</span>
              <div className="kpi-card-icon" style={{ background: "#fff8e1", color: "#f57f17" }}>
                <EyeOff size={22} />
              </div>
            </div>
            <div className="kpi-card-value">{draftCount}</div>
            <div className="kpi-card-subline">تنتظر وضع السعر وتفعيل النشر</div>
          </div>
        </section>

        {/* TOOLBAR */}
        <div className="admin-toolbar-card">
          <div className="toolbar-top-row">
            <div className="toolbar-search-wrapper">
              <Search className="toolbar-search-icon" size={18} />
              <input
                type="text"
                className="toolbar-search-input"
                placeholder="ابحث بالاسم العربي، المعرّف، أو الوحدة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="toolbar-buttons-group">
              <button type="button" onClick={handleOpenAdd} className="btn-primary-add">
                <Plus size={18} />
                <span>إضافة منتج جديد</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setNewSectionName("")
                  setIsNewSectionModalOpen(true)
                }}
                className="btn-secondary-action"
                style={{ background: "#f0fdf4", borderColor: "#86efac", color: "#166534", fontWeight: 700 }}
              >
                <Plus size={16} />
                <span>قسم جديد</span>
              </button>

              <button
                type="button"
                onClick={() => setIsBulkModalOpen(true)}
                className="btn-secondary-action"
                style={{ background: "#e8f5e9", borderColor: "#81c784", color: "#1b5e20", fontWeight: 700 }}
              >
                <Upload size={16} />
                <span>استيراد جماعي بالصور (Bulk)</span>
              </button>

              <button
                type="button"
                disabled={isResequencing}
                onClick={handleResequence}
                className="btn-secondary-action"
                style={{ background: "#f8fafc", borderColor: "#cbd5e1", color: "#334155", fontWeight: 600 }}
                title="إعادة ترقيم جميع المنتجات تصاعدياً 1، 2، 3... بدون أي تكرار"
              >
                <Layers size={16} />
                <span>{isResequencing ? "جاري الترقيم..." : "إعادة ترقيم تسلسلي"}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDeleteAllModalOpen(true)}
                className="btn-secondary-action"
                style={{ background: "#fef2f2", borderColor: "#fca5a5", color: "#b91c1c", fontWeight: 700 }}
                title="حذف وتفريغ جميع المنتجات من المتجر وقاعدة البيانات"
              >
                <Trash2 size={16} />
                <span>حذف كل الداتا</span>
              </button>
            </div>
          </div>

          {/* FILTERS */}
          <div className="toolbar-filters-row">
            {/* DEPARTMENT & SECTION SELECTORS */}
            <div className="category-tabs">
              <button
                type="button"
                onClick={() => {
                  setActiveDepartment("all")
                  setActiveSection("all")
                }}
                className={`category-tab-btn ${activeDepartment === "all" ? "active" : ""}`}
              >
                <span>جميع الأقسام</span>
                <span className="tab-badge">{products.length}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveDepartment("vegetables")
                  setActiveSection("all")
                }}
                className={`category-tab-btn ${activeDepartment === "vegetables" && activeSection === "all" ? "active" : ""}`}
              >
                <span>الخضار (٤ أقسام)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveDepartment("fruits")
                  setActiveSection("all")
                }}
                className={`category-tab-btn ${activeDepartment === "fruits" && activeSection === "all" ? "active" : ""}`}
              >
                <span>الفاكهة (٣ أقسام)</span>
              </button>
            </div>

            <div className="view-controls">
              {/* SUB-SECTION FILTER */}
              <select
                className="form-select"
                style={{ padding: "0.45rem 0.85rem", fontSize: "0.85rem", width: "auto" }}
                value={activeSection}
                onChange={(e) => setActiveSection(e.target.value)}
              >
                <option value="all">كل الأقسام الفرعية</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              {/* STATUS FILTER */}
              <select
                className="form-select"
                style={{ padding: "0.45rem 0.85rem", fontSize: "0.85rem", width: "auto" }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">كل الحالات</option>
                <option value="published">منشور فقط (في المتجر)</option>
                <option value="draft">مسودة فقط (غير منشور)</option>
                <option value="no-image">بدون صورة</option>
              </select>

              {/* SORT */}
              <select
                className="form-select"
                style={{ padding: "0.45rem 0.85rem", fontSize: "0.85rem", width: "auto" }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="sort">الترتيب الافتراضي</option>
                <option value="price-asc">السعر: من الأقل</option>
                <option value="price-desc">السعر: من الأعلى</option>
                <option value="name">الاسم: أ - ي</option>
              </select>
            </div>
          </div>
        </div>

        {/* SUMMARY BAR */}
        <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: "0.9rem", color: "#55704a", fontWeight: 600 }}>
            عرض <strong style={{ color: "#1e3322" }}>{filteredProducts.length}</strong> من أصل{" "}
            <strong>{products.length}</strong> منتج
          </p>
        </div>

        {/* PRODUCTS TABLE */}
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>الصورة</th>
                <th>اسم المنتج</th>
                <th>القسم الفرعي</th>
                <th>السعر (ج.م)</th>
                <th>الوحدة والخطوة</th>
                <th style={{ textAlign: "center" }}>الحالة</th>
                <th style={{ textAlign: "center" }}>الترتيب</th>
                <th style={{ textAlign: "center" }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const sectionName = sections.find((s) => s.id === p.section_id)?.name || p.section_id

                return (
                  <tr key={p.id}>
                    <td>
                      <div className="product-thumb-cell">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name_ar} className="product-thumb-img" />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              background: "#e8ede4",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.7rem",
                              color: "#6b7c62",
                              fontWeight: 700,
                              textAlign: "center",
                              padding: "2px",
                            }}
                          >
                            بدون صورة
                          </div>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="product-name-title">{p.name_ar}</div>
                      <div className="product-name-slug">{p.id}</div>
                    </td>

                    <td>
                      <span className="section-badge-pill" style={{ background: "#e8f5e9", color: "#1b5e20" }}>
                        {sectionName}
                      </span>
                    </td>

                    <td>
                      <div className="price-inline-editor">
                        <input
                          type="number"
                          className="price-number-input"
                          defaultValue={p.price !== null && p.price !== undefined ? p.price : ""}
                          placeholder="غير محدد"
                          onBlur={(e) => handleQuickPriceBlur(p, e.target.value)}
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
                      <span style={{ fontWeight: 600 }}>
                        {UNIT_OPTIONS.find((u) => u.value === p.unit_type)?.label || p.unit_type}
                      </span>
                      {p.pack_label && (
                        <span style={{ fontSize: "0.78rem", color: "#718766", display: "block" }}>
                          ({p.pack_label})
                        </span>
                      )}
                    </td>

                    <td style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={() => handleTogglePublished(p)}
                        className={`category-tab-btn ${p.published ? "active" : ""}`}
                        style={{
                          margin: "0 auto",
                          padding: "0.3rem 0.75rem",
                          fontSize: "0.78rem",
                          background: p.published ? "#2e7d32" : "#f3f4f6",
                          color: p.published ? "#ffffff" : "#6b7280",
                          border: "none",
                        }}
                      >
                        {p.published ? "منشور ✓" : "مسودة ✕"}
                      </button>
                    </td>

                    <td style={{ textAlign: "center", fontFamily: "monospace", fontSize: "0.85rem" }}>
                      {p.sort}
                    </td>

                    <td style={{ textAlign: "center" }}>
                      <div style={{ display: "inline-flex", gap: "0.45rem" }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(p)}
                          className="row-action-btn"
                          title="تعديل الصنف"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setProductToDelete(p)
                            setIsDeleteModalOpen(true)
                          }}
                          className="row-action-btn delete"
                          title="حذف الصنف"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </main>

      {/* ─────────────────────────────────────────────────────────────
         MODAL: ADD / EDIT PRODUCT
         ───────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingProduct ? `تعديل الصنف: ${editingProduct.name_ar}` : "إضافة منتج جديد"}
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
              <div className="modal-body">
                <div className="form-grid-layout">
                  {/* RIGHT COLUMN: FIELDS */}
                  <div>
                    <div className="form-group">
                      <label className="form-label">اسم المنتج بالعربية *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="مثال: طماطم بلدي سكرية"
                        value={formData.name_ar || ""}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name_ar: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                          <label className="form-label" style={{ margin: 0 }}>القسم *</label>
                          <button
                            type="button"
                            onClick={() => {
                              setNewSectionName("")
                              setIsNewSectionModalOpen(true)
                            }}
                            style={{
                              fontSize: "0.78rem",
                              color: "#166534",
                              fontWeight: 700,
                              background: "#f0fdf4",
                              border: "1px solid #bbf7d0",
                              borderRadius: "6px",
                              padding: "2px 8px",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            <Plus size={13} />
                            <span>إضافة قسم جديد</span>
                          </button>
                        </div>
                        <select
                          className="form-select"
                          value={formData.section_id}
                          onChange={(e) => setFormData((prev) => ({ ...prev, section_id: e.target.value }))}
                        >
                          {sections.map((sec) => (
                            <option key={sec.id} value={sec.id}>
                              {sec.name}
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
                          placeholder="مثال: 25"
                          value={formData.price !== null && formData.price !== undefined ? formData.price : ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              price: e.target.value === "" ? null : Number(e.target.value),
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label className="form-label">نوع الوحدة *</label>
                        <select
                          className="form-select"
                          value={formData.unit_type}
                          onChange={(e) => {
                            const u = e.target.value as any
                            const opt = UNIT_OPTIONS.find((o) => o.value === u)
                            setFormData((prev) => ({
                              ...prev,
                              unit_type: u,
                              step: opt?.defaultStep || 1,
                            }))
                          }}
                        >
                          {UNIT_OPTIONS.map((u) => (
                            <option key={u.value} value={u.value}>
                              {u.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">بيان التعبئة (اختياري)</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="مثال: طبق ٥٠٠ جرام / شبكة ٢ كيلو"
                          value={formData.pack_label || ""}
                          onChange={(e) => setFormData((prev) => ({ ...prev, pack_label: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label className="form-label">الترتيب</label>
                        <input
                          type="number"
                          className="form-input"
                          value={formData.sort ?? 0}
                          onChange={(e) => setFormData((prev) => ({ ...prev, sort: Number(e.target.value) }))}
                        />
                        <span style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem", display: "block" }}>
                          * يبدأ تلقائياً من بعد آخر رقم مسجل
                        </span>
                      </div>

                      <div className="form-group" style={{ display: "flex", alignItems: "flex-end", paddingBottom: "0.6rem" }}>
                        <label style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", fontWeight: 700 }}>
                          <input
                            type="checkbox"
                            checked={formData.published || false}
                            onChange={(e) => setFormData((prev) => ({ ...prev, published: e.target.checked }))}
                            style={{ width: 18, height: 18, accentColor: "#2e7d32" }}
                          />
                          <span>نشر المنتج في المتجر (Published)</span>
                        </label>
                      </div>
                    </div>

                    <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "0.5rem" }}>
                      * قاعدة هامة: لا يمكن نشر منتج على المتجر دون أن يحتوي على اسم وسعر محددين.
                    </p>
                  </div>

                  {/* LEFT COLUMN: IMAGE UPLOAD & PREVIEW */}
                  <div>
                    <label className="form-label">صورة الصنف</label>
                    <div className="image-picker-box">
                      <div
                        style={{
                          width: 140,
                          height: 140,
                          margin: "0 auto 1rem",
                          borderRadius: 14,
                          overflow: "hidden",
                          border: "1px solid rgba(47,59,39,0.15)",
                          background: "#e8ede4",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {formData.image_url ? (
                          <img
                            src={formData.image_url}
                            alt="معاينة"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <div style={{ textAlign: "center", color: "#6b7c62", fontSize: "0.8rem", fontWeight: 700 }}>
                            بدون صورة
                            <span style={{ display: "block", fontSize: "0.7rem", opacity: 0.8 }}>(خلفية حيادية)</span>
                          </div>
                        )}
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label
                          className="btn-primary-add"
                          style={{ width: "100%", justifyContent: "center", padding: "0.65rem", fontSize: "0.85rem", cursor: "pointer" }}
                        >
                          <Upload size={16} />
                          <span>رفع صورة جديدة (تحويل تلقائي لـ WebP)</span>
                          <input type="file" accept="image/*" onChange={handleImageFileChange} style={{ display: "none" }} />
                        </label>

                        <button
                          type="button"
                          onClick={() => setIsGalleryOpen(true)}
                          className="btn-secondary-action"
                          style={{ width: "100%", justifyContent: "center", padding: "0.65rem", fontSize: "0.85rem" }}
                        >
                          <ImageIcon size={16} />
                          <span>اختيار من مكتبة صور المزرعة</span>
                        </button>

                        {formData.image_url && (
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, image_url: null }))}
                            className="btn-secondary-action"
                            style={{ color: "#d8402f", justifyContent: "center", padding: "0.4rem" }}
                          >
                            إزالة الصورة الحالية
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary-action">
                  إلغاء
                </button>
                <button type="submit" className="btn-primary-add">
                  <Check size={18} />
                  <span>{editingProduct ? "حفظ التعديلات" : "إضافة الصنف"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
         MODAL: BULK DRAFT IMPORT
         ───────────────────────────────────────────────────────────── */}
      {isBulkModalOpen && (
        <div className="modal-backdrop" onClick={() => !bulkUploading && setIsBulkModalOpen(false)}>
          <div className="modal-dialog" style={{ maxWidth: 580 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">استيراد أصناف جماعي بالصور</h2>
              {!bulkUploading && (
                <button type="button" onClick={() => setIsBulkModalOpen(false)} className="modal-close-btn">
                  <X size={20} />
                </button>
              )}
            </div>

            <div className="modal-body">
              <p style={{ fontSize: "0.9rem", color: "#4b5563", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                اختر عدة صور دفعة واحدة من جهازك. سيتم إنشاء <strong>مسودة غير منشورة</strong> لكل صورة باسم الملف
                تلقائياً، مع ضغطها وتحويلها إلى WebP. ثم يمكنك إدخال الأسعار ونشرها بنقرة واحدة!
              </p>

              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label className="form-label">القسم المراد إضافة المسودات إليه:</label>
                <select
                  className="form-select"
                  value={bulkSectionId}
                  onChange={(e) => setBulkSectionId(e.target.value)}
                  disabled={bulkUploading}
                >
                  {sections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.name}
                    </option>
                  ))}
                </select>
              </div>

              {bulkUploading ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      border: "3px solid #c7bca7",
                      borderTopColor: "#2e7d32",
                      borderRadius: "50%",
                      margin: "0 auto 1rem",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  <p style={{ fontWeight: 700, color: "#1e3322" }}>{bulkProgress}</p>
                </div>
              ) : (
                <label
                  className="btn-primary-add"
                  style={{ width: "100%", justifyContent: "center", padding: "1rem", fontSize: "1rem", cursor: "pointer" }}
                >
                  <Upload size={20} />
                  <span>تحديد الصور وبدء الاستيراد الجماعي</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleBulkFilesSelect}
                    style={{ display: "none" }}
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
         MODAL: GALLERY PICKER
         ───────────────────────────────────────────────────────────── */}
      {isGalleryOpen && (
        <div className="modal-backdrop" onClick={() => setIsGalleryOpen(false)}>
          <div className="modal-dialog" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">مكتبة صور نور فارم</h2>
              <button type="button" onClick={() => setIsGalleryOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div
                style={{
                  background: "#fffbeb",
                  border: "1px solid #fef3c7",
                  padding: "0.6rem 1rem",
                  borderRadius: "10px",
                  fontSize: "0.85rem",
                  color: "#92400e",
                  marginBottom: "1rem",
                }}
              >
                تنبيه: لا تقم باستخدام نفس الصورة لمنتجين مختلفين. يجب أن تطابق الصورة المنتج تماماً.
              </div>
              <div className="gallery-grid">
                {farmImagePaths.map((imgPath) => (
                  <div
                    key={imgPath}
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, image_url: imgPath }))
                      setIsGalleryOpen(false)
                      showToast("تم اختيار الصورة بنجاح!")
                    }}
                    className={`gallery-item ${formData.image_url === imgPath ? "selected" : ""}`}
                  >
                    <img src={imgPath} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
         MODAL: DELETE CONFIRMATION
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

            <div className="modal-body" style={{ textAlign: "center", padding: "1.75rem" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#1a2a1d", marginBottom: "0.5rem" }}>
                {productToDelete.name_ar}
              </h3>
              <p style={{ fontSize: "0.9rem", color: "#6b7280", lineHeight: 1.6 }}>
                هل أنت متأكد من رغبتك في حذف هذا المنتج نهائياً من قاعدة البيانات والمتجر؟
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
                <span>نعم، احذف الصنف</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
         MODAL: DELETE ALL PRODUCTS CONFIRMATION
         ───────────────────────────────────────────────────────────── */}
      {isDeleteAllModalOpen && (
        <div className="modal-backdrop" onClick={() => !isDeletingAll && setIsDeleteAllModalOpen(false)}>
          <div className="modal-dialog" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ background: "#fef2f2" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "#dc2626" }}>
                <AlertTriangle size={24} />
                <h2 className="modal-title" style={{ color: "#dc2626", fontSize: "1.2rem" }}>
                  تحذير: حذف جميع المنتجات!
                </h2>
              </div>
              <button
                type="button"
                disabled={isDeletingAll}
                onClick={() => setIsDeleteAllModalOpen(false)}
                className="modal-close-btn"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ textAlign: "center", padding: "1.75rem" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "#fee2e2",
                  color: "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem",
                }}
              >
                <Trash2 size={28} />
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#991b1b", marginBottom: "0.5rem" }}>
                هل أنت متأكد من حذف كافة المنتجات ({products.length} منتج)؟
              </h3>
              <p style={{ fontSize: "0.92rem", color: "#6b7280", lineHeight: 1.6 }}>
                سيتم تفريغ كافة الأصناف نهائياً من قاعدة البيانات (Supabase والتخزين المحلي). هذا الإجراء سيحذف كافة المنتجات ولا يمكن التراجع عنه.
              </p>
            </div>

            <div className="modal-footer" style={{ justifyContent: "space-between" }}>
              <button
                type="button"
                disabled={isDeletingAll}
                onClick={() => setIsDeleteAllModalOpen(false)}
                className="btn-secondary-action"
              >
                إلغاء وتراجع
              </button>
              <button
                type="button"
                disabled={isDeletingAll}
                onClick={handleDeleteAllProducts}
                className="btn-primary-add"
                style={{ background: "#dc2626", borderColor: "#b91c1c" }}
              >
                <Trash2 size={16} />
                <span>{isDeletingAll ? "جاري الحذف..." : "تأكيد: احذف كل المنتجات الآن"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
         MODAL: NEW SECTION CREATION
         ───────────────────────────────────────────────────────────── */}
      {isNewSectionModalOpen && (
        <div className="modal-backdrop" onClick={() => !isCreatingSection && setIsNewSectionModalOpen(false)}>
          <div className="modal-dialog" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">إنشاء قسم جديد</h2>
              <button
                type="button"
                onClick={() => setIsNewSectionModalOpen(false)}
                className="modal-close-btn"
                disabled={isCreatingSection}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSection}>
              <div className="modal-body" style={{ padding: "1.25rem" }}>
                <div className="form-group" style={{ marginBottom: "1.2rem" }}>
                  <label className="form-label">اسم القسم الجديد بالعربية *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="مثال: تمور وعسل، عصائر طبيعية، مجمدات..."
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    autoFocus
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: "1.2rem" }}>
                  <label className="form-label">يندرج تحت أي قسم رئيسي؟ *</label>
                  <select
                    className="form-select"
                    value={newSectionDept}
                    onChange={(e) => setNewSectionDept(e.target.value as "vegetables" | "fruits")}
                  >
                    <option value="vegetables">قسم الخضار (Vegetables)</option>
                    <option value="fruits">قسم الفاكهة (Fruits)</option>
                  </select>
                </div>

                <div
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "10px",
                    padding: "0.75rem",
                    fontSize: "0.82rem",
                    color: "#166534",
                    lineHeight: 1.5,
                  }}
                >
                  ✓ سيتم حفظ القسم فوراً في قاعدة البيانات ويظهر في القوائم وفي المتجر تلقائياً.
                </div>
              </div>

              <div
                className="modal-footer"
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.75rem",
                  padding: "1rem 1.25rem",
                  borderTop: "1px solid #e5e7eb",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsNewSectionModalOpen(false)}
                  className="btn-secondary-action"
                  disabled={isCreatingSection}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-primary-add"
                  disabled={isCreatingSection || !newSectionName.trim()}
                >
                  <Plus size={16} />
                  <span>{isCreatingSection ? "جاري الحفظ..." : "حفظ واختيار القسم"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST */}
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
