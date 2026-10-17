import fs from "fs"
import path from "path"
import crypto from "node:crypto"

const BASE_URL = "http://localhost:8443"
const ARTIFACT_DIR = "C:/Users/kaled/.gemini/antigravity-ide/brain/88dbecaf-619f-4d3f-8589-71874845a6e1"

const SESSION_SECRET = "2d58e95d27b5d1fc05fa24a5451a95a522b8e5623ce8a92a57ebe2bf8e9f64d2"
const payload = `Admin:${Date.now() + 86400000}`
const hmac = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex")
const ADMIN_COOKIE = `nf_admin_session=${payload}.${hmac}`

async function run() {
  console.log("=== Starting Round 2 Verification Flow ===")

  // 1. Check current public settings
  console.log("\n1. Fetching public settings...")
  const resSettings = await fetch(`${BASE_URL}/api/settings`)
  const settingsData = await resSettings.json()
  console.log("Current Settings:", settingsData.settings)

  // Ensure freeDeliveryActive is OFF first
  if (settingsData.settings.freeDeliveryActive) {
    console.log("Setting freeDeliveryActive to false for first test...")
    await fetch(`${BASE_URL}/api/admin/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({ freeDeliveryActive: false }),
    })
  }

  // 2. Create Order #1 with free delivery OFF (Fee should be pending)
  console.log("\n2. Creating Order #1 with freeDeliveryActive = false...")
  const order1Payload = {
    customerName: "محمد الشناوي",
    customerPhone: "01098765432",
    area: "أكتوبر – الحي المتميز",
    location: {
      lat: 29.9722,
      lng: 30.9411,
      address: "الحي المتميز، 6 أكتوبر",
    },
    addressDetails: {
      building: "24",
      floor: "3",
      apartment: "6",
      landmark: "بجوار مدرسة الرؤية",
      notes: "يرجى الاتصال قبل الوصول",
    },
    items: [
      {
        id: "fresh-tomato",
        name_ar: "طماطم طازج",
        unit: "كجم",
        unit_price: 25,
        qty: 2,
        line_total: 50,
      },
      {
        id: "fresh-cucumber",
        name_ar: "خيار بلدي",
        unit: "كجم",
        unit_price: 20,
        qty: 1.5,
        line_total: 30,
      },
    ],
    paymentMethod: "cod",
  }

  const resOrder1 = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order1Payload),
  })
  const order1Data = await resOrder1.json()
  console.log("Order 1 created:", {
    id: order1Data.order?.id,
    order_number: order1Data.order?.order_number,
    subtotal: order1Data.order?.subtotal_price,
    delivery_fee: order1Data.order?.delivery_fee,
    delivery_fee_status: order1Data.order?.delivery_fee_status,
    total_price: order1Data.order?.total_price,
  })

  const order1Id = order1Data.order.id

  // 3. Verify Order #1 in Database via GET
  const resGet1 = await fetch(`${BASE_URL}/api/admin/orders`, {
    headers: { Cookie: ADMIN_COOKIE },
  })
  const ordersList1 = await resGet1.json()
  const fetchedOrder1 = ordersList1.orders.find((o) => o.id === order1Id)
  console.log("Order 1 fetched from admin API:", {
    area: fetchedOrder1.area,
    delivery_fee_status: fetchedOrder1.delivery_fee_status,
    delivery_fee: fetchedOrder1.delivery_fee,
    subtotal: fetchedOrder1.subtotal_price,
    total: fetchedOrder1.total_price,
  })

  // 4. Admin updates delivery fee to 40
  console.log("\n3. Admin setting delivery fee to 40 ج.م for Order 1...")
  const resUpdateFee = await fetch(`${BASE_URL}/api/admin/orders`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
    body: JSON.stringify({
      id: order1Id,
      deliveryFee: 40,
      deliveryFeeStatus: "set",
    }),
  })
  const updateFeeData = await resUpdateFee.json()
  console.log("Order 1 updated fee result:", {
    delivery_fee: updateFeeData.order?.delivery_fee,
    delivery_fee_status: updateFeeData.order?.delivery_fee_status,
    subtotal: updateFeeData.order?.subtotal_price,
    total_price: updateFeeData.order?.total_price,
  })

  // 5. Admin toggles freeDeliveryActive ON
  console.log("\n4. Admin toggling freeDeliveryActive to true...")
  const resToggleOn = await fetch(`${BASE_URL}/api/admin/settings`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
    body: JSON.stringify({
      freeDeliveryActive: true,
      freeDeliveryText: "التوصيل مجاني في عروض الافتتاح",
    }),
  })
  const toggleData = await resToggleOn.json()
  console.log("Settings updated:", toggleData.settings)

  // 6. Create Order #2 with free delivery ON
  console.log("\n5. Creating Order #2 with freeDeliveryActive = true...")
  const order2Payload = {
    customerName: "سارة إبراهيم",
    customerPhone: "01123456789",
    area: "أكتوبر – غرب سوميد",
    location: {
      lat: 29.9654,
      lng: 30.9231,
      address: "غرب سوميد، 6 أكتوبر",
    },
    addressDetails: {
      building: "8",
      floor: "1",
      apartment: "2",
      landmark: "أمام حديقة سوميد",
    },
    items: [
      {
        id: "fresh-orange",
        name_ar: "برتقال بلدي عصير",
        unit: "كجم",
        unit_price: 35,
        qty: 3,
        line_total: 105,
      },
    ],
    paymentMethod: "cod",
  }

  const resOrder2 = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order2Payload),
  })
  const order2Data = await resOrder2.json()
  console.log("Order 2 created:", {
    id: order2Data.order?.id,
    order_number: order2Data.order?.order_number,
    subtotal: order2Data.order?.subtotal_price,
    delivery_fee: order2Data.order?.delivery_fee,
    delivery_fee_status: order2Data.order?.delivery_fee_status,
    total_price: order2Data.order?.total_price,
  })

  const order2Id = order2Data.order.id

  // 7. Create Order #3 (Pending Fee for receipt pending screenshot)
  // Toggle free delivery OFF again temporarily
  await fetch(`${BASE_URL}/api/admin/settings`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ freeDeliveryActive: false }),
  })
  console.log("\n6. Creating Order #3 (to show Pending Fee state on receipt)...")
  const order3Payload = {
    customerName: "كريم عبد العزيز",
    customerPhone: "01511223344",
    area: "أكتوبر – الحي المتميز",
    location: {
      lat: 29.9812,
      lng: 30.9501,
      address: "الحي المتميز",
    },
    addressDetails: {
      building: "12",
      floor: "4",
      apartment: "8",
    },
    items: [
      {
        id: "fresh-carrot",
        name_ar: "جزر سكري",
        unit: "كجم",
        unit_price: 18,
        qty: 2,
        line_total: 36,
      },
    ],
    paymentMethod: "cod",
  }
  const resOrder3 = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order3Payload),
  })
  const order3Data = await resOrder3.json()
  const order3Id = order3Data.order.id
  console.log("Order 3 created (Pending state):", {
    id: order3Id,
    delivery_fee_status: order3Data.order?.delivery_fee_status,
  })

  // Summary of Order IDs for screenshots:
  console.log("\n=== IDs FOR SCREENSHOTS ===")
  console.log(`Pending Receipt URL: ${BASE_URL}/order/${order3Id}?replay=0`)
  console.log(`Set Fee (40 EGP) Receipt URL: ${BASE_URL}/order/${order1Id}?replay=0`)
  console.log(`Free Receipt URL: ${BASE_URL}/order/${order2Id}?replay=0`)
  console.log(`Admin Orders URL: ${BASE_URL}/admin/orders`)
}

run().catch((err) => {
  console.error("Test flow failed:", err)
  process.exit(1)
})
