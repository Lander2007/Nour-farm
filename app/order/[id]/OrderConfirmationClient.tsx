"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import {
  MapPin,
  Phone,
  User,
  ExternalLink,
  Printer,
  ArrowRight,
  Building,
  Check,
  Copy,
  MessageCircle,
} from "lucide-react"
import type { Order } from "@/lib/db/types"
import ReceiptPrinter from "@/components/ReceiptPrinter"

const WHATSAPP_PHONE = "201224272991"

const number = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 1 })

// Restyled status chips using Noor Farm brand tokens (#2F3B27, #2F4A33, #D9788C, #D8402F, #55704A)
const STATUS_LABELS: Record<string, { label: string; color: string; bg: string; border: string }> = {
  new: {
    label: "تم استلام الطلب",
    color: "text-[#2F4A33]",
    bg: "bg-[#2F4A33]/10",
    border: "border-[#2F4A33]/20",
  },
  preparing: {
    label: "قيد التجهيز والتقطيع",
    color: "text-[#D8402F]",
    bg: "bg-[#D8402F]/10",
    border: "border-[#D8402F]/20",
  },
  delivered: {
    label: "تم تسليم الطلب",
    color: "text-[#2F3B27]",
    bg: "bg-[#55704A]/15",
    border: "border-[#55704A]/30",
  },
  cancelled: {
    label: "ملغي",
    color: "text-[#D9788C]",
    bg: "bg-[#D9788C]/15",
    border: "border-[#D9788C]/30",
  },
}

