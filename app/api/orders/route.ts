import { NextRequest, NextResponse } from "next/server"
import { createOrder, getOrderById } from "@/lib/db"
import { isWithinEgypt } from "@/lib/utils/geo"

// Egyptian mobile phone validation (010, 011, 012, 015 followed by 8 digits)
const EGYPT_PHONE_REGEX = /^01[0125][0-9]{8}$/

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const customer_name = body.customer_name || body.customerName
    const customer_phone = body.customer_phone || body.customerPhone
    const area = body.area
    const address_details = body.address_details || body.addressDetails
    const location = body.location
    const items = body.items

    // 1. Validate Customer Name
    if (!customer_name || typeof customer_name !== "string" || customer_name.trim().length < 3) {
      return NextResponse.json(
        { error: "اسم العميل مطلوب ويجب ألا يقل عن ٣ أحرف" },
        { status: 400 }
      )
    }

    // 2. Validate Egyptian Phone
    const cleanPhone = (customer_phone || "").toString().trim().replace(/[\s-]/g, "")
    if (!EGYPT_PHONE_REGEX.test(cleanPhone)) {
      return NextResponse.json(
        { error: "رقم الموبايل غير صحيح. برجاء إدخال رقم مصري يبدأ بـ 010 أو 011 أو 012 أو 015 مكون من 11 رقم" },
        { status: 400 }
      )
    }

    // 3. Validate Delivery Area (Required and must be an enabled service area)
    if (!area || typeof area !== "string" || !area.trim()) {
      return NextResponse.json(
        { error: "منطقة التوصيل مطلوبة، يرجى اختيار منطقة التوصيل من القائمة" },
        { status: 400 }
      )
    }

    const { getSettings } = await import("@/lib/db")
    const storeSettings = await getSettings()
    const validArea = (storeSettings.serviceAreas || []).find(
      (a) => a.enabled && a.name.trim() === area.trim()
    )

    if (!validArea) {
      return NextResponse.json(
        { error: "منطقة التوصيل المختارة غير مدعومة أو غير مفعلة حالياً" },
        { status: 400 }
      )
    }

    // 4. Mandatory Location on Map (Leaflet / OpenStreetMap)
    if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") {
      return NextResponse.json(
        { error: "تحديد موقع التوصيل على الخريطة إلزامي لإتمام الطلب" },
        { status: 400 }
      )
    }

    // 5. Strict Egyptian Bounding Box
    if (!isWithinEgypt(location.lat, location.lng)) {
      return NextResponse.json(
        { error: "موقع التوصيل المختار خارج جمهورية مصر العربية" },
        { status: 400 }
      )
    }

    // 6. Validate Address Details
    if (!address_details || !address_details.building || !address_details.apartment) {
      return NextResponse.json(
        { error: "برجاء كتابة رقم أو اسم العمارة ورقم الشقة" },
        { status: 400 }
      )
    }

    // 7. Validate Items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "سلة التسوق فارغة، برجاء إضافة منتجات أولاً" },
        { status: 400 }
      )
    }

    // Calculate subtotal price server-side
    let calculatedSubtotal = 0
    const sanitizedItems = items.map((it: any) => {
      const qty = Number(it.qty) || 1
      const unit_price = Number(it.unit_price) || 0
      const line_total = Number((qty * unit_price).toFixed(2))
      calculatedSubtotal += line_total
      return {
        id: String(it.id),
        name: String(it.name || it.name_ar || "صنف"),
        unit: String(it.unit || "كجم"),
        qty,
        unit_price,
        line_total,
      }
    })

    const subtotal_price = Number(calculatedSubtotal.toFixed(2))

    // Determine delivery fee status & fee based on server store settings
    const freeDelivery = Boolean(storeSettings.freeDeliveryActive)
    const delivery_fee = freeDelivery ? 0 : null
    const delivery_fee_status = freeDelivery ? "free" : "pending"
    const total_price = subtotal_price

    // Validate Payment Method
    const rawPayment = body.payment_method || body.paymentMethod || "cod"
    if (!["cod", "wallet", "instapay"].includes(rawPayment)) {
      return NextResponse.json(
        { error: "طريقة الدفع المختارة غير صحيحة" },
        { status: 400 }
      )
    }

    if (rawPayment === "wallet" && !storeSettings.walletNumber?.trim()) {
      return NextResponse.json(
        { error: "الدفع عبر المحفظة الإلكترونية غير متاح حالياً" },
        { status: 400 }
      )
    }

    if (rawPayment === "instapay" && !storeSettings.instapayAddress?.trim()) {
      return NextResponse.json(
        { error: "الدفع عبر إنستاباي غير متاح حالياً" },
        { status: 400 }
      )
    }

    const payment_method = rawPayment as "cod" | "wallet" | "instapay"
    const payment_status = "pending" as const

    // Generate readable order number
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const order_number = `NF-${randomSuffix}`

    const newOrder = await createOrder({
      order_number,
      customer_name: customer_name.trim(),
      customer_phone: cleanPhone,
      area: validArea.name,
      delivery_fee,
      delivery_fee_status,
      subtotal_price,
      total_price,
      payment_method,
      paymentMethod: payment_method,
      payment_status,
      paymentStatus: payment_status,
      address_details: {
        street: address_details.street || "",
        building: String(address_details.building).trim(),
        floor: address_details.floor ? String(address_details.floor).trim() : "",
        apartment: String(address_details.apartment).trim(),
        landmark: address_details.landmark || "",
        notes: address_details.notes || "",
      },
      location: {
        lat: Number(location.lat.toFixed(6)),
        lng: Number(location.lng.toFixed(6)),
        source: location.source === "gps" ? "gps" : "pin",
        address_text: location.address_text || "",
      },
      items: sanitizedItems,
      status: "new",
    })

    return NextResponse.json(
      {
        success: true,
        orderId: newOrder.id,
        orderNumber: newOrder.order_number,
        order: newOrder,
      },
      { status: 201 }
    )
  } catch (err: any) {
    console.error("Order creation error:", err)
    return NextResponse.json(
      { error: err.message || "حدث خطأ أثناء حفظ الطلب. برجاء المحاولة مرة أخرى" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "معرف الطلب مطلوب" }, { status: 400 })
    }

    const order = await getOrderById(id)
    if (!order) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (err: any) {
    console.error("Order fetch error:", err)
    return NextResponse.json({ error: "فشل استرجاع بيانات الطلب" }, { status: 500 })
  }
}
