import fs from "fs"
import path from "path"
import crypto from "crypto"

const ARTIFACT_DIR = "C:/Users/kaled/.gemini/antigravity-ide/brain/fb478491-9fc9-493d-836d-80325ea5bbaf"
const BASE_URL = "http://localhost:8443"
const SESSION_SECRET = "2d58e95d27b5d1fc05fa24a5451a95a522b8e5623ce8a92a57ebe2bf8e9f64d2"

function sendCDP(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1000000)
    const handler = (event) => {
      const data = JSON.parse(event.data)
      if (data.id === id) {
        ws.removeEventListener("message", handler)
        if (data.error) reject(data.error)
        else resolve(data.result)
      }
    }
    ws.addEventListener("message", handler)
    ws.send(JSON.stringify({ id, method, params }))
  })
}

async function run() {
  console.log("=== Setting up Round 3 Verification ===")

  // 1. Configure Admin Session Token
  const payload = "Admin:" + (Date.now() + 86400000)
  const hmac = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex")
  const sessionToken = `${payload}.${hmac}`
  const adminCookie = `nf_admin_session=${sessionToken}`

  // 2. Configure Settings with wallet & instapay
  console.log("Configuring Wallet & InstaPay in settings...")
  await fetch(`${BASE_URL}/api/admin/settings`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({
      walletNumber: "01012345678",
      walletLabel: "فودافون كاش",
      instapayAddress: "noorfarm@instapay",
      freeDeliveryActive: false,
    }),
  })

  // 3. Create a test order with wallet payment
  console.log("Creating test order with wallet payment method...")
  const orderRes = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerName: "أحمد منصور",
      customerPhone: "01011223344",
      area: "أكتوبر – الحي المتميز",
      location: {
        lat: 29.9722,
        lng: 30.9411,
        address: "الحي المتميز، 6 أكتوبر",
      },
      addressDetails: {
        building: "15",
        floor: "2",
        apartment: "4",
      },
      items: [
        {
          id: "fresh-tomato",
          name_ar: "طماطم بلدي طازجة",
          unit: "كجم",
          unit_price: 25,
          qty: 2,
          line_total: 50,
        },
      ],
      paymentMethod: "wallet",
    }),
  })
  const orderData = await orderRes.json()
  const orderId = orderData.order?.id
  console.log("Created order ID:", orderId)

  // 4. Connect to Chrome CDP
  console.log("Opening new tab in Chrome...")
  const res = await fetch("http://127.0.0.1:9222/json/new?about:blank", { method: "PUT" })
  const tab = await res.json()
  const ws = new WebSocket(tab.webSocketDebuggerUrl)
  await new Promise((resolve) => ws.addEventListener("open", resolve))

  await sendCDP(ws, "Page.enable")
  await sendCDP(ws, "Network.enable")
  await sendCDP(ws, "Runtime.enable")

  // Set admin cookie
  await sendCDP(ws, "Network.setCookie", {
    name: "nf_admin_session",
    value: sessionToken,
    domain: "localhost",
    path: "/",
    httpOnly: true,
  })

  // Set mobile viewport 390x844
  await sendCDP(ws, "Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  })

  // -------------------------------------------------------------
  // SHOT 1: Admin Section Manager at 390x844
  // -------------------------------------------------------------
  console.log("Navigating to /admin/sections/fresh-vegetables...")
  await sendCDP(ws, "Page.navigate", { url: `${BASE_URL}/admin/sections/fresh-vegetables` })
  await new Promise((r) => setTimeout(r, 2000))

  const shot1 = await sendCDP(ws, "Page.captureScreenshot", { format: "png" })
  fs.writeFileSync(path.join(ARTIFACT_DIR, "admin_section_manager_mobile.png"), Buffer.from(shot1.data, "base64"))
  console.log("Saved admin_section_manager_mobile.png")

  // -------------------------------------------------------------
  // SHOT 2: Admin Missing Filter
  // -------------------------------------------------------------
  console.log("Clicking 'بدون صورة / بدون سعر' filter...")
  await sendCDP(ws, "Runtime.evaluate", {
    expression: `
      const filterBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('بدون'));
      if (filterBtn) filterBtn.click();
    `,
  })
  await new Promise((r) => setTimeout(r, 600))
  const shot2 = await sendCDP(ws, "Page.captureScreenshot", { format: "png" })
  fs.writeFileSync(path.join(ARTIFACT_DIR, "admin_missing_filter_mobile.png"), Buffer.from(shot2.data, "base64"))
  console.log("Saved admin_missing_filter_mobile.png")

  // -------------------------------------------------------------
  // SHOT 3: Open Edit Sheet on Mobile
  // -------------------------------------------------------------
  console.log("Opening edit sheet on first product card...")
  await sendCDP(ws, "Runtime.evaluate", {
    expression: `
      // Switch back to 'all' filter first
      const allBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('الكل'));
      if (allBtn) allBtn.click();
    `,
  })
  await new Promise((r) => setTimeout(r, 500))

  await sendCDP(ws, "Runtime.evaluate", {
    expression: `
      const editBtn = document.querySelector('.gallery-product-card button, button[aria-label="تعديل المنتج"]');
      const editButtons = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('تعديل'));
      if (editButtons.length > 0) editButtons[0].click();
    `,
  })
  await new Promise((r) => setTimeout(r, 800))
  const shot3 = await sendCDP(ws, "Page.captureScreenshot", { format: "png" })
  fs.writeFileSync(path.join(ARTIFACT_DIR, "admin_edit_sheet_mobile.png"), Buffer.from(shot3.data, "base64"))
  console.log("Saved admin_edit_sheet_mobile.png")

  // -------------------------------------------------------------
  // SHOT 4: Receipt with Wallet Transfer (PENDING state)
  // -------------------------------------------------------------
  console.log(`Navigating to receipt for order ${orderId} (Pending State)...`)
  await sendCDP(ws, "Page.navigate", { url: `${BASE_URL}/order/${orderId}?replay=0` })
  // Wait 6 seconds for receipt animation to complete
  await new Promise((r) => setTimeout(r, 6000))

  // Scroll down to the receipt paper body
  await sendCDP(ws, "Runtime.evaluate", {
    expression: `
      window.scrollTo(0, 320);
    `,
  })
  await new Promise((r) => setTimeout(r, 500))

  const shot4 = await sendCDP(ws, "Page.captureScreenshot", { format: "png" })
  fs.writeFileSync(path.join(ARTIFACT_DIR, "receipt_pending_transfer.png"), Buffer.from(shot4.data, "base64"))
  console.log("Saved receipt_pending_transfer.png")

  // -------------------------------------------------------------
  // SHOT 5: Update Order to SET state, capture receipt
  // -------------------------------------------------------------
  console.log(`Setting delivery fee to 20 EGP and paymentStatus to received...`)
  await fetch(`${BASE_URL}/api/admin/orders`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({
      id: orderId,
      deliveryFee: 20,
      deliveryFeeStatus: "set",
      paymentStatus: "received",
    }),
  })

  // Reload receipt page
  await sendCDP(ws, "Page.navigate", { url: `${BASE_URL}/order/${orderId}?replay=0` })
  await new Promise((r) => setTimeout(r, 6000))

  await sendCDP(ws, "Runtime.evaluate", {
    expression: `
      window.scrollTo(0, 320);
    `,
  })
  await new Promise((r) => setTimeout(r, 500))

  const shot5 = await sendCDP(ws, "Page.captureScreenshot", { format: "png" })
  fs.writeFileSync(path.join(ARTIFACT_DIR, "receipt_set_transfer.png"), Buffer.from(shot5.data, "base64"))
  console.log("Saved receipt_set_transfer.png")

  // -------------------------------------------------------------
  // SHOT 6: Admin Orders Modal at 390x844
  // -------------------------------------------------------------
  console.log("Navigating to /admin/orders...")
  await sendCDP(ws, "Page.navigate", { url: `${BASE_URL}/admin/orders` })
  await new Promise((r) => setTimeout(r, 3500))

  // Click on the latest order row to open order details modal
  await sendCDP(ws, "Runtime.evaluate", {
    expression: `
      const rows = document.querySelectorAll('tbody tr');
      if (rows.length > 0) rows[0].click();
    `,
  })
  await new Promise((r) => setTimeout(r, 1000))

  const shot6 = await sendCDP(ws, "Page.captureScreenshot", { format: "png" })
  fs.writeFileSync(path.join(ARTIFACT_DIR, "admin_orders_mobile.png"), Buffer.from(shot6.data, "base64"))
  console.log("Saved admin_orders_mobile.png")

  // -------------------------------------------------------------
  // SHOT 7: Checkout Single Button & Payment Methods at 390x844
  // -------------------------------------------------------------
  console.log("Navigating to /checkout at 390x844...")
  await sendCDP(ws, "Runtime.evaluate", {
    expression: `
      localStorage.setItem('nf_cart_storage', JSON.stringify({
        state: {
          items: {
            'fresh-tomato': {
              id: 'fresh-tomato',
              name_ar: 'طماطم بلدي',
              price: 25,
              unit: 'كجم',
              qty: 2,
              image: '/images/products/tomato.webp'
            }
          }
        },
        version: 0
      }));
    `,
  })
  await sendCDP(ws, "Page.navigate", { url: `${BASE_URL}/checkout` })
  await new Promise((r) => setTimeout(r, 2500))

  // Scroll down to payment methods and order summary & submit button
  await sendCDP(ws, "Runtime.evaluate", {
    expression: `
      const submitBtn = document.getElementById('checkout-submit-btn');
      if (submitBtn) submitBtn.scrollIntoView({ behavior: 'instant', block: 'end' });
    `,
  })
  await new Promise((r) => setTimeout(r, 500))

  const shot7 = await sendCDP(ws, "Page.captureScreenshot", { format: "png" })
  fs.writeFileSync(path.join(ARTIFACT_DIR, "checkout_single_button_390.png"), Buffer.from(shot7.data, "base64"))
  console.log("Saved checkout_single_button_390.png")

  // Count submit buttons in DOM
  const evalResult = await sendCDP(ws, "Runtime.evaluate", {
    expression: `
      JSON.stringify({
        submitButtonsCount: document.querySelectorAll('#checkout-submit-btn, button[type="submit"]').length,
        hasTopMobileBtn: document.querySelector('.checkout-mobile-bottom-submit') !== null
      })
    `,
  })
  console.log("Button verification in DOM:", evalResult.result.value)

  // Clean up
  await fetch(`http://127.0.0.1:9222/json/close/${tab.id}`)
  ws.close()
  console.log("=== Verification Complete! ===")
}

run().catch((err) => {
  console.error("Verification script error:", err)
  process.exit(1)
})
