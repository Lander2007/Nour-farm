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
import SlimFooter from "@/components/SlimFooter"
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
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { useCart } from "@/store/cart"
import { useActiveProducts } from "@/store/products"
import { useStoreSettings } from "@/store/settings"
import { type Product } from "@/data/products"
import type { LocationData } from "@/components/checkout/LeafletLocationPicker"

const LeafletLocationPicker = dynamic(
  () => import("@/components/checkout/LeafletLocationPicker"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[380px] w-full bg-stone-100 rounded-xl animate-pulse flex items-center justify-center text-stone-400 font-bold">
        جاري تحميل خريطة التوصيل (OpenStreetMap)...
      </div>
    ),
  }
)

const number = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 1 })

const WHATSAPP_DISPLAY = "01224272991"
const WHATSAPP_INTL = "201224272991"

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
  const products = useActiveProducts()
  const items = useCart((state) => state.items)
  const change = useCart((state) => state.change)
  const storeSettings = useStoreSettings()

  const [mounted, setMounted] = useState(false)
  const [selectedArea, setSelectedArea] = useState("")

  const enabledAreas = (storeSettings.serviceAreas || []).filter((a) => a.enabled)

  useEffect(() => {
    void useCart.persist.rehydrate()
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!selectedArea && enabledAreas.length > 0) {
      setSelectedArea(enabledAreas[0].name)
    }
  }, [enabledAreas, selectedArea])

  const getQty = (p: { id: string }) => {
    return (
      items[p.id] ??
      items[p.id.replace(/^prod-/, "")] ??
      items[`prod-${p.id}`] ??
      0
    )
  }

  const actualSelected = products.filter((p) => getQty(p) > 0)
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
        (getQty(p) ||
          1),
    0,
  )
  const isFreeDelivery = Boolean(storeSettings.freeDeliveryActive)
  const total = subtotal
  const router = useRouter()
  const [customerInfo, setCustomerInfo] = useState({
    fullName: "",
    phone: "",
    secondaryPhone: "",
    notes: "",
  })
  const [locationData, setLocationData] = useState<LocationData | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

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

  // Helper to normalize Egyptian phone (Arabic digits, country codes +20/0020, spaces, dashes)
  const normalizeEgyptianPhone = (val: string) => {
    if (!val) return ""
    let clean = val.trim().replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString())
    clean = clean.replace(/[\s\-()]/g, "")
    if (clean.startsWith("+20")) clean = clean.slice(3)
    else if (clean.startsWith("0020")) clean = clean.slice(4)
    else if (clean.startsWith("20") && clean.length === 12) clean = clean.slice(2)
    return clean
  }

  const validateForm = () => {
    const errs: Record<string, string> = {}
    if (!customerInfo.fullName.trim() || customerInfo.fullName.trim().length < 3) {
      errs.fullName = "يرجى كتابة الاسم بالكامل (٣ أحرف على الأقل)"
    }
    const cleanPhone = normalizeEgyptianPhone(customerInfo.phone)
    if (!/^01[0125][0-9]{8}$/.test(cleanPhone)) {
      errs.phone = "يرجى إدخال رقم موبايل مصري صحيح مكون من 11 رقم يبدأ بـ 010 أو 011 أو 012 أو 015"
    }
    if (!selectedArea.trim()) {
      errs.area = "يرجى اختيار منطقة التوصيل من القائمة"
    }
    if (!locationData || typeof locationData.lat !== "number" || typeof locationData.lng !== "number") {
      errs.location = "تحديد موقع التوصيل على الخريطة إلزامي لإتمام الطلب"
    }
    if (!buildingDetails.building.trim()) {
      errs.building = "يرجى كتابة رقم المبنى أو العمارة"
    }
    if (!buildingDetails.apartment.trim()) {
      errs.apartment = "يرجى كتابة رقم الشقة"
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
      const cleanWallet = normalizeEgyptianPhone(walletPhone)
      if (!cleanWallet || cleanWallet.length < 10) {
        errs.walletPhone = "يرجى إدخال رقم المحفظة / إنستاباي الذي قمت بالتحويل منه"
      }
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    // 1. Mandatory Location on Map
    if (!locationData) {
      setSubmitError("⚠️ برجاء تحديد موقع التوصيل على الخريطة أولاً لتسجيل الطلب")
      setTimeout(() => {
        const mapSection = document.querySelector(".leaflet-container")?.closest(".checkout-section-card")
        if (mapSection) {
          mapSection.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }, 50)
      return
    }

    // 2. Validate Contact and Address Details
    if (!validateForm()) {
      setSubmitError("⚠️ يرجى استكمال بيانات المستلم والعنوان بالأسفل لإتمام الطلب (الاسم، رقم الموبايل، ورقم العمارة والشقة)")
      // Wait for React state to update error labels, then scroll smoothly to the first field that needs attention
      setTimeout(() => {
        const firstErrorEl = document.querySelector(".checkout-field-error")
        if (firstErrorEl) {
          firstErrorEl.closest(".checkout-form-field")?.scrollIntoView({ behavior: "smooth", block: "center" })
          const input = firstErrorEl.closest(".checkout-form-field")?.querySelector("input, textarea") as HTMLElement | null
          input?.focus()
        } else {
          const firstSection = document.querySelector(".checkout-section-card")
          firstSection?.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      }, 60)
      return
    }

    setIsSubmitting(true)

    try {
      const orderPayload = {
        customer_name: customerInfo.fullName.trim(),
        customer_phone: normalizeEgyptianPhone(customerInfo.phone),
        area: selectedArea.trim(),
        address_details: {
          building: buildingDetails.building.trim(),
          floor: buildingDetails.floor.trim(),
          apartment: buildingDetails.apartment.trim(),
          landmark: buildingDetails.landmark.trim(),
          notes: customerInfo.notes.trim(),
        },
        location: {
          lat: locationData.lat,
          lng: locationData.lng,
          source: locationData.source,
          address_text: locationData.address_text || "",
        },
        items: selectedProducts.map((p) => {
          const qty = items[p.id] || 1
          return {
            id: p.id,
            name: p.name,
            unit: p.unit,
            qty,
            unit_price: p.price,
            line_total: p.price * qty,
          }
        }),
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "فشل إرسال الطلب، يرجى مراجعة البيانات والمحاولة مجدداً")
      }

      // Clear Cart Store
      useCart.getState().clear()

      // Redirect directly to Order Confirmation Screen
      router.push(`/order/${data.orderId}`)
    } catch (err: any) {
      console.error("Order submission failed:", err)
      setSubmitError(err.message || "حدث خطأ غير متوقع أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.")
      setIsSubmitting(false)
      window.scrollTo({ top: 120, behavior: "smooth" })
    }
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
        <div className="checkout-hero-title">
          <h1>إتمام الطلب وتحديد موقع التوصيل</h1>
          <p>
            خطوات بسيطة وسريعة ليصلك خضار اليوم طازة، مغسول ومتقطّع لباب بيتك.
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

                  {/* Embedded Leaflet OpenStreetMap Location Picker Component */}
                  <div style={{ marginBottom: "1.5rem" }}>
                    <LeafletLocationPicker
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
                          يرجى تسجيل منطقة التوصيل، رقم العمارة ورقم الشقة بدقة ليتمكن المندوب من الصعود حتى باب شقتك مباشرة.
                        </p>
                      </div>
                    </div>

                    {/* Delivery Area Select - REQUIRED */}
                    <div className="checkout-form-field" style={{ marginBottom: "1rem" }}>
                      <label htmlFor="checkout-area-select" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        منطقة التوصيل <span style={{ color: "var(--tomato)" }}>*</span>
                      </label>
                      <select
                        id="checkout-area-select"
                        value={selectedArea}
                        onChange={(e) => {
                          setSelectedArea(e.target.value)
                          if (errors.area) {
                            setErrors((prev) => ({ ...prev, area: "" }))
                          }
                        }}
                        style={{
                          width: "100%",
                          padding: "0.8rem 1rem",
                          borderRadius: "0.75rem",
                          border: errors.area ? "1.5px solid var(--tomato)" : "1.5px solid #d6d3d1",
                          background: "#ffffff",
                          fontSize: "0.95rem",
                          fontWeight: 700,
                          color: "#1c1917",
                          cursor: "pointer",
                        }}
                      >
                        <option value="">-- اختر منطقة التوصيل المعتمدة --</option>
                        {enabledAreas.map((area) => (
                          <option key={area.id} value={area.name}>
                            {area.name}
                          </option>
                        ))}
                      </select>
                      {errors.area && (
                        <span className="checkout-field-error">
                          {errors.area}
                        </span>
                      )}
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

                {/* Mobile Bottom Submit Button (after user finishes steps) */}
                <div className="checkout-mobile-bottom-submit">
                  {submitError && (
                    <div
                      style={{
                        padding: "0.85rem 1rem",
                        marginBottom: "1rem",
                        background: "#fef2f2",
                        border: "1.5px solid #fca5a5",
                        color: "#991b1b",
                        borderRadius: "0.75rem",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        lineHeight: 1.5,
                      }}
                    >
                      <span>{submitError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="whatsapp-order-btn"
                    style={{
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                      background: !locationData
                        ? "linear-gradient(135deg, #475569 0%, #334155 100%)"
                        : "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)",
                    }}
                  >
                    {isSubmitting ? (
                      <span>جارٍ تسجيل وتأكيد الطلب...</span>
                    ) : !locationData ? (
                      <>
                        <MapPin size={20} color="#ffffff" />
                        <span>حدد موقع التوصيل على الخريطة أولاً</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={22} color="#ffffff" />
                        <span>
                          {isFreeDelivery
                            ? `تأكيد الطلب الآن (${number.format(subtotal)} ج.م)`
                            : `تأكيد الطلب الآن (${number.format(subtotal)} ج.م)`}
                        </span>
                      </>
                    )}
                  </button>
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
                      <span>إجمالي المنتجات:</span>
                      <strong>{number.format(subtotal)} ج.م</strong>
                    </div>

                    <div className="totals-row">
                      <span>التوصيل:</span>
                      {isFreeDelivery ? (
                        <strong style={{ color: "#2e7d32" }}>
                          {storeSettings.freeDeliveryText ? `${storeSettings.freeDeliveryText} - ` : ""}مجاني
                        </strong>
                      ) : (
                        <span style={{ fontSize: "0.82rem", color: "#78716c", fontWeight: 600 }}>
                          بيتحدد حسب المسافة وهيتأكد معاك
                        </span>
                      )}
                    </div>

                    <div className="totals-row grand-total">
                      <span>{isFreeDelivery ? "الإجمالي:" : "الإجمالي (بدون التوصيل):"}</span>
                      <span>{number.format(subtotal)} ج.م</span>
                    </div>
                  </div>

                  {submitError && (
                    <div
                      style={{
                        padding: "0.85rem 1rem",
                        marginBottom: "1rem",
                        background: "#fef2f2",
                        border: "1.5px solid #fca5a5",
                        color: "#991b1b",
                        borderRadius: "0.75rem",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        lineHeight: 1.5,
                      }}
                    >
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Main Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="whatsapp-order-btn"
                    style={{
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                      background: !locationData
                        ? "linear-gradient(135deg, #475569 0%, #334155 100%)"
                        : "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)",
                      boxShadow: !locationData
                        ? "0 4px 14px rgba(71, 85, 105, 0.3)"
                        : "0 6px 20px rgba(37, 211, 102, 0.38)",
                    }}
                  >
                    {isSubmitting ? (
                      <span>جارٍ تسجيل وتأكيد الطلب...</span>
                    ) : !locationData ? (
                      <>
                        <MapPin size={20} color="#ffffff" />
                        <span>حدد موقع التوصيل على الخريطة أولاً</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={22} color="#ffffff" />
                        <span>
                          {isFreeDelivery
                            ? `تأكيد الطلب الآن (${number.format(subtotal)} ج.م)`
                            : `تأكيد الطلب الآن (${number.format(subtotal)} ج.م)`}
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
        </div>
        <SlimFooter />
      </main>
    )
}
