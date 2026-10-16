"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Check, Home } from "lucide-react"
import type { Order } from "@/lib/db/types"

interface ReceiptPrinterProps {
  order: Order
  onAnimationComplete?: () => void
}

type AnimationPhase = "entering" | "processing" | "printing" | "complete"

const formatArabicNumber = (
  val: number,
  options?: Intl.NumberFormatOptions
): string => {
  return new Intl.NumberFormat("ar-EG", options).format(val)
}

const formatItemsCount = (count: number): string => {
  if (count === 1) return "صنف واحد"
  if (count === 2) return "صنفان"
  if (count >= 3 && count <= 10) return `${formatArabicNumber(count)} أصناف`
  return `${formatArabicNumber(count)} صنفاً`
}

/**
 * Deterministic vector barcode SVG generator based on order number.
 * Scalable, lightweight, aria-hidden.
 */
function DeterministicBarcode({ code }: { code: string }) {
  const bars = useMemo(() => {
    let hash = 0
    const str = String(code || "NF-0000")
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i)
      hash |= 0
    }
    let seed = Math.abs(hash) || 54321
    const lcg = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }

    const pattern: { width: number; space: number }[] = []
    // Start Guard Bars
    pattern.push({ width: 2.2, space: 1.5 })
    pattern.push({ width: 1.2, space: 2.2 })

    // Data bars (~26 bars)
    for (let i = 0; i < 26; i++) {
      const r1 = lcg()
      const r2 = lcg()
      const width = r1 > 0.65 ? 2.8 : r1 > 0.3 ? 1.6 : 1.0
      const space = r2 > 0.6 ? 2.4 : r2 > 0.25 ? 1.5 : 1.0
      pattern.push({ width, space })
    }

    // End Guard Bars
    pattern.push({ width: 1.4, space: 1.8 })
    pattern.push({ width: 2.2, space: 1.5 })

    return pattern
  }, [code])

  let currentX = 6
  return (
    <div className="flex flex-col items-center justify-center my-2.5" aria-hidden="true">
      <svg
        viewBox="0 0 210 38"
        className="w-full max-w-[200px] h-8 mx-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        {bars.map((bar, idx) => {
          const x = currentX
          currentX += bar.width + bar.space
          return (
            <rect
              key={idx}
              x={x}
              y="0"
              width={bar.width}
              height="38"
              fill="#2F3B27"
              rx="0.3"
            />
          )
        })}
      </svg>
      <span
        className="text-[11px] receipt-font-mono tracking-widest text-[#2F3B27]/85 mt-1 font-semibold"
        style={{ direction: "ltr" }}
      >
        *{code}*
      </span>
    </div>
  )
}