export default function OrderConfirmationClient({ order }: { order: Order }) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  const storageKey = `nf_seen_receipt_${order.id || order.order_number}`

  // Determine if animation was already completed or reduced motion is requested
  const isImmediate = useRef<boolean>(false)
  if (typeof window !== "undefined" && !isImmediate.current) {
    try {
      const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      const seen = window.sessionStorage.getItem(storageKey) === "true"
      isImmediate.current = isReduced || seen
    } catch {
      // fallback
    }
  }

  const [isRevealed, setIsRevealed] = useState<boolean>(() => isImmediate.current)

  const handleAnimationComplete = useCallback(() => {
    setIsRevealed(true)
  }, [])

  // Generate formal WhatsApp message
  const generateWhatsAppMessage = () => {
    const itemsList = order.items
      .map((it) => {
        const name = (it as any).name_ar || (it as any).name || "صنف"
        return `- ${name}: ${number.format(it.qty)} ${it.unit} (${number.format(it.line_total)} ج.م)`
      })
      .join("\n")

    const address = [
      order.address_details?.building ? `عمارة: ${order.address_details.building}` : "",
      order.address_details?.floor ? `الدور: ${order.address_details.floor}` : "",
      order.address_details?.apartment ? `شقة: ${order.address_details.apartment}` : "",
      order.address_details?.landmark ? `علامة مميزة: ${order.address_details.landmark}` : "",
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

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print()
    }
  }

  // Mount Leaflet pin map with brand forest color
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
          <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 30 18 30s18-16.5 18-30C36 8.06 27.94 0 18 0z" fill="#2F4A33"/>
          <circle cx="18" cy="18" r="7" fill="#F7F0E3"/>
          <circle cx="18" cy="18" r="3.5" fill="#2F3B27"/>
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
    <div className="w-full flex flex-col items-center gap-6">
      {/* ═══════════════════════════════════════════════════════════════
          RECEIPT PRINTER (MAIN ORDER CONFIRMATION EXPERIENCE)
          ═══════════════════════════════════════════════════════════════ */}
      <ReceiptPrinter order={order} onAnimationComplete={handleAnimationComplete} />

      {/* ═══════════════════════════════════════════════════════════════
          ACTION BUTTONS (WhatsApp Confirmation & Window.print Action)
          Fades up smoothly after print animation completes
          ═══════════════════════════════════════════════════════════════ */}
      <div
        className="order-actions-bar w-full max-w-[420px] transition-all duration-500 ease-out flex flex-col gap-3"
        style={{
          opacity: isRevealed ? 1 : 0,
          transform: isRevealed ? "translateY(0)" : "translateY(12px)",
          pointerEvents: isRevealed ? "auto" : "none",
        }}
      >
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
          {/* Formal WhatsApp Action Button */}
          <a
            href={`https://wa.me/${WHATSAPP_PHONE}?text=${generateWhatsAppMessage()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl text-white font-bold text-sm transition shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer text-decoration-none border border-white/10"
            style={{
              background: "linear-gradient(180deg, #25D366 0%, #128C7E 100%)",
            }}
          >
            <MessageCircle className="w-4 h-4 flex-shrink-0" />
            <span>تأكيد الطلب عبر واتساب</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>

          {/* Optional Print Receipt Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl bg-white hover:bg-stone-50 active:scale-95 text-[#2F3B27] font-bold text-xs md:text-sm transition border border-[#2F3B27]/15 shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2F4A33]/30"
            title="طباعة إيصال الطلب"
          >
            <Printer className="w-4 h-4 text-[#2F4A33]" />
            <span>طباعة الإيصال</span>
          </button>
        </div>

        <span className="text-[11px] text-[#2F3B27]/60 text-center block leading-relaxed px-2">
          يمكنك إرسال رسالة لتأكيد موعد الشحن مع فريق خدمة عملاء نور فارم
        </span>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          DELIVERY & ADDRESS DETAILS (Map Snapshot & Coordinates)
          Fades up with an 80ms stagger after the buttons
          ═══════════════════════════════════════════════════════════════ */}
      <div
        className="order-delivery-card w-full max-w-[420px] transition-all duration-500 ease-out"
        style={{
          opacity: isRevealed ? 1 : 0,
          transform: isRevealed ? "translateY(0)" : "translateY(12px)",
          transitionDelay: isImmediate.current ? "0ms" : "80ms",
          pointerEvents: isRevealed ? "auto" : "none",
        }}
      >
        <div
          className="bg-white rounded-3xl p-5 md:p-6 border border-[#2F3B27]/12 shadow-sm text-[#2F3B27]"
          style={{
            boxShadow: "0 8px 24px -4px rgba(47, 59, 39, 0.08)",
          }}
        >
          {/* Card Header & Status Chip */}
          <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-[#2F3B27]/10">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[#2F4A33]/10 text-[#2F4A33] flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4" />
              </span>
              <h3 className="receipt-font-display text-sm font-extrabold text-[#2F3B27] m-0">
                بيانات التوصيل والعنوان
              </h3>
            </div>

            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border} border`}
            >
              {statusInfo.label}
            </span>
          </div>

          {/* Info Rows */}
          <div className="space-y-2.5 text-xs text-[#2F3B27]">
            <div className="flex items-center justify-between">
              <span className="text-[#2F3B27]/65 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#2F4A33]/70" />
                <span>العميل:</span>
              </span>
              <strong className="font-bold text-[#2F3B27]">{order.customer_name}</strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#2F3B27]/65 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#2F4A33]/70" />
                <span>الهاتف:</span>
              </span>
              <strong className="receipt-font-mono font-bold text-[#2F3B27]" dir="ltr">
                {order.customer_phone}
              </strong>
            </div>

            <div className="flex items-start justify-between gap-2 pt-1 border-t border-[#2F3B27]/5">
              <span className="text-[#2F3B27]/65 flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                <Building className="w-3.5 h-3.5 text-[#2F4A33]/70" />
                <span>العنوان:</span>
              </span>
              <span className="text-right font-medium leading-relaxed text-[#2F3B27]">
                عمارة {order.address_details?.building}
                {order.address_details?.floor && `، الدور ${order.address_details.floor}`}
                {order.address_details?.apartment && `، شقة ${order.address_details.apartment}`}
                {order.address_details?.landmark && ` (${order.address_details.landmark})`}
              </span>
            </div>
          </div>

          {/* Static Leaflet map snapshot */}
          <div className="mt-3.5 rounded-xl overflow-hidden border border-[#2F3B27]/15 relative h-32">
            <div ref={mapContainerRef} className="w-full h-full" />
            <a
              href={`https://maps.google.com/?q=${order.location.lat},${order.location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-xs text-[10px] font-bold text-[#2F4A33] px-2 py-1 rounded-md shadow-xs border border-[#2F4A33]/25 flex items-center gap-1 z-[1000] cursor-pointer hover:bg-white"
            >
              <span>فتح في خرائط جوجل</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="mt-2.5 text-[10px] text-[#2F3B27]/50 text-center">
            إحداثيات التوصيل المحددة: ({order.location.lat.toFixed(4)}, {order.location.lng.toFixed(4)})
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          RETURN NAVIGATION BUTTON
          ═══════════════════════════════════════════════════════════════ */}
      <div className="order-return-nav text-center pt-2 pb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 hover:bg-white active:scale-95 text-[#2F3B27] font-bold text-xs md:text-sm transition border border-[#2F3B27]/15 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#2F4A33]/30"
        >
          <span>العودة إلى الصفحة الرئيسية</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
