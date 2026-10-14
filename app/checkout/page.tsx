"use client"

// Hydrate cart store from localStorage

// Customer Contact State

// Location & Address State

// Payment Method State

// Form Validation & Submission State

// 1. Contact validation

// 2. Location validation

// 3. Payment validation

// Clear cart items if actual items were present
/* Luxury Checkout Navbar */ /* Main Container */ /* SUCCESS CONFIRMATION SCREEN */
/* UNIFIED ONE-PAGE CHECKOUT LAYOUT */ /* RIGHT COLUMN: The 3 Main Checkout Sections */ /* ═════════════════════════════════════════════════════════
                    SECTION 1: CUSTOMER CONTACT DETAILS
                    ═════════════════════════════════════════════════════════ */ /* ═════════════════════════════════════════════════════════
                    SECTION 2: DELIVERY LOCATION MAP & BUILDING DETAILS
                    ═════════════════════════════════════════════════════════ */ /* Embedded Google Maps Location Picker Component */ /* Specific Building, Floor & Landmark Inputs */ /* ═════════════════════════════════════════════════════════
                    SECTION 3: PAYMENT METHOD SELECTION
                    ═════════════════════════════════════════════════════════ */ /* Method 1: Cash on Delivery */ /* Method 2: Credit Card */ /* Method 3: Mobile Wallet / InstaPay */ /* Payment Specific Sub-Panels */ /* LEFT COLUMN: Sticky Order Summary & CTA */ /* List of items */ /* Calculation rows */ /* Main Submit Button */ /* 100% Freshness Guarantee */

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft,
  Banknote,
  Building,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  ExternalLink,
  Flame,
  Lock,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Truck,
  User,
} from "lucide-react"
import BrandMark from "@/components/BrandMark"
import LocationPicker, {
  type LocationData,
} from "@/components/checkout/LocationPicker"
import { useCart } from "@/store/cart"
import { products, type Product } from "@/data/products"

const number = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 1 })

const WHATSAPP_DISPLAY = "01102740002"
const WHATSAPP_INTL = "201102740002"

function WhatsAppIcon({ size = 22, color = "#25D366" }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="none"
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}
      aria-hidden="true"
    >
      <path
        fill={color === "#ffffff" ? "#ffffff" : "#25D366"}
        d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.04 14.69 2 12.04 2ZM12.04 20.16C10.56 20.16 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.8 7.37 7.5 3.67 12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.16 12.04 20.16ZM16.56 14.41C16.31 14.29 15.1 13.69 14.88 13.61C14.65 13.53 14.49 13.49 14.32 13.73C14.16 13.98 13.68 14.54 13.54 14.71C13.39 14.87 13.25 14.89 13 14.77C12.75 14.65 11.96 14.39 11.02 13.55C10.29 12.9 9.8 12.09 9.65 11.84C9.51 11.59 9.64 11.46 9.76 11.34C9.87 11.23 10.01 11.05 10.13 10.91C10.26 10.77 10.3 10.67 10.38 10.5C10.46 10.34 10.42 10.2 10.36 10.08C10.3 9.95 9.82 8.77 9.62 8.28C9.42 7.81 9.22 7.87 9.07 7.86C8.93 7.85 8.76 7.85 8.6 7.85C8.44 7.85 8.17 7.91 7.95 8.15C7.72 8.4 7.09 8.99 7.09 10.19C7.09 11.39 7.97 12.55 8.09 12.71C8.21 12.87 9.81 15.34 12.27 16.4C12.85 16.65 13.31 16.8 13.66 16.92C14.25 17.1 14.78 17.08 15.21 17.01C15.68 16.94 16.67 16.41 16.88 15.83C17.08 15.26 17.08 14.77 17.02 14.66C16.96 14.56 16.81 14.52 16.56 14.41Z"
      />
    </svg>
  )
}

type PaymentMethod = "cod" | "card" | "wallet"