export default function ReceiptPrinter({
  order,
  onAnimationComplete,
}: ReceiptPrinterProps) {
  const storageKey = `nf_seen_receipt_${order.id || order.order_number}`

  // Check if animation should be skipped (seen before or prefers-reduced-motion)
  const initialSkip = useRef<boolean>(false)
  if (typeof window !== "undefined" && !initialSkip.current) {
    try {
      const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      const seen = window.sessionStorage.getItem(storageKey) === "true"
      initialSkip.current = isReduced || seen
    } catch {
      // Safe fallback if sessionStorage is inaccessible
    }
  }

  const [phase, setPhase] = useState<AnimationPhase>(() =>
    initialSkip.current ? "complete" : "entering"
  )
  const [displayTotal, setDisplayTotal] = useState<number>(() =>
    initialSkip.current ? order.total_price : 0
  )

  // Notify parent if initialized as complete
  useEffect(() => {
    if (initialSkip.current && onAnimationComplete) {
      onAnimationComplete()
    }
  }, [onAnimationComplete])

  // Sequence orchestrator with React StrictMode resilience
  useEffect(() => {
    if (initialSkip.current) return

    let isMounted = true
    let countRafId: number | null = null
    const timers: NodeJS.Timeout[] = []

    // 1. Enter (0 - 0.7s)
    timers.push(
      setTimeout(() => {
        if (!isMounted) return
        setPhase("processing")

        // 2. Count up total during processing (0.7s - 2.0s: ~1.2s duration)
        const startTime = performance.now()
        const duration = 1200
        const startVal = 0
        const endVal = order.total_price

        const step = (now: number) => {
          if (!isMounted) return
          const elapsed = now - startTime
          const progress = Math.min(1, elapsed / duration)
          // Cubic ease-out curve
          const easeOut = 1 - Math.pow(1 - progress, 3)
          const current = Math.round(startVal + easeOut * (endVal - startVal))
          setDisplayTotal(current)

          if (progress < 1) {
            countRafId = requestAnimationFrame(step)
          } else {
            setDisplayTotal(endVal)
          }
        }
        countRafId = requestAnimationFrame(step)
      }, 700)
    )

    // 3. Print feed begins (2.0s - 4.2s: 2.2s duration)
    timers.push(
      setTimeout(() => {
        if (!isMounted) return
        setPhase("printing")
      }, 2000)
    )

    // 4. Print finishes, complete state (4.2s)
    timers.push(
      setTimeout(() => {
        if (!isMounted) return
        setPhase("complete")
        setDisplayTotal(order.total_price)
        try {
          window.sessionStorage.setItem(storageKey, "true")
        } catch {
          // ignore storage error
        }
        if (onAnimationComplete) {
          onAnimationComplete()
        }
      }, 4200)
    )

    return () => {
      isMounted = false
      timers.forEach((t) => clearTimeout(t))
      if (countRafId !== null) {
        cancelAnimationFrame(countRafId)
      }
    }
  }, [order.total_price, storageKey, onAnimationComplete])

  // Formatted date string in ar-EG
  const formattedDateTime = useMemo(() => {
    const d = new Date(order.created_at || Date.now())
    try {
      return new Intl.DateTimeFormat("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(d)
    } catch {
      return d.toLocaleDateString("ar-EG")
    }
  }, [order.created_at])

  // Address line representation
  const addressLine = useMemo(() => {
    const details = order.address_details || {}
    const parts = [
      details.building ? `عمارة ${details.building}` : "",
      details.floor ? `الدور ${details.floor}` : "",
      details.apartment ? `شقة ${details.apartment}` : "",
      details.landmark ? `(${details.landmark})` : "",
    ].filter(Boolean)
    return parts.join("، ") || "العنوان مسجل ومحدد على الخريطة"
  }, [order.address_details])

  // Status message and icon depending on phase
  const statusContent = useMemo(() => {
    if (phase === "complete") {
      return {
        text: "تم استلام طلبك",
        icon: (
          <span className="w-4 h-4 rounded-full bg-[#34D399] text-[#1F281B] inline-flex items-center justify-center check-pop-icon flex-shrink-0">
            <Check size={11} strokeWidth={3} />
          </span>
        ),
      }
    }

    if (phase === "printing") {
      return {
        text: "جاري طباعة الإيصال…",
        icon: (
          <span className="w-2.5 h-2.5 rounded-full bg-[#D9788C] animate-ping flex-shrink-0" />
        ),
      }
    }

    // entering or processing
    return {
      text: "جاري تجهيز طلبك…",
      icon: (
        <svg
          className="w-3.5 h-3.5 receipt-spinner text-[#F7F0E3]/80 flex-shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.75"
        >
          <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
          <path d="M12 3a9 9 0 0 1 9 9" strokeLinecap="round" />
        </svg>
      ),
    }
  }, [phase])

  // Mechanical feed translation percentage:
  // Hidden up inside printer during "entering" & "processing", feeds down to 0% in "printing" & "complete"
  const isPaperFed = phase === "printing" || phase === "complete"
  const paperTranslate = isPaperFed ? "translateY(0%)" : "translateY(-100%)"

  return (
    <div className="receipt-printer-wrapper max-w-[420px] w-[min(92vw,420px)] mx-auto flex flex-col items-center">
      {/* ═══════════════════════════════════════════════════════════════
          1. PRINTER BODY (Deep Forest Green, Metallic Rim, Inner Screen)
          ═══════════════════════════════════════════════════════════════ */}
      <div
        className={`printer-body w-full rounded-[26px] z-20 relative text-[#F7F0E3] ${
          phase === "entering" ? "printer-entering" : ""
        } ${phase === "printing" ? "printer-vibrating" : ""}`}
        style={{
          background: "linear-gradient(180deg, #2F3B27 0%, #2F4A33 100%)",
          boxShadow:
            "0 18px 36px -8px rgba(31, 40, 27, 0.45), 0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.22)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          willChange: phase === "printing" ? "transform" : "auto",
        }}
      >
        <div className="p-4 md:p-5">
          {/* Top Bar: Brand Logo & Title on Right, Home Button on Left */}
          <div className="flex items-center justify-between gap-3 mb-3.5 pb-2.5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full overflow-hidden bg-white/15 p-0.5 border border-white/20 flex-shrink-0 flex items-center justify-center">
                <Image
                  src="/brand/logo.png"
                  alt="نور فارم"
                  width={26}
                  height={26}
                  className="rounded-full object-cover"
                />
              </div>
              <span className="receipt-font-display text-xs md:text-sm font-bold tracking-tight text-[#F7F0E3]">
                نور فارم
              </span>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7F0E3]/15 hover:bg-[#F7F0E3]/25 active:scale-95 text-[#F7F0E3] text-xs font-semibold transition border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#F7F0E3]/40"
              title="العودة للصفحة الرئيسية"
            >
              <Home size={12} />
              <span>الرئيسية</span>
            </Link>
          </div>

          {/* Inner Dark Screen */}
          <div
            className="rounded-2xl p-3.5 md:p-4 relative overflow-hidden"
            style={{
              background: "#1F281B",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "inset 0 2px 6px rgba(0, 0, 0, 0.55)",
            }}
          >
            {/* Screen Header Row: Title/Count on Right, Total on Left */}
            <div className="flex items-center justify-between gap-3">
              <div className="text-right">
                <span className="receipt-font-display block text-base md:text-lg font-bold text-[#F7F0E3] leading-tight">
                  طلبك
                </span>
                <span className="text-xs text-[#F7F0E3]/75 font-medium mt-0.5 block">
                  {formatItemsCount(order.items.length)}
                </span>
              </div>

              <div className="text-left" dir="ltr">
                <span className="receipt-font-display block text-lg md:text-xl font-extrabold text-[#F7F0E3] tracking-tight">
                  {formatArabicNumber(displayTotal, { maximumFractionDigits: 1 })}{" "}
                  <span className="text-xs font-bold text-[#F7F0E3]/80">ج.م</span>
                </span>
              </div>
            </div>

            {/* Screen Status Line with aria-live */}
            <div
              className="mt-3 pt-2.5 border-t border-white/10 flex items-center gap-2 text-xs text-[#F7F0E3]/90 font-medium"
              aria-live="polite"
              aria-atomic="true"
            >
              {statusContent.icon}
              <span className="receipt-font-body text-xs tracking-wide">
                {statusContent.text}
              </span>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            PRINTER SLOT BAR (Mechanical Paper Output Lip)
            ═══════════════════════════════════════════════════════════════ */}
        <div
          className="printer-slot-bar w-full h-4 relative flex items-center justify-center rounded-b-[24px]"
          style={{
            background: "linear-gradient(180deg, #1A2317 0%, #121810 100%)",
            borderTop: "1px solid rgba(0, 0, 0, 0.5)",
            boxShadow: "inset 0 3px 6px rgba(0, 0, 0, 0.7)",
          }}
        >
          {/* Inner dark slit where paper exits */}
          <div
            className="w-[88%] h-1 rounded-full"
            style={{
              background: "#080c07",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.9), 0 1px 0 rgba(255,255,255,0.06)",
            }}
          />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          2. RECEIPT PAPER VIEWPORT (Downwards Slide Behind Slot Mask)
          ═══════════════════════════════════════════════════════════════ */}
      <div className="receipt-paper-viewport w-[88%] relative overflow-hidden -mt-2 z-10">
        <div
          className="receipt-paper w-full bg-[#FBF6EA] text-[#2F3B27] p-5 md:p-6 receipt-zigzag-mask relative"
          style={{
            boxShadow:
              "0 12px 28px -6px rgba(47, 59, 39, 0.22), 0 4px 10px rgba(0, 0, 0, 0.08)",
            transform: paperTranslate,
            transition:
              phase === "printing"
                ? "transform 2.2s cubic-bezier(0.22, 1, 0.36, 1)"
                : phase === "complete"
                ? "none"
                : "none",
            willChange: phase === "printing" ? "transform" : "auto",
            paddingBottom: "1.75rem",
          }}
        >
          {/* Real Brand Logo at top of receipt */}
          <div className="text-center pb-2">
            <div className="w-10 h-10 mx-auto rounded-full overflow-hidden p-0.5 border border-[#2F3B27]/15 bg-white/70 shadow-xs mb-1.5 flex items-center justify-center">
              <Image
                src="/brand/logo.png"
                alt="شعار نور فارم"
                width={36}
                height={36}
                className="rounded-full object-cover"
              />
            </div>
            <h2 className="receipt-font-display text-sm font-extrabold text-[#2F3B27] tracking-tight m-0">
              نور فارم | NOOR FARM
            </h2>
            <p className="text-[11px] text-[#2F3B27]/75 font-medium m-0 mt-0.5">
              خضار وفاكهة طازجة منتقاة بالواحدة
            </p>
          </div>

          {/* Dashed Separator */}
          <div className="border-b-2 border-dashed border-[#2F3B27]/25 my-3" />

          {/* Header: Date/Time + Order Number */}
          <div className="text-xs space-y-1">
            <div className="flex items-center justify-between font-bold text-[#2F3B27]">
              <span className="receipt-font-display">إيصال استلام طلب</span>
              <span
                className="receipt-font-mono text-xs font-semibold px-2 py-0.5 rounded-sm bg-[#2F3B27]/10 tracking-wider"
                style={{ direction: "ltr" }}
              >
                #{order.order_number}
              </span>
            </div>
            <div className="text-[11px] text-[#2F3B27]/70 font-medium">
              التاريخ: {formattedDateTime}
            </div>
          </div>

          {/* Dashed Separator */}
          <div className="border-b-2 border-dashed border-[#2F3B27]/25 my-3" />

          {/* Item Lines: Monospace only for numbers/units, IBM Plex Sans Arabic for Arabic text */}
          <div className="space-y-2.5">
            {order.items.map((it, idx) => {
              const itemName = (it as any).name_ar || (it as any).name || "صنف طازج"
              const unit = it.unit || "كجم"

              return (
                <div key={idx} className="text-xs flex items-start justify-between gap-2">
                  <div className="flex-1 text-right">
                    <span className="receipt-font-body font-bold text-[#2F3B27] block leading-snug">
                      {itemName}
                    </span>
                    <span className="text-[11px] text-[#2F3B27]/70 font-medium block mt-0.5">
                      {formatArabicNumber(it.qty, { maximumFractionDigits: 1 })} {unit} ×{" "}
                      {formatArabicNumber(it.unit_price)} ج.م
                    </span>
                  </div>

                  <div className="text-left font-bold text-[#2F3B27] flex-shrink-0 pt-0.5">
                    <span>{formatArabicNumber(it.line_total)} ج.م</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Dashed Separator */}
          <div className="border-b-2 border-dashed border-[#2F3B27]/25 my-3" />

          {/* Large Total Row */}
          <div className="flex items-center justify-between py-1">
            <span className="receipt-font-display text-base md:text-lg font-extrabold text-[#2F3B27]">
              الإجمالي
            </span>
            <span className="receipt-font-display text-lg md:text-xl font-extrabold text-[#2F4A33] tracking-tight">
              {formatArabicNumber(order.total_price)}{" "}
              <span className="text-xs font-bold text-[#2F3B27]/80">ج.م</span>
            </span>
          </div>

          {/* Dashed Separator */}
          <div className="border-b-2 border-dashed border-[#2F3B27]/25 my-3" />

          {/* Meta Rows: Customer name, phone, address, location saved */}
          <div className="space-y-1.5 text-[11px] text-[#2F3B27]/85 font-medium">
            <div className="flex items-center justify-between">
              <span className="text-[#2F3B27]/60">العميل:</span>
              <span className="font-bold text-[#2F3B27]">{order.customer_name}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#2F3B27]/60">الهاتف:</span>
              <span className="receipt-font-mono font-bold text-[#2F3B27]" dir="ltr">
                {order.customer_phone}
              </span>
            </div>

            <div className="flex items-start justify-between gap-2">
              <span className="text-[#2F3B27]/60 flex-shrink-0">العنوان:</span>
              <span className="font-semibold text-right leading-tight text-[#2F3B27]">
                {addressLine}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[#2F3B27]/60">حالة الإحداثيات:</span>
              <span className="text-[#15803D] font-bold inline-flex items-center gap-1">
                <span>تم حفظ الموقع بنجاح</span>
                <span>✓</span>
              </span>
            </div>
          </div>

          {/* Dashed Separator */}
          <div className="border-b-2 border-dashed border-[#2F3B27]/25 my-3" />

          {/* Deterministic SVG Barcode */}
          <DeterministicBarcode code={order.order_number} />

          {/* Handwritten Accent Signature */}
          <div className="text-center pt-2">
            <span
              className="receipt-font-accent text-lg md:text-xl block tracking-wide"
              style={{ color: "#D9788C" }}
            >
              شكراً من نور فارم
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
