"use client"

import React, { useState, useEffect, useMemo } from "react"
import Link from "next/link"
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
} from "lucide-react"
import type { Order, OrderStatus } from "@/lib/db/types"
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
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/orders")
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
                placeholder="ابحث برقم الطلب، اسم العميل، أو رقم الهاتف..."
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
                  <th>عنوان وموقع التوصيل</th>
                  <th>عدد الأصناف</th>
                  <th>الإجمالي</th>
                  <th>حالة الطلب</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.new
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

                      {/* Address & Pin Location */}
                      <td>
                        <div className="max-w-[220px] text-xs text-stone-700 leading-snug">
                          <span className="font-medium block">
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
                            <span>فتح الموقع على الخريطة</span>
                            <ExternalLink size={10} />
                          </a>
                        </div>
                      </td>

                      {/* Items */}
                      <td>
                        <span className="text-xs font-bold text-stone-800">
                          {order.items.length} أصناف
                        </span>
                      </td>

                      {/* Total */}
                      <td>
                        <strong className="text-sm font-extrabold text-emerald-800">
                          {number.format(order.total_price)} ج.م
                        </strong>
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
                            title="عرض صفحة تأكيد الزبون"
                          >
                            <ExternalLink size={15} />
                          </Link>
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
              <div className="p-3 bg-stone-50 rounded-xl space-y-1">
                <span className="text-xs font-bold text-stone-500 block">بيانات العميل:</span>
                <p><strong>الاسم:</strong> {selectedOrder.customer_name}</p>
                <p><strong>الهاتف:</strong> <span dir="ltr">{selectedOrder.customer_phone}</span></p>
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

              {/* Total & Status */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="text-xs text-stone-400 block">إجمالي الفاتورة:</span>
                  <span className="text-xl font-extrabold text-emerald-800">
                    {number.format(selectedOrder.total_price)} ج.م
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 font-bold">تغيير الحالة:</span>
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
