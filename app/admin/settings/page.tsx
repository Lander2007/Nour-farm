"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Settings,
  MapPin,
  Truck,
  Phone,
  CheckCircle2,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Save,
  ShoppingBag,
  Layers,
  ExternalLink,
  Lock,
} from "lucide-react"
import type { StoreSettings, ServiceArea } from "@/lib/db/types"
import "../admin.css"

export default function AdminSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [storeAddress, setStoreAddress] = useState(
    "أكتوبر – الحي المتميز – السياحية الأولى"
  )
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([
    { id: "area-1", name: "أكتوبر – الحي المتميز", enabled: true },
    { id: "area-2", name: "أكتوبر – غرب سوميد", enabled: true },
  ])
  const [newAreaName, setNewAreaName] = useState("")
  const [whatsappNumber, setWhatsappNumber] = useState("01224272991")
  const [freeDeliveryActive, setFreeDeliveryActive] = useState(false)
  const [freeDeliveryText, setFreeDeliveryText] = useState(
    "التوصيل مجاني في عروض الافتتاح"
  )

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/settings")
      if (res.status === 401) {
        router.push("/admin/login")
        return
      }
      if (res.ok) {
        const data = await res.json()
        if (data.settings) {
          const s = data.settings as StoreSettings
          setStoreAddress(s.storeAddress || "أكتوبر – الحي المتميز – السياحية الأولى")
          if (Array.isArray(s.serviceAreas) && s.serviceAreas.length > 0) {
            setServiceAreas(s.serviceAreas)
          }
          setWhatsappNumber(s.whatsappNumber || "01224272991")
          setFreeDeliveryActive(Boolean(s.freeDeliveryActive))
          setFreeDeliveryText(s.freeDeliveryText || "التوصيل مجاني في عروض الافتتاح")
        }
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSaving(true)
    setSuccessMsg(null)
    setErrorMsg(null)

    try {
      const payload: Partial<StoreSettings> = {
        storeAddress: storeAddress.trim(),
        serviceAreas,
        whatsappNumber: whatsappNumber.trim(),
        freeDeliveryActive,
        freeDeliveryText: freeDeliveryText.trim(),
      }

      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "فشل حفظ الإعدادات")
      }

      setSuccessMsg("تم حفظ وتحديث إعدادات المتجر بنجاح.")
      setTimeout(() => setSuccessMsg(null), 4000)
    } catch (err: any) {
      console.error("Save settings failed:", err)
      setErrorMsg(err.message || "حدث خطأ أثناء حفظ الإعدادات")
    } finally {
      setSaving(false)
    }
  }

  // Area Management
  const handleAddArea = () => {
    const trimmed = newAreaName.trim()
    if (!trimmed) return
    const newArea: ServiceArea = {
      id: `area-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: trimmed,
      enabled: true,
    }
    setServiceAreas([...serviceAreas, newArea])
    setNewAreaName("")
  }

  const handleToggleArea = (id: string) => {
    setServiceAreas(
      serviceAreas.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    )
  }

  const handleRenameArea = (id: string, name: string) => {
    setServiceAreas(
      serviceAreas.map((a) => (a.id === id ? { ...a, name } : a))
    )
  }

  const handleMoveArea = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= serviceAreas.length) return
    const updated = [...serviceAreas]
    const temp = updated[index]
    updated[index] = updated[targetIdx]
    updated[targetIdx] = temp
    setServiceAreas(updated)
  }

  const handleDeleteArea = (id: string) => {
    setServiceAreas(serviceAreas.filter((a) => a.id !== id))
  }

  return (
    <div className="admin-page" dir="rtl">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-brand-col">
            <Link href="/admin" className="admin-brand-link">
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid rgba(46,125,50,0.3)",
                }}
              >
                <Image
                  src="/logo-icon.png"
                  alt="Noor Farm Logo"
                  width={44}
                  height={44}
                />
              </div>
              <div>
                <h1 className="admin-brand-title">إعدادات متجر نور فارم</h1>
                <span className="admin-brand-tagline">
                  العنوان • مناطق التوصيل • رسوم وعروض التوصيل
                </span>
              </div>
            </Link>
          </div>

          <div className="admin-header-actions">
            <Link href="/admin" className="admin-action-btn-ghost">
              <Layers size={16} />
              <span>إدارة المنتجات</span>
            </Link>
            <Link href="/admin/orders" className="admin-action-btn-ghost">
              <ShoppingBag size={16} />
              <span>إدارة الطلبات</span>
            </Link>
            <Link href="/" target="_blank" className="admin-action-btn-ghost">
              <ExternalLink size={16} />
              <span>المتجر المباشر</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="admin-container" style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1rem" }}>
        {loading ? (
          <div className="py-20 text-center text-stone-500">
            <div className="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="font-bold">جاري تحميل إعدادات المتجر...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {successMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 size={18} />
                <span>{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 font-bold text-sm">
                <AlertTriangle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. Store Address */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                <MapPin className="text-emerald-700" size={20} />
                <h2 className="text-base font-extrabold text-stone-900">
                  عنوان المتجر (Store Address)
                </h2>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                يظهر هذا العنوان في التذييل السفلي على جميع صفحات المتجر.
              </p>
              <div>
                <input
                  type="text"
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  placeholder="أكتوبر – الحي المتميز – السياحية الأولى"
                  className="w-full p-3 rounded-xl border border-stone-300 font-bold text-sm focus:border-emerald-700 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* 2. Service Areas */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <Truck className="text-emerald-700" size={20} />
                  <h2 className="text-base font-extrabold text-stone-900">
                    مناطق التوصيل المعتمدة (Service Areas)
                  </h2>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {serviceAreas.filter((a) => a.enabled).length} مفعلة
                </span>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                قائمة المناطق التي تظهر للعميل في قائمة الاختيار الإلزامية عند إتمام الطلب، وفي التذييل السفلي.
              </p>

              {/* Add New Area */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAreaName}
                  onChange={(e) => setNewAreaName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddArea()
                    }
                  }}
                  placeholder="اكتب اسم منطقة جديدة (مثال: أكتوبر – الحي المتميز)..."
                  className="flex-1 p-2.5 rounded-xl border border-stone-300 font-semibold text-sm focus:border-emerald-700 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddArea}
                  className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={16} />
                  <span>إضافة منطقة</span>
                </button>
              </div>

              {/* Areas List */}
              <div className="space-y-2 pt-2">
                {serviceAreas.map((area, idx) => (
                  <div
                    key={area.id}
                    className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-colors ${
                      area.enabled
                        ? "bg-stone-50 border-stone-200"
                        : "bg-stone-100/60 border-stone-200 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-xs font-mono font-bold text-stone-400 w-5">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={area.name}
                        onChange={(e) => handleRenameArea(area.id, e.target.value)}
                        className="flex-1 p-1.5 bg-transparent border-b border-transparent hover:border-stone-300 focus:border-emerald-600 focus:bg-white rounded font-bold text-sm outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Reorder Buttons */}
                      <button
                        type="button"
                        onClick={() => handleMoveArea(idx, "up")}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg hover:bg-stone-200 disabled:opacity-30 cursor-pointer"
                        title="تحريك لأعلى"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveArea(idx, "down")}
                        disabled={idx === serviceAreas.length - 1}
                        className="p-1.5 rounded-lg hover:bg-stone-200 disabled:opacity-30 cursor-pointer"
                        title="تحريك لأسفل"
                      >
                        <ArrowDown size={14} />
                      </button>

                      {/* Enable/Disable Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleArea(area.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${
                          area.enabled
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-stone-200 text-stone-600 hover:bg-stone-300"
                        }`}
                      >
                        {area.enabled ? "مفعلة" : "معطلة"}
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteArea(area.id)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="حذف المنطقة"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Official WhatsApp Number */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                <Phone className="text-emerald-700" size={20} />
                <h2 className="text-base font-extrabold text-stone-900">
                  رقم الواتساب الرسمي (WhatsApp Number)
                </h2>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                يستخدم لاستقبال طلبات العملاء وإرسال الإشعارات.
              </p>
              <div>
                <input
                  type="text"
                  dir="ltr"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="01224272991"
                  className="w-full p-3 rounded-xl border border-stone-300 font-mono font-bold text-sm focus:border-emerald-700 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* 4. Free Delivery Offer Settings */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-emerald-700" size={20} />
                  <h2 className="text-base font-extrabold text-stone-900">
                    عروض التوصيل المجاني (Free Delivery)
                  </h2>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={freeDeliveryActive}
                    onChange={(e) => setFreeDeliveryActive(e.target.checked)}
                    className="w-5 h-5 accent-emerald-800 cursor-pointer rounded"
                  />
                  <span className="text-xs font-bold text-stone-800">
                    تفعيل التوصيل المجاني
                  </span>
                </label>
              </div>

              <p className="text-xs text-stone-500 leading-relaxed">
                عند التفعيل، تصبح رسوم التوصيل تلقائياً &quot;مجاني&quot; (٠ ج.م) في السلة وصفحة الدفع وأي طلب جديد. عند الإلغاء، تصبح الرسوم &quot;بيتحدد حسب المسافة وهيتأكد معاك&quot;، ويقوم المشرف بتحديدها من شاشة الطلبات.
              </p>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  نص عرض التوصيل المجاني:
                </label>
                <input
                  type="text"
                  value={freeDeliveryText}
                  onChange={(e) => setFreeDeliveryText(e.target.value)}
                  placeholder="التوصيل مجاني في عروض الافتتاح"
                  className="w-full p-3 rounded-xl border border-stone-300 font-bold text-sm focus:border-emerald-700 focus:outline-none"
                />
              </div>
            </div>

            {/* Submit Bar */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-sm inline-flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                <Save size={18} />
                <span>{saving ? "جاري الحفظ..." : "حفظ التغييرات"}</span>
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
