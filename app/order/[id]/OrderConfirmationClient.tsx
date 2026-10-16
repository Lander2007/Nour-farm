"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  ExternalLink,
  Copy,
  Check,
  ArrowRight,
  PackageCheck,
  Building,
} from "lucide-react"
import type { Order } from "@/lib/db/types"

const WHATSAPP_PHONE = "201102740002"

const number = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 1 })

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: "تم استلام الطلب", color: "text-blue-800", bg: "bg-blue-100" },
  preparing: { label: "قيد التجهيز والتقطيع", color: "text-amber-800", bg: "bg-amber-100" },
  delivered: { label: "تم تسليم الطلب", color: "text-emerald-800", bg: "bg-emerald-100" },
  cancelled: { label: "ملغي", color: "text-rose-800", bg: "bg-rose-100" },
}

export default function OrderConfirmationClient({ order }: { order: Order }) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  // Generate formal WhatsApp message without emojis
  const generateWhatsAppMessage = () => {
    const itemsList = order.items
      .map(
        (it) =>
          `- ${it.name}: ${number.format(it.qty)} ${it.unit} (${number.format(it.line_total)} ج.م)`
      )
      .join("\n")

    const address = [
      order.address_details.building ? `عمارة: ${order.address_details.building}` : "",
      order.address_details.floor ? `الدور: ${order.address_details.floor}` : "",
      order.address_details.apartment ? `شقة: ${order.address_details.apartment}` : "",
      order.address_details.landmark ? `علامة مميزة: ${order.address_details.landmark}` : "",
    ]
      .filter(Boolean)
      .join("، ")

    const mapsLink = `https://maps.google.com/?q=${order.location.lat},${order.location.lng}`

    return encodeURIComponent(
      `السلام عليكم ورحمة الله وبركاته،
تأكيد طلب من نور فارم
رقم الطلب: ${order.order_number}
تاريخ الطلب: ${new Date(order.created_at).toLocaleDateString("ar-EG")}

بيانات العميل:
الاسم: ${order.customer_name}
الهاتف: ${order.customer_phone}
العنوان: ${address}
موقع التوصيل: ${mapsLink}

تفاصيل الطلب:
${itemsList}

إجمالي الحساب: ${number.format(order.total_price)} جنيه مصري
شكراً لتعاملكم مع نور فارم.`
    )
  }

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(order.order_number)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Mount Leaflet pin map
  useEffect(() => {
    let isMounted = true
    const initMap = async () => {
      if (typeof window === "undefined" || !mapContainerRef.current) return

      // Load Leaflet CSS dynamically if not present
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link")
        link.id = "leaflet-css"
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)
      }

      const L = await import("leaflet")
      if (!isMounted || !mapContainerRef.current) return

      const customPinSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 48" width="36" height="48">
          <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 30 18 30s18-16.5 18-30C36 8.06 27.94 0 18 0z" fill="#2e7d32"/>
          <circle cx="18" cy="18" r="7" fill="#ffffff"/>
          <circle cx="18" cy="18" r="3.5" fill="#1b5e20"/>
        </svg>
      `
      const pinIcon = L.divIcon({
        className: "order-leaflet-pin",
        html: customPinSvg,
        iconSize: [36, 48],
        iconAnchor: [18, 48],
      })

      const map = L.map(mapContainerRef.current, {
        center: [order.location.lat, order.location.lng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map)

      L.marker([order.location.lat, order.location.lng], { icon: pinIcon }).addTo(map)
    }

    initMap()
    return () => {
      isMounted = false
    }
  }, [order.location])

  const statusInfo = STATUS_LABELS[order.status] || STATUS_LABELS.new

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200/80 shadow-sm text-center relative overflow-hidden">
        <div className="w-16 h-16 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-center mx-auto mb-4 text-emerald-700 shadow-inner">
          <PackageCheck className="w-9 h-9" />
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-stone-900 mb-2">
          تم استلام طلبك بنجاح
        </h1>
        <p className="text-stone-600 text-sm md:text-base max-width-md mx-auto">
          شكراً لتسوقك من نور فارم. جاري تجهيز الخضار والفاكهة الطازجة لتوصيلها إلى عنوانك.
        </p>

        {/* Order Identifier & Status */}
        <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200/80">
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 font-bold">رقم الطلب:</span>
            <span className="font-mono text-base font-extrabold text-stone-900">
              #{order.order_number}
            </span>
            <button
              type="button"
              onClick={copyOrderNumber}
              className="p-1 hover:bg-stone-200 rounded-md transition text-stone-500 hover:text-stone-800 cursor-pointer"
              title="نسخ رقم الطلب"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <span className="text-stone-300">|</span>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 font-bold">الحالة:</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusInfo.bg} ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* WhatsApp Formal Action Button */}
        <div className="mt-6 max-w-md mx-auto">
          <a
            href={`https://wa.me/${WHATSAPP_PHONE}?text=${generateWhatsAppMessage()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-[#1e7e34] hover:bg-[#155724] text-white font-bold text-sm md:text-base transition shadow-md shadow-emerald-900/10 cursor-pointer text-decoration-none"
          >
            <span>إرسال تأكيد الطلب لمسؤول المبيعات عبر واتساب</span>
            <ExternalLink className="w-4 h-4" />
          </a>
          <span className="text-xs text-stone-400 mt-2 block">
            يمكنك إرسال رسالة رسمية لتأكيد استلام الطلب وتتبع موعد وصول الشحنة
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ordered Items Summary */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-stone-100">
              <ShoppingBag className="w-5 h-5 text-emerald-700" />
              <h2 className="text-base font-extrabold text-stone-900">
                محتويات الطلب ({order.items.length})
              </h2>
            </div>

            <div className="divide-y divide-stone-100 max-h-[320px] overflow-y-auto pr-1">
              {order.items.map((it, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <span className="font-bold text-stone-800 block">{it.name}</span>
                    <span className="text-xs text-stone-500">
                      {number.format(it.qty)} {it.unit} × {number.format(it.unit_price)} ج.م
                    </span>
                  </div>
                  <span className="font-bold text-stone-900">
                    {number.format(it.line_total)} ج.م
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-stone-200 flex items-center justify-between">
            <span className="text-sm font-bold text-stone-600">إجمالي الحساب:</span>
            <span className="text-xl font-extrabold text-emerald-800">
              {number.format(order.total_price)} ج.م
            </span>
          </div>
        </div>

        {/* Customer & Delivery Location Details */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-stone-100">
              <MapPin className="w-5 h-5 text-emerald-700" />
              <h2 className="text-base font-extrabold text-stone-900">
                بيانات التوصيل والعنوان
              </h2>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2.5 text-stone-700">
                <User className="w-4 h-4 text-stone-400 flex-shrink-0" />
                <span>العميل: <strong className="text-stone-900">{order.customer_name}</strong></span>
              </div>

              <div className="flex items-center gap-2.5 text-stone-700">
                <Phone className="w-4 h-4 text-stone-400 flex-shrink-0" />
                <span>الهاتف: <strong className="text-stone-900" dir="ltr">{order.customer_phone}</strong></span>
              </div>

              <div className="flex items-start gap-2.5 text-stone-700">
                <Building className="w-4 h-4 text-stone-400 flex-shrink-0 mt-0.5" />
                <span>
                  العنوان: عمارة {order.address_details.building}
                  {order.address_details.floor && `، الدور ${order.address_details.floor}`}
                  {order.address_details.apartment && `، شقة ${order.address_details.apartment}`}
                  {order.address_details.landmark && ` (علامة مميزة: ${order.address_details.landmark})`}
                </span>
              </div>
            </div>

            {/* Static Leaflet map snapshot */}
            <div className="mt-4 rounded-xl overflow-hidden border border-stone-200 relative h-36">
              <div ref={mapContainerRef} className="w-full h-full" />
              <a
                href={`https://maps.google.com/?q=${order.location.lat},${order.location.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-xs text-[11px] font-bold text-emerald-800 px-2 py-1 rounded-md shadow-xs border border-emerald-200 flex items-center gap-1 z-[1000] cursor-pointer"
              >
                <span>فتح في خرائط جوجل</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="mt-4 pt-3 text-xs text-stone-400">
            تم حفظ الموقع المحدد بنجاح بدقة إحداثيات ({order.location.lat}, {order.location.lng})
          </div>
        </div>
      </div>

      {/* Navigation Return Button */}
      <div className="text-center pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-sm transition"
        >
          <span>العودة إلى الصفحة الرئيسية</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