export default function CheckoutPage() {
  const items = useCart((state) => state.items)
  const change = useCart((state) => state.change)

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    void useCart.persist.rehydrate()
    setMounted(true)
  }, [])

  const actualSelected = products.filter((p) => items[p.id])
  const isDemoCart =
    mounted &&
    actualSelected.length ===
      0
  const selectedProducts =
    actualSelected.length >
    0
      ? actualSelected
      : products.slice(0, 2)
  const subtotal = selectedProducts.reduce(
    (sum, p) =>
      sum +
      p.price *
        (items[p.id] ||
          1),
    0,
  )
  const deliveryFee =
    subtotal >
    150
      ? 0
      : 25
  const total =
    subtotal +
    deliveryFee
  const [customerInfo, setCustomerInfo] = useState({
    fullName: "",
    phone: "",
    secondaryPhone: "",
    notes: "",
  })
  const [locationData, setLocationData] = useState<LocationData | null>({
    lat: 30.0444,
    lng: 31.2357,
    address: "القاهرة، مصر",
  })

  const [buildingDetails, setBuildingDetails] = useState({
    building: "",
    floor: "",
    apartment: "",
    landmark: "",
  })
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod")
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvv: "",
  })
  const [walletPhone, setWalletPhone] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [orderNumber, setOrderNumber] = useState("")
  const [whatsappMessage, setWhatsappMessage] = useState("")
  const [whatsappUrl, setWhatsappUrl] = useState("")
  const [copied, setCopied] = useState(false)

  const validateForm = () => {
    const errs: Record<string, string> = {}
    if (!customerInfo.fullName.trim()) {
      errs.fullName = "يرجى كتابة الاسم بالكامل"
    }
    if (
      !customerInfo.phone.trim() ||
      customerInfo.phone.trim().length < 10
    ) {
      errs.phone = "يرجى كتابة رقم هاتف صحيح (مثال: 01012345678)"
    }
    if (!locationData || !locationData.address.trim()) {
      errs.location = "يرجى تحديد موقع التوصيل على الخريطة"
    }
    if (!buildingDetails.building.trim()) {
      errs.building = "يرجى كتابة رقم المبنى أو العمارة (ضروري للتوصيل لباب بيتك)"
    }
    if (!buildingDetails.apartment.trim()) {
      errs.apartment = "يرجى كتابة رقم الشقة (لتسليم الطلب عند باب بيتك)"
    }
    if (paymentMethod === "card") {
      const cleanNum = cardData.number.replace(/\s/g, "")
      if (!cleanNum || cleanNum.length < 16) {
        errs.cardNumber = "أدخل رقم بطاقة صحيح (١٦ رقم)"
      }
      if (!cardData.expiry.trim()) {
        errs.cardExpiry = "تاريخ الانتهاء مطلوب"
      }
      if (!cardData.cvv.trim() || cardData.cvv.length < 3) {
        errs.cardCvv = "رمز CVV مطلوب"
      }
    } else if (paymentMethod === "wallet") {
      if (!walletPhone.trim() || walletPhone.trim().length < 10) {
        errs.walletPhone =
          "يرجى إدخال رقم المحفظة / إنستاباي الذي قمت بالتحويل منه"
      }
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      window.scrollTo({ top: 120, behavior: "smooth" })
      return
    }

    setIsSubmitting(true)

    const generatedOrderNum = `NF-${Math.floor(10000 + Math.random() * 90000)}`
    setOrderNumber(generatedOrderNum)

    const now = new Date()
    const formattedDate = `${now.toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })} - ${now.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}`

    const itemsText = selectedProducts
      .map((p, idx) => {
        const qty = items[p.id] || 1
        const lineTotal = p.price * qty
        return `${idx + 1}. *${p.name}*\n   ▫️ الكمية: ${qty} ${p.unit}\n   ▫️ السعر: ${p.price} ج.م (الإجمالي: ${lineTotal} ج.م)`
      })
      .join("\n\n")

    const mapsUrl = locationData
      ? `https://maps.google.com/?q=${locationData.lat.toFixed(6)},${locationData.lng.toFixed(6)}`
      : "لم يُحدد"

    let paymentLabel = "الدفع نقداً عند الاستلام"
    if (paymentMethod === "card") paymentLabel = "بطاقة بنكية (فيزا / ماستركارد)"
    if (paymentMethod === "wallet") paymentLabel = `إنستاباي / محفظة إلكترونية (المحول منه: ${walletPhone || "تحويل فوري"})`

    const msg = `🌿 *طلب جديد من متجر نور فارم (NOOR FARM)* 🌿
━━━━━━━━━━━━━━━━━━━━
📦 *رقم الطلب:* #${generatedOrderNum}
🕒 *توقيت الطلب:* ${formattedDate}

👤 *بيانات العميل:*
• *الاسم:* ${customerInfo.fullName}
• *الهاتف الأساسي:* ${customerInfo.phone}
${customerInfo.secondaryPhone ? `• *هاتف بديل:* ${customerInfo.secondaryPhone}\n` : ""}
🚪 *تفاصيل العنوان لباب البيت:*
• *المنطقة / العنوان:* ${locationData?.address || "محدد على الخريطة"}
• *رقم العمارة:* ${buildingDetails.building}
• *الدور:* ${buildingDetails.floor || "غير محدد"}
• *رقم الشقة:* ${buildingDetails.apartment}
${buildingDetails.landmark ? `• *علامة مميزة:* ${buildingDetails.landmark}\n` : ""}
🗺️ *رابط اللوكيشن GPS للمندوب:*
${mapsUrl}

🛒 *أصناف الطلب:*
${itemsText}

━━━━━━━━━━━━━━━━━━━━
💰 *الحساب والإجمالي:*
• *مجموع المنتجات:* ${subtotal} ج.م
• *مصاريف التوصيل:* ${deliveryFee === 0 ? "مجاناً (عرض الطلبات فوق ١٥٠ ج.م)" : `${deliveryFee} ج.م`}
• *الإجمالي المطلوب:* *${total} ج.م*

💳 *طريقة الدفع:* ${paymentLabel}
${customerInfo.notes ? `\n📝 *ملاحظات التوصيل:* ${customerInfo.notes}\n` : ""}
━━━━━━━━━━━━━━━━━━━━
✨ *أرجو تأكيد استلام الطلب وبدء التجهيز، شكراً لكم!* ✨`

    setWhatsappMessage(msg)
    const targetUrl = `https://wa.me/${WHATSAPP_INTL}?text=${encodeURIComponent(msg)}`
    setWhatsappUrl(targetUrl)

    await new Promise((resolve) => setTimeout(resolve, 800))

    // Open WhatsApp in new tab / app
    try {
      window.open(targetUrl, "_blank", "noopener,noreferrer")
    } catch {
      // Handled via backup button on confirmation screen
    }

    actualSelected.forEach((p) => {
      change(p, -9999)
    })

    setIsSubmitting(false)
    setIsSubmitted(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <main className="checkout-page">
      {}
      <header className="checkout-navbar">
        <div className="checkout-navbar-inner">
          <Link href="/" aria-label="نور فارم - الصفحة الرئيسية">
            <BrandMark />
          </Link>

          <div className="checkout-secure-badge">
            <ShieldCheck
              style={{ width: "1rem", height: "1rem", color: "#2e7d32" }}
            />
            <span>إتمام الطلب بأمان وسرية تامة</span>
          </div>

          <Link href="/" className="checkout-back-link">
            <span>العودة للتسوق</span>
            <ArrowLeft style={{ width: "1rem", height: "1rem" }} />
          </Link>
        </div>
      </header>

      {}
      <div className="checkout-main-container">
        {}
        {isSubmitted ? (
          <div className="checkout-success-wrapper">
            <div className="success-check-circle">
              <CheckCircle2 style={{ width: "2.8rem", height: "2.8rem" }} />
            </div>

            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "var(--tomato)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              تم استلام طلبك بنجاح!
            </span>

            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "2.2rem",
                fontWeight: 700,
                margin: "0.5rem 0 1rem",
              }}
            >
              شكراً لاختيارك نور فارم
            </h1>

            <p
              style={{
                fontSize: "0.95rem",
                color: "var(--ink)",
                opacity: 0.85,
                lineHeight: 1.6,
              }}
            >
              تم تجهيز طلبك رقم{" "}
              <strong style={{ color: "var(--tomato)", direction: "ltr" }}>
                {orderNumber}
              </strong>{" "}
              بنجاح! سيتم إرساله وتأكيده مع إدارة نور فارم عبر واتساب على الرقم{" "}
              <strong dir="ltr" style={{ color: "#128C7E", fontWeight: 700 }}>
                {WHATSAPP_DISPLAY}
              </strong>
            </p>

            {whatsappUrl && (
              <div className="whatsapp-success-actions">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-direct-send-btn"
                >
                  <WhatsAppIcon size={24} color="#ffffff" />
                  <span>فتح المحادثة على واتساب الآن ({WHATSAPP_DISPLAY})</span>
                  <ExternalLink size={18} />
                </a>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(whatsappMessage)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2500)
                  }}
                  className="whatsapp-copy-btn"
                >
                  {copied ? (
                    <>
                      <Check size={18} style={{ color: "#2e7d32" }} />
                      <span style={{ color: "#2e7d32" }}>تم نسخ نص الرسالة بالكامل!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={18} />
                      <span>نسخ تفاصيل الطلب بالكامل</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {whatsappMessage && (
              <details style={{ textAlign: "right", margin: "1rem 0" }}>
                <summary style={{ fontSize: "0.85rem", cursor: "pointer", color: "var(--forest)", fontWeight: 700 }}>
                  معاينة نص رسالة الواتساب المرسلة للطلب 📄
                </summary>
                <div className="whatsapp-preview-box">
                  {whatsappMessage}
                </div>
              </details>
            )}

            <div className="success-receipt-card">
              <div className="receipt-row">
                <span style={{ opacity: 0.7 }}>رقم الطلب:</span>
                <strong
                  style={{ fontFamily: "monospace", fontSize: "1.05rem" }}
                >
                  {orderNumber}
                </strong>
              </div>

              <div className="receipt-row">
                <span style={{ opacity: 0.7 }}>اسم المستلم:</span>
                <strong>
                  {customerInfo.fullName} ({customerInfo.phone})
                </strong>
              </div>

              <div className="receipt-row">
                <span style={{ opacity: 0.7 }}>عنوان وموقع التوصيل:</span>
                <span
                  style={{
                    fontWeight: 600,
                    maxWidth: "340px",
                    textAlign: "left",
                  }}
                >
                  {locationData?.address || "الموقع المحدد على الخريطة"}
                  {buildingDetails.building &&
                    ` — عمارة ${buildingDetails.building}`}
                  {buildingDetails.floor && `، دور ${buildingDetails.floor}`}
                  {buildingDetails.apartment &&
                    `، شقة ${buildingDetails.apartment}`}
                </span>
              </div>

              <div className="receipt-row">
                <span style={{ opacity: 0.7 }}>طريقة الدفع:</span>
                <strong>
                  {paymentMethod === "cod" && "الدفع نقداً عند الاستلام"}
                  {paymentMethod === "card" && "البطاقة الائتمانية / فيزا"}
                  {paymentMethod === "wallet" &&
                    `إنستاباي / محفظة (${walletPhone})`}
                </strong>
              </div>

              <div
                className="receipt-row"
                style={{
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  color: "var(--tomato)",
                }}
              >
                <span>المبلغ الإجمالي المستحق:</span>
                <span>{number.format(total)} ج.م</span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link
                href="/"
                style={{
                  padding: "0.95rem 2rem",
                  borderRadius: "0.75rem",
                  background: "var(--ink)",
                  color: "var(--cream)",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                }}
              >
                العودة للصفحة الرئيسية
              </Link>
              <Link
                href="/products"
                style={{
                  padding: "0.95rem 2rem",
                  borderRadius: "0.75rem",
                  background: "var(--white)",
                  border: "1.5px solid var(--line)",
                  color: "var(--ink)",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                }}
              >
                تسوّق المزيد من المنتجات
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="checkout-hero-title">
              <h1>إتمام الطلب وتحديد موقع التوصيل</h1>
              <p>
                خطوات بسيطة وسريعة ليصلك خضار اليوم طازة، مغسول ومتقطّع لباب
                بيتك.
              </p>
            </div>

            <form onSubmit={handlePlaceOrder} className="checkout-two-columns">
              {}
              <div>
                {}
                <div className="checkout-section-card">
                  <div className="checkout-section-header">
                    <span className="checkout-step-badge">١</span>
                    <div>
                      <h2>بيانات المستلم والتواصل</h2>
                      <p>
                        سنتواصل معك عبر هذا الرقم للتأكيد وإشعارك لحظة انطلاق
                        المندوب.
                      </p>
                    </div>
                  </div>

                  <div className="checkout-form-grid">
                    <div className="checkout-form-field checkout-form-full">
                      <label>
                        الاسم بالكامل{" "}
                        <span style={{ color: "var(--tomato)" }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={customerInfo.fullName}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            fullName: e.target.value,
                          })
                        }
                        placeholder="مثال: محمد عبد الرحمن"
                      />
                      {errors.fullName && (
                        <span className="checkout-field-error">
                          {errors.fullName}
                        </span>
                      )}
                    </div>

                    <div className="checkout-form-field">
                      <label>
                        رقم الهاتف الأساسي (واتساب){" "}
                        <span style={{ color: "var(--tomato)" }}>*</span>
                      </label>
                      <input
                        type="tel"
                        dir="ltr"
                        value={customerInfo.phone}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            phone: e.target.value,
                          })
                        }
                        placeholder="010XXXXXXXX"
                        style={{ textAlign: "right" }}
                      />
                      {errors.phone && (
                        <span className="checkout-field-error">
                          {errors.phone}
                        </span>
                      )}
                    </div>

                    <div className="checkout-form-field">
                      <label>رقم هاتف بديل (اختياري)</label>
                      <input
                        type="tel"
                        dir="ltr"
                        value={customerInfo.secondaryPhone}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            secondaryPhone: e.target.value,
                          })
                        }
                        placeholder="011XXXXXXXX"
                        style={{ textAlign: "right" }}
                      />
                    </div>

                    <div className="checkout-form-field checkout-form-full">
                      <label>ملاحظات التوصيل أو توقيت الاستلام (اختياري)</label>
                      <textarea
                        rows={2}
                        value={customerInfo.notes}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            notes: e.target.value,
                          })
                        }
                        placeholder="مثال: يرجى الاتصال قبل الوصول بـ ١٥ دقيقة، أو ترك الطلب عند الأمن..."
                      />
                    </div>
                  </div>
                </div>

                {}
                <div className="checkout-section-card">
                  <div className="checkout-section-header">
                    <span className="checkout-step-badge">٢</span>
                    <div>
                      <h2>موقع التوصيل على الخريطة</h2>
                      <p>
                        اسحب المؤشر أو اضغط على الخريطة لتحديد مكانك بدقة لضمان
                        سرعة الوصول.
                      </p>
                    </div>
                  </div>

                  {}
                  <div style={{ marginBottom: "1.5rem" }}>
                    <LocationPicker
                      height="380px"
                      onLocationSelect={(loc) => {
                        setLocationData(loc)
                        if (errors.location) {
                          setErrors((prev) => ({ ...prev, location: "" }))
                        }
                      }}
                    />
                    {errors.location && (
                      <span
                        className="checkout-field-error"
                        style={{ display: "block", marginTop: "0.5rem" }}
                      >
                        {errors.location}
                      </span>
                    )}
                  </div>

                  {}
                  <div
                    style={{
                      borderTop: "1px solid var(--line)",
                      paddingTop: "1.5rem",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        color: "var(--ink)",
                        marginBottom: "1rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <Building
                        style={{
                          width: "1.1rem",
                          height: "1.1rem",
                          color: "var(--forest)",
                        }}
                      />
                      تفاصيل العقار والعنوان لباب البيت
                    </h3>

                    <div className="doorstep-delivery-notice">
                      <div style={{ fontSize: "1.5rem", lineHeight: 1 }}>🚪</div>
                      <div>
                        <div className="doorstep-badge-tag">خدمة التوصيل حتى باب الشقة</div>
                        <p style={{ margin: 0, fontWeight: 600, color: "var(--forest)" }}>
                          يرجى تسجيل رقم العمارة ورقم الشقة بدقة ليتمكن المندوب من الصعود حتى باب شقتك مباشرة.
                        </p>
                      </div>
                    </div>

                    <div className="checkout-form-grid">
                      <div className="checkout-form-field">
                        <label>
                          رقم العمارة / المبنى{" "}
                          <span style={{ color: "var(--tomato)" }}>*</span>
                        </label>
                        <input
                          type="text"
                          value={buildingDetails.building}
                          onChange={(e) => {
                            setBuildingDetails({
                              ...buildingDetails,
                              building: e.target.value,
                            })
                            if (errors.building) {
                              setErrors((prev) => ({ ...prev, building: "" }))
                            }
                          }}
                          placeholder="مثال: عمارة ١٥..."
                        />
                        {errors.building && (
                          <span className="checkout-field-error">
                            {errors.building}
                          </span>
                        )}
                      </div>

                      <div className="checkout-form-field">
                        <label>
                          رقم الشقة{" "}
                          <span style={{ color: "var(--tomato)" }}>*</span>
                        </label>
                        <input
                          type="text"
                          value={buildingDetails.apartment}
                          onChange={(e) => {
                            setBuildingDetails({
                              ...buildingDetails,
                              apartment: e.target.value,
                            })
                            if (errors.apartment) {
                              setErrors((prev) => ({ ...prev, apartment: "" }))
                            }
                          }}
                          placeholder="مثال: شقة ٤..."
                        />
                        {errors.apartment && (
                          <span className="checkout-field-error">
                            {errors.apartment}
                          </span>
                        )}
                      </div>

                      <div className="checkout-form-field">
                        <label>الدور / الطابق</label>
                        <input
                          type="text"
                          value={buildingDetails.floor}
                          onChange={(e) =>
                            setBuildingDetails({
                              ...buildingDetails,
                              floor: e.target.value,
                            })
                          }
                          placeholder="مثال: الدور الثالث..."
                        />
                      </div>

                      <div className="checkout-form-field">
                        <label>علامة مميزة بالقرب من المنزل (اختياري)</label>
                        <input
                          type="text"
                          value={buildingDetails.landmark}
                          onChange={(e) =>
                            setBuildingDetails({
                              ...buildingDetails,
                              landmark: e.target.value,
                            })
                          }
                          placeholder="بجوار سوبرماركت أو أمام مسجد..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {}
                <div className="checkout-section-card">
                  <div className="checkout-section-header">
                    <span className="checkout-step-badge">٣</span>
                    <div>
                      <h2>طريقة الدفع</h2>
                      <p>اختر الطريقة التي تفضلها لسداد قيمة الطلب.</p>
                    </div>
                  </div>

                  <div className="payment-methods-selector">
                    {}
                    <div
                      className={`payment-method-card ${
                        paymentMethod === "cod" ? "is-selected" : ""
                      }`}
                      onClick={() => setPaymentMethod("cod")}
                    >
                      <div className="payment-method-icon-wrap">
                        <Banknote
                          style={{ width: "1.4rem", height: "1.4rem" }}
                        />
                      </div>
                      <span className="payment-method-title">
                        الدفع عند الاستلام
                      </span>
                      <span className="payment-method-desc">
                        نقدًا للمندوب عند وصول الخضار وباب بيتك.
                      </span>
                    </div>

                    {}
                    <div
                      className={`payment-method-card ${
                        paymentMethod === "card" ? "is-selected" : ""
                      }`}
                      onClick={() => setPaymentMethod("card")}
                    >
                      <div className="payment-method-icon-wrap">
                        <CreditCard
                          style={{ width: "1.4rem", height: "1.4rem" }}
                        />
                      </div>
                      <span className="payment-method-title">
                        البطاقة البنكية
                      </span>
                      <span className="payment-method-desc">
                        فيزا / ماستركارد / ميزة ببيانات مشفرة.
                      </span>
                    </div>

                    {}
                    <div
                      className={`payment-method-card ${
                        paymentMethod === "wallet" ? "is-selected" : ""
                      }`}
                      onClick={() => setPaymentMethod("wallet")}
                    >
                      <div className="payment-method-icon-wrap">
                        <Smartphone
                          style={{ width: "1.4rem", height: "1.4rem" }}
                        />
                      </div>
                      <span className="payment-method-title">
                        إنستاباي / محفظة
                      </span>
                      <span className="payment-method-desc">
                        تحويل لحظي عبر فودافون كاش أو إنستاباي.
                      </span>
                    </div>
                  </div>

                  {}
                  {paymentMethod === "cod" && (
                    <div
                      className="payment-details-panel"
                      style={{
                        display: "flex",
                        gap: "0.85rem",
                        alignItems: "flex-start",
                      }}
                    >
                      <Truck
                        style={{
                          width: "1.4rem",
                          height: "1.4rem",
                          color: "var(--forest)",
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ fontSize: "0.85rem", lineHeight: 1.6 }}>
                        <strong
                          style={{
                            display: "block",
                            color: "var(--forest)",
                            marginBottom: "0.2rem",
                          }}
                        >
                          معاينة الخضار قبل الدفع:
                        </strong>
                        <span>
                          يحق لك فحص وتفتيش علب الخضار الطازج والتأكد من نظافتها
                          وجودتها ١٠٠٪ قبل تسليم المبلغ للمندوب.
                        </span>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "card" && (
                    <div
                      className="payment-details-panel"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                      }}
                    >
                      <div className="checkout-form-field">
                        <label>رقم البطاقة (١٦ رقم)</label>
                        <input
                          type="text"
                          dir="ltr"
                          maxLength={19}
                          value={cardData.number}
                          onChange={(e) => {
                            const val = e.target.value
                              .replace(/\D/g, "")
                              .replace(/(.{4})/g, "$1 ")
                              .trim()
                            setCardData({ ...cardData, number: val })
                          }}
                          placeholder="4000 1234 5678 9010"
                        />
                        {errors.cardNumber && (
                          <span className="checkout-field-error">
                            {errors.cardNumber}
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "1rem",
                        }}
                      >
                        <div className="checkout-form-field">
                          <label>تاريخ الانتهاء</label>
                          <input
                            type="text"
                            dir="ltr"
                            maxLength={5}
                            value={cardData.expiry}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, "")
                              if (val.length >= 2)
                                val = `${val.slice(0, 2)}/${val.slice(2, 4)}`
                              setCardData({ ...cardData, expiry: val })
                            }}
                            placeholder="MM/YY"
                          />
                          {errors.cardExpiry && (
                            <span className="checkout-field-error">
                              {errors.cardExpiry}
                            </span>
                          )}
                        </div>

                        <div className="checkout-form-field">
                          <label>رمز الأمان (CVV)</label>
                          <input
                            type="password"
                            dir="ltr"
                            maxLength={4}
                            value={cardData.cvv}
                            onChange={(e) =>
                              setCardData({
                                ...cardData,
                                cvv: e.target.value.replace(/\D/g, ""),
                              })
                            }
                            placeholder="123"
                          />
                          {errors.cardCvv && (
                            <span className="checkout-field-error">
                              {errors.cardCvv}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "wallet" && (
                    <div
                      className="payment-details-panel"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.85rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          borderBottom: "1px solid var(--line)",
                          paddingBottom: "0.65rem",
                        }}
                      >
                        <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                          رقم محفظة نور فارم / إنستاباي:
                        </span>
                        <span
                          style={{
                            fontFamily: "monospace",
                            direction: "ltr",
                            background: "#fff",
                            padding: "0.3rem 0.75rem",
                            borderRadius: "0.5rem",
                            border: "1px solid var(--line)",
                            fontWeight: 700,
                            fontSize: "0.95rem",
                          }}
                        >
                          01098765432
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: "0.82rem",
                          lineHeight: 1.6,
                          opacity: 0.85,
                        }}
                      >
                        قم بتحويل المبلغ الإجمالي ({number.format(total)} ج.م)
                        ثم اكتب رقم هاتفك المحوّل منه بالأسفل للتحقق الفوري من
                        إتمام العملية.
                      </p>
                      <div className="checkout-form-field">
                        <label>رقم هاتفك المحوّل منه:</label>
                        <input
                          type="tel"
                          dir="ltr"
                          value={walletPhone}
                          onChange={(e) => setWalletPhone(e.target.value)}
                          placeholder="010XXXXXXXX"
                          style={{ textAlign: "right" }}
                        />
                        {errors.walletPhone && (
                          <span className="checkout-field-error">
                            {errors.walletPhone}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {}
              <aside>
                <div className="checkout-summary-sidebar">
                  <div className="checkout-summary-header">
                    <h3>ملخص الطلب ({selectedProducts.length} أصناف)</h3>
                    <Link
                      href="/products"
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--tomato)",
                        fontWeight: 600,
                      }}
                    >
                      تعديل السلة
                    </Link>
                  </div>

                  {}
                  <div className="summary-items-scroll">
                    {selectedProducts.map((p) => {
                      const qty = items[p.id] || 1
                      return (
                        <div className="summary-item-row" key={p.id}>
                          <div className="summary-item-info">
                            <div className="summary-item-img">
                              <Image
                                src={p.image}
                                alt={p.name}
                                fill
                                sizes="64px"
                                style={{ objectFit: "cover" }}
                              />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div className="summary-item-name">{p.name}</div>
                              <div className="summary-item-meta">
                                {number.format(qty)} {p.unit} ×{" "}
                                {number.format(p.price)} ج.م
                              </div>
                            </div>
                          </div>
                          <span className="summary-item-price">
                            {number.format(p.price * qty)} ج.م
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {}
                  <div className="checkout-totals-block">
                    <div className="totals-row">
                      <span>مجموع المنتجات:</span>
                      <strong>{number.format(subtotal)} ج.م</strong>
                    </div>

                    <div className="totals-row">
                      <span>
                        رسوم التوصيل السريع:
                        {subtotal > 150 && (
                          <span
                            style={{
                              marginRight: "0.5rem",
                              background: "#e8f5e9",
                              color: "#2e7d32",
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              padding: "0.15rem 0.45rem",
                              borderRadius: "4px",
                            }}
                          >
                            مجاناً
                          </span>
                        )}
                      </span>
                      <strong>
                        {deliveryFee === 0 ? "مجاناً" : `${deliveryFee} ج.م`}
                      </strong>
                    </div>

                    <div className="totals-row grand-total">
                      <span>الإجمالي المستحق:</span>
                      <span>{number.format(total)} ج.م</span>
                    </div>
                  </div>

                  {}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="whatsapp-order-btn"
                  >
                    {isSubmitting ? (
                      <span>جارٍ تجهيز وإرسال الطلب...</span>
                    ) : (
                      <>
                        <WhatsAppIcon size={24} color="#ffffff" />
                        <span>
                          تأكيد وإرسال عبر واتساب ({number.format(total)} ج.م)
                        </span>
                      </>
                    )}
                  </button>

                  <div className="whatsapp-info-hint">
                    <span>🟢</span>
                    <span>
                      ستصلك رسالة الطلب مباشرة للرقم <strong>{WHATSAPP_DISPLAY}</strong> شاملة الأصناف واللوكيشن لباب بيتك.
                    </span>
                  </div>

                  {}
                  <div className="checkout-guarantee-pill">
                    <Flame
                      style={{
                        width: "1.2rem",
                        height: "1.2rem",
                        color: "var(--tomato)",
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <strong style={{ display: "block", fontWeight: 700 }}>
                        ضمان الطازة ١٠٠٪
                      </strong>
                      <span>
                        يُغسل ويُقطّع الخضار يومياً بعناية فائقة ليصلك بأعلى قيمة
                        غذائية وطعم طازج.
                      </span>
                    </div>
                  </div>
                </div>
              </aside>
            </form>
          </>
        )}
      </div>
    </main>
  )
}
