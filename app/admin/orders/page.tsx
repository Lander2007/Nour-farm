"use client"

import React, { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ShoppingBag,
  Search,
  MapPin,
  Phone,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  Layers,
  ArrowRight,
  Truck,
  Building,
  Settings,
  MessageCircle,
  Send,
} from "lucide-react"
import type { Order, OrderStatus, DeliveryFeeStatus, PaymentStatus } from "@/lib/db/types"
import { useStoreSettings } from "@/store/settings"
import "../admin.css"

const number = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 1 })

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; color: string; border: string }
> = {
  new: {
    label: "جديد",
    bg: "bg-blue-50",
    color: "text-blue-800",
    border: "border-blue-200",
  },
  preparing: {
    label: "قيد التجهيز",
    bg: "bg-amber-50",
    color: "text-amber-800",
    border: "border-amber-200",
  },
  delivered: {
    label: "تم التسليم",
    bg: "bg-emerald-50",
    color: "text-emerald-800",
    border: "border-emerald-200",
  },
  cancelled: {
    label: "ملغي",
    bg: "bg-rose-50",
    color: "text-rose-800",
    border: "border-rose-200",
  },
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const storeSettings = useStoreSettings()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [feeInputs, setFeeInputs] = useState<Record<string, string>>({})
  const [modalFeeInput, setModalFeeInput] = useState<string>("")

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/orders")
      if (res.status === 401) {
        router.push("/admin/login")
        return
      }
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders || [])
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingId(orderId)
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      })
      if (res.ok) {
        const data = await res.json()
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        )
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null))
        }
      }
    } catch (err) {
      console.error("Failed to update status:", err)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleSaveDeliveryFee = async (
    orderId: string,
    feeValue: number,
    feeStatus: DeliveryFeeStatus
  ) => {
    try {
      setUpdatingId(orderId)
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: orderId,
          deliveryFee: feeValue,
          deliveryFeeStatus: feeStatus,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        const updated = data.order
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? updated : o))
        )
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(updated)
        }
      }
    } catch (err) {
      console.error("Failed to update delivery fee:", err)
    } finally {
      setUpdatingId(null)
    }
  }

  const handlePaymentStatusToggle = async (
    orderId: string,
    newStatus: PaymentStatus
  ) => {
    try {
      setUpdatingId(orderId)
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, paymentStatus: newStatus }),
      })
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, payment_status: newStatus, paymentStatus: newStatus }
              : o
          )
        )
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) =>
            prev
              ? { ...prev, payment_status: newStatus, paymentStatus: newStatus }
              : null
          )
        }
      }
    } catch (err) {
      console.error("Failed to update payment status:", err)
    } finally {
      setUpdatingId(null)
    }
  }

  const convertToWaPhone = (phone: string): string => {
    let clean = (phone || "").replace(/\D/g, "")
    if (clean.startsWith("20")) return clean
    if (clean.startsWith("0")) return `20${clean.slice(1)}`
    return `20${clean}`
  }

  const getWhatsAppShareUrl = (order: Order): string => {
    const waPhone = convertToWaPhone(order.customer_phone)
    const subtotal =
      order.subtotal_price ??
      order.items.reduce((sum, it) => sum + (it.line_total || 0), 0)

    const feeText =
      order.delivery_fee_status === "free"
        ? "مجاني"
        : order.delivery_fee_status === "set" && order.delivery_fee != null
        ? `${number.format(order.delivery_fee)} ج.م`
        : "بيتحدد حسب المسافة"

    const payMethod = order.payment_method || order.paymentMethod || "cod"
    let payDetails = ""
    if (payMethod === "wallet") {
      payDetails = `\n- طريقة الدفع: محفظة إلكترونية${storeSettings.walletLabel ? ` (${storeSettings.walletLabel})` : ""}\n- رقم التحويل: ${storeSettings.walletNumber || ""}\n(برجاء تحويل الإجمالي وإرسال صورة التحويل هنا)`
    } else if (payMethod === "instapay") {
      payDetails = `\n- طريقة الدفع: إنستاباي (InstaPay)\n- عنوان إنستاباي: ${storeSettings.instapayAddress || ""}\n(برجاء تحويل الإجمالي وإرسال صورة التحويل هنا)`
    } else {
      payDetails = "\n- طريقة الدفع: الدفع عند الاستلام (نقدًا)"
    }

    const message = `مرحباً ${order.customer_name}،
بخصوص طلبك رقم #${order.order_number} من نور فارم:
- منطقة التوصيل: ${order.area || "المحددة"}
- إجمالي المنتجات: ${number.format(subtotal)} ج.م
- رسوم التوصيل: ${feeText}
- الإجمالي: ${number.format(order.total_price)} ج.م${payDetails}

طلبك قيد المتابعة والتجهيز، شكراً لتسوقك معنا!`

    return `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        searchQuery === "" ||
        o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer_phone.includes(searchQuery)

      const matchStatus = statusFilter === "all" || o.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [orders, searchQuery, statusFilter])

  const stats = useMemo(() => {
    const total = orders.length
    const newCount = orders.filter((o) => o.status === "new").length
    const prepCount = orders.filter((o) => o.status === "preparing").length
    const delivCount = orders.filter((o) => o.status === "delivered").length
    const totalRev = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + (Number(o.total_price) || 0), 0)
    return { total, newCount, prepCount, delivCount, totalRev }
  }, [orders])

  return (
    <div className="admin-root min-h-screen pb-16">
      {/* Top Header */}
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-brand">
            <div>
              <h1 className="admin-brand-title">إدارة طلبات العملاء</h1>
              <span className="admin-brand-tagline">
                <span className="status-dot" /> متابعة التجهيز والتوصيل اللحظي
              </span>
            </div>
          </div>

          <div className="admin-header-actions">
            <Link href="/admin" className="admin-action-btn-ghost">
              <Layers size={16} />
              <span>إدارة المنتجات</span>
            </Link>
            <Link href="/admin/settings" className="admin-action-btn-ghost">
              <Settings size={16} />
              <span>إعدادات المتجر</span>
            </Link>
            <button
              type="button"
              onClick={fetchOrders}
              className="admin-action-btn-ghost"
              title="تحديث البيانات"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              <span>تحديث</span>
            </button>
            <Link href="/" target="_blank" className="admin-action-btn-ghost">
              <ExternalLink size={16} />
              <span>عرض المتجر</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="admin-container">
        {/* KPI Grid */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-card-title">إجمالي الطلبات</span>
              <div className="kpi-card-icon">
                <ShoppingBag size={20} />
              </div>
            </div>
            <div className="kpi-card-value">{stats.total}</div>
            <div className="kpi-card-subline">طلبات مسجلة في النظام</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-card-title">طلبات جديدة</span>
              <div className="kpi-card-icon" style={{ background: "#eff6ff", color: "#1d4ed8" }}>
                <Clock size={20} />
              </div>
            </div>
            <div className="kpi-card-value">{stats.newCount}</div>
            <div className="kpi-card-subline">تحتاج إلى مراجعة وتجهيز</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-card-title">قيد التجهيز والتوصيل</span>
              <div className="kpi-card-icon" style={{ background: "#fffbeb", color: "#b45309" }}>
                <Truck size={20} />
              </div>
            </div>
            <div className="kpi-card-value">{stats.prepCount}</div>
            <div className="kpi-card-subline">في مرحلة التقطيع أو الطريق</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-card-title">إجمالي المبيعات</span>
              <div className="kpi-card-icon" style={{ background: "#ecfdf5", color: "#047857" }}>
                <CheckCircle2 size={20} />
              </div>
            </div>
            <div className="kpi-card-value">{number.format(stats.totalRev)} ج.م</div>
            <div className="kpi-card-subline">قيمة الطلبات المكتملة والسارية</div>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="admin-toolbar-card">
          <div className="toolbar-top-row">
            <div className="toolbar-search-wrapper">
              <Search className="toolbar-search-icon" size={18} />
              <input
                type="text"
                placeholder="ابحث برقم الطلب، اسم العميل، أو رقم الهاتف أو المنطقة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="toolbar-search-input"
              />
            </div>
          </div>

          <div className="toolbar-filters-row">
            <div className="category-tabs">
              {[
                { id: "all", label: "جميع الطلبات" },
                { id: "new", label: "جديد" },
                { id: "preparing", label: "قيد التجهيز" },
                { id: "delivered", label: "تم التسليم" },
                { id: "cancelled", label: "ملغي" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`category-tab-btn ${statusFilter === tab.id ? "active" : ""}`}
                >
                  <span>{tab.label}</span>
                  <span className="tab-badge">
                    {tab.id === "all"
                      ? orders.length
                      : orders.filter((o) => o.status === tab.id).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="table-container">
          {loading ? (
            <div className="py-20 text-center text-gray-500">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-700 mb-3" />
              <span>جاري تحميل سجل الطلبات...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <ShoppingBag className="w-12 h-12 mx-auto text-stone-300 mb-3" />
              <p className="text-base font-bold text-stone-700">لا توجد طلبات مطابقة</p>
              <span className="text-xs text-stone-400">
                {searchQuery || statusFilter !== "all"
                  ? "جرّب تغيير عبارة البحث أو الفلتر"
                  : "ستظهر طلبات الزبائن فور تأكيدها في المتجر"}
              </span>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>رقم الطلب</th>
                  <th>تاريخ الطلب</th>
                  <th>بيانات العميل</th>
                  <th>المنطقة والعنوان</th>
                  <th>طريقة الدفع</th>
                  <th>رسوم التوصيل</th>
                  <th>الإجمالي</th>
                  <th>حالة الطلب</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.new
                  const currentInputValue =
                    feeInputs[order.id] !== undefined
                      ? feeInputs[order.id]
                      : order.delivery_fee != null
                      ? String(order.delivery_fee)
                      : ""
                  const isFeeSaved =
                    order.delivery_fee_status === "set" || order.delivery_fee_status === "free"

                  return (
                    <tr key={order.id}>
                      {/* Order Number */}
                      <td>
                        <span className="font-mono font-bold text-stone-900 text-sm block">
                          #{order.order_number}
                        </span>
                        <span className="text-[11px] text-stone-400 font-mono">
                          {order.id.slice(0, 8)}
                        </span>
                      </td>

                      {/* Date */}
                      <td>
                        <span className="text-xs text-stone-700 font-medium block">
                          {new Date(order.created_at).toLocaleDateString("ar-EG")}
                        </span>
                        <span className="text-[11px] text-stone-400">
                          {new Date(order.created_at).toLocaleTimeString("ar-EG", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td>
                        <strong className="text-stone-900 text-sm block">
                          {order.customer_name}
                        </strong>
                        <a
                          href={`tel:${order.customer_phone}`}
                          className="text-xs text-emerald-700 font-mono font-bold hover:underline"
                          dir="ltr"
                        >
                          {order.customer_phone}
                        </a>
                      </td>

                      {/* Area & Address */}
                      <td>
                        <div className="max-w-[220px] text-xs text-stone-700 leading-snug">
                          {order.area && (
                            <div className="inline-flex items-center gap-1 font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-md mb-1">
                              <Building size={11} className="text-emerald-700 shrink-0" />
                              <span className="truncate">{order.area}</span>
                            </div>
                          )}
                          <span className="text-stone-600 block">
                            عمارة {order.address_details.building}
                            {order.address_details.apartment && `، شقة ${order.address_details.apartment}`}
                          </span>
                          <a
                            href={`https://maps.google.com/?q=${order.location.lat},${order.location.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-blue-700 hover:underline mt-0.5"
                          >
                            <MapPin size={11} />
                            <span>الموقع على الخريطة</span>
                            <ExternalLink size={10} />
                          </a>
                        </div>
                      </td>

                      {/* Payment Method & Status */}
                      <td>
                        <div className="flex flex-col gap-1.5 min-w-[125px]">
                          <span className="text-xs font-bold text-stone-800">
                            {order.payment_method === "wallet"
                              ? "محفظة إلكترونية"
                              : order.payment_method === "instapay"
                              ? "إنستاباي"
                              : "عند الاستلام"}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handlePaymentStatusToggle(
                                order.id,
                                (order.payment_status || order.paymentStatus) === "received"
                                  ? "pending"
                                  : "received"
                              )
                            }
                            disabled={updatingId === order.id}
                            className={`px-2 py-1 text-[10px] font-bold rounded-lg transition cursor-pointer border flex items-center justify-center gap-1 ${
                              (order.payment_status || order.paymentStatus) === "received"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200"
                                : "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                            }`}
                            title="تغيير حالة استلام الدفع"
                          >
                            {(order.payment_status || order.paymentStatus) === "received" ? (
                              <>
                                <span>✓</span>
                                <span>تم استلام الدفع</span>
                              </>
                            ) : (
                              <span>في انتظار الدفع</span>
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Delivery Fee Input & Quick Free */}
                      <td>
                        <div className="flex flex-col gap-1.5 min-w-[150px]">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              step="5"
                              placeholder="الرسوم ج.م"
                              value={currentInputValue}
                              onChange={(e) =>
                                setFeeInputs((prev) => ({
                                  ...prev,
                                  [order.id]: e.target.value,
                                }))
                              }
                              className="w-20 px-2 py-1 text-xs border border-stone-300 rounded-lg font-mono focus:border-emerald-600 outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setFeeInputs((prev) => ({ ...prev, [order.id]: "0" }))
                                handleSaveDeliveryFee(order.id, 0, "free")
                              }}
                              disabled={updatingId === order.id}
                              className="px-2 py-1 text-[11px] font-bold rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition cursor-pointer"
                              title="تحديد التوصيل مجاني"
                            >
                              مجاني
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const val = Number(currentInputValue || 0)
                                handleSaveDeliveryFee(
                                  order.id,
                                  val,
                                  val === 0 ? "free" : "set"
                                )
                              }}
                              disabled={updatingId === order.id}
                              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-stone-800 hover:bg-black text-white transition cursor-pointer"
                            >
                              حفظ
                            </button>
                          </div>
                          <div>
                            {order.delivery_fee_status === "free" ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                تم التحديد: مجاني
                              </span>
                            ) : order.delivery_fee_status === "set" ? (
                              <span className="text-[10px] font-bold text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded">
                                تم التحديد: {number.format(order.delivery_fee ?? 0)} ج.م
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                                لم تُحدد بعد (قيد الانتظار)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Total */}
                      <td>
                        {order.delivery_fee_status === "pending" ||
                        order.delivery_fee_status === null ||
                        order.delivery_fee_status === undefined ? (
                          <div>
                            <strong className="text-sm font-extrabold text-stone-800 block">
                              {number.format(order.subtotal_price ?? order.total_price)} ج.م
                            </strong>
                            <span className="text-[10px] font-bold text-amber-700 block">
                              (بدون التوصيل)
                            </span>
                          </div>
                        ) : (
                          <div>
                            <strong className="text-sm font-extrabold text-emerald-800 block">
                              {number.format(order.total_price)} ج.م
                            </strong>
                            {order.delivery_fee_status === "free" ? (
                              <span className="text-[10px] text-emerald-700 block font-medium">
                                شامل توصيل مجاني
                              </span>
                            ) : (
                              <span className="text-[10px] text-stone-500 block">
                                شامل التوصيل ({number.format(order.delivery_fee ?? 0)} ج.م)
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Status Dropdown */}
                      <td>
                        <select
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value as OrderStatus)
                          }
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border cursor-pointer outline-none transition ${cfg.bg} ${cfg.color} ${cfg.border}`}
                        >
                          <option value="new">جديد</option>
                          <option value="preparing">قيد التجهيز</option>
                          <option value="delivered">تم التسليم</option>
                          <option value="cancelled">ملغي</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition cursor-pointer"
                            >
                              التفاصيل
                            </button>
                            <Link
                              href={`/order/${order.id}`}
                              target="_blank"
                              className="p-1 text-stone-400 hover:text-emerald-700 transition"
                              title="عرض فاتورة العميل"
                            >
                              <ExternalLink size={15} />
                            </Link>
                          </div>

                          {isFeeSaved && (
                            <a
                              href={getWhatsAppShareUrl(order)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1 px-2 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition text-center shadow-xs"
                              title="إرسال الإجمالي للعميل عبر واتساب"
                            >
                              <MessageCircle size={12} />
                              <span>إرسال الإجمالي للعميل</span>
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedOrder(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal-card max-w-2xl w-full p-6 bg-white rounded-2xl shadow-xl text-stone-900 border border-stone-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div>
                <h2 className="text-lg font-extrabold">تفاصيل الطلب #{selectedOrder.order_number}</h2>
                <span className="text-xs text-stone-400">
                  تاريخ التسجيل: {new Date(selectedOrder.created_at).toLocaleString("ar-EG")}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-sm">
              {/* Customer */}
              <div className="p-3 bg-stone-50 rounded-xl space-y-1.5">
                <span className="text-xs font-bold text-stone-500 block">بيانات العميل والتوصيل:</span>
                <p><strong>الاسم:</strong> {selectedOrder.customer_name}</p>
                <p><strong>الهاتف:</strong> <span dir="ltr">{selectedOrder.customer_phone}</span></p>
                {selectedOrder.area && (
                  <p>
                    <strong>منطقة التوصيل:</strong>{" "}
                    <span className="font-bold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded">
                      {selectedOrder.area}
                    </span>
                  </p>
                )}
                <p>
                  <strong>العنوان:</strong> عمارة {selectedOrder.address_details.building}،
                  الدور {selectedOrder.address_details.floor || "غير محدد"}،
                  شقة {selectedOrder.address_details.apartment}
                  {selectedOrder.address_details.landmark && ` (علامة مميزة: ${selectedOrder.address_details.landmark})`}
                </p>
                {selectedOrder.address_details.notes && (
                  <p><strong>ملاحظات العميل:</strong> {selectedOrder.address_details.notes}</p>
                )}
                <div className="pt-2">
                  <a
                    href={`https://maps.google.com/?q=${selectedOrder.location.lat},${selectedOrder.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs"
                  >
                    <MapPin size={14} />
                    <span>فتح اللوكيشن على خرائط جوجل ({selectedOrder.location.lat}, {selectedOrder.location.lng})</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {/* Delivery Fee Management Box */}
              <div className="p-3.5 bg-emerald-50/50 border border-emerald-200/70 rounded-xl space-y-2">
                <span className="text-xs font-extrabold text-emerald-950 block">إدارة رسوم التوصيل:</span>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="5"
                    placeholder="قيمة الرسوم ج.م"
                    defaultValue={selectedOrder.delivery_fee != null ? String(selectedOrder.delivery_fee) : ""}
                    id="modal-fee-input"
                    className="w-28 px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg font-mono outline-none focus:border-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById("modal-fee-input") as HTMLInputElement
                      if (input) input.value = "0"
                      handleSaveDeliveryFee(selectedOrder.id, 0, "free")
                    }}
                    disabled={updatingId === selectedOrder.id}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition cursor-pointer"
                  >
                    مجاني
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById("modal-fee-input") as HTMLInputElement
                      const val = Number(input?.value || 0)
                      handleSaveDeliveryFee(
                        selectedOrder.id,
                        val,
                        val === 0 ? "free" : "set"
                      )
                    }}
                    disabled={updatingId === selectedOrder.id}
                    className="px-4 py-1.5 text-xs font-bold rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white transition cursor-pointer"
                  >
                    حفظ الرسوم
                  </button>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-emerald-100">
                  <div className="text-xs">
                    {selectedOrder.delivery_fee_status === "free" ? (
                      <span className="font-bold text-emerald-800">الحالة الحالية: توصيل مجاني</span>
                    ) : selectedOrder.delivery_fee_status === "set" ? (
                      <span className="font-bold text-stone-800">
                        الحالة الحالية: رسوم التوصيل {number.format(selectedOrder.delivery_fee ?? 0)} ج.م
                      </span>
                    ) : (
                      <span className="font-bold text-amber-700">الحالة الحالية: لم تُحدد بعد (قيد الانتظار)</span>
                    )}
                  </div>

                  <a
                    href={getWhatsAppShareUrl(selectedOrder)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                  >
                    <MessageCircle size={14} />
                    <span>إرسال الإجمالي للعميل عبر واتساب</span>
                  </a>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <span className="text-xs font-bold text-stone-500 block mb-2">الأصناف المطلوبة:</span>
                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-stone-50 border-b border-stone-200">
                      <tr>
                        <th className="p-2.5">الصنف</th>
                        <th className="p-2.5">الكمية</th>
                        <th className="p-2.5">سعر الوحدة</th>
                        <th className="p-2.5">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {selectedOrder.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-bold">{it.name}</td>
                          <td className="p-2.5">{number.format(it.qty)} {it.unit}</td>
                          <td className="p-2.5">{number.format(it.unit_price)} ج.م</td>
                          <td className="p-2.5 font-bold text-emerald-800">
                            {number.format(it.line_total)} ج.م
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Breakdown & Status */}
              <div className="p-3 bg-stone-50 rounded-xl space-y-2">
                <div className="flex justify-between text-xs text-stone-600">
                  <span>إجمالي المنتجات:</span>
                  <span className="font-mono font-bold">
                    {number.format(
                      selectedOrder.subtotal_price ??
                        selectedOrder.items.reduce((s, it) => s + (it.line_total || 0), 0)
                    )} ج.م
                  </span>
                </div>
                <div className="flex justify-between text-xs text-stone-600">
                  <span>رسوم التوصيل:</span>
                  <span className="font-mono font-bold">
                    {selectedOrder.delivery_fee_status === "free"
                      ? "مجاني"
                      : selectedOrder.delivery_fee_status === "set"
                      ? `${number.format(selectedOrder.delivery_fee ?? 0)} ج.م`
                      : "بيتحدد حسب المسافة"}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-stone-900 pt-2 border-t border-stone-200">
                  <span>
                    {selectedOrder.delivery_fee_status === "free" || selectedOrder.delivery_fee_status === "set"
                      ? "الإجمالي النهائي:"
                      : "الإجمالي (بدون التوصيل):"}
                  </span>
                  <span className="text-emerald-800 text-lg font-mono">
                    {number.format(selectedOrder.total_price)} ج.م
                  </span>
                </div>
              </div>

              {/* Payment Details in Modal */}
              <div className="p-3 bg-stone-50 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-500 font-bold block mb-0.5">طريقة الدفع:</span>
                  <span className="text-sm font-bold text-stone-900">
                    {selectedOrder.payment_method === "wallet"
                      ? `محفظة إلكترونية${storeSettings.walletLabel ? ` (${storeSettings.walletLabel})` : ""}`
                      : selectedOrder.payment_method === "instapay"
                      ? "إنستاباي (InstaPay)"
                      : "الدفع عند الاستلام (نقدًا)"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handlePaymentStatusToggle(
                      selectedOrder.id,
                      (selectedOrder.payment_status || selectedOrder.paymentStatus) === "received"
                        ? "pending"
                        : "received"
                    )
                  }
                  disabled={updatingId === selectedOrder.id}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer border flex items-center gap-1.5 ${
                    (selectedOrder.payment_status || selectedOrder.paymentStatus) === "received"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200"
                      : "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                  }`}
                >
                  {(selectedOrder.payment_status || selectedOrder.paymentStatus) === "received" ? (
                    <>
                      <span>✓</span>
                      <span>تم استلام الدفع</span>
                    </>
                  ) : (
                    <span>تأكيد استلام الدفع</span>
                  )}
                </button>
              </div>

              {/* Status Selector */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-stone-500 font-bold">تغيير حالة الطلب:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)
                  }
                  className="text-xs font-bold p-2 rounded-lg border border-stone-300"
                >
                  <option value="new">جديد</option>
                  <option value="preparing">قيد التجهيز</option>
                  <option value="delivered">تم التسليم</option>
                  <option value="cancelled">ملغي</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 flex justify-end gap-2">
              <Link
                href={`/order/${selectedOrder.id}`}
                target="_blank"
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs inline-flex items-center gap-1.5"
              >
                <span>فتح صفحة العميل</span>
                <ExternalLink size={14} />
              </Link>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

