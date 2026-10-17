import fs from "fs"
import path from "path"
import crypto from "crypto"

const ARTIFACT_DIR = "C:/Users/kaled/.gemini/antigravity-ide/brain/fb478491-9fc9-493d-836d-80325ea5bbaf"
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

async function waitForSelector(ws, selector, timeoutMs = 8000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const res = await sendCDP(ws, "Runtime.evaluate", {
      expression: `!!document.querySelector("${selector}")`,
      returnByValue: true,
    })
    if (res?.result?.value) return true
    await new Promise((r) => setTimeout(r, 250))
  }
  return false
}

async function run() {
  const payload = "Admin:" + (Date.now() + 86400000)
  const hmac = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex")
  const sessionToken = `${payload}.${hmac}`

  console.log("Opening new tab for admin mobile verification...")
  const res = await fetch("http://127.0.0.1:9222/json/new?about:blank", { method: "PUT" })
  const tab = await res.json()
  const ws = new WebSocket(tab.webSocketDebuggerUrl)
  await new Promise((resolve) => ws.addEventListener("open", resolve))

  await sendCDP(ws, "Page.enable")
  await sendCDP(ws, "Network.enable")
  await sendCDP(ws, "Runtime.enable")

  await sendCDP(ws, "Network.setCookie", {
    name: "nf_admin_session",
    value: sessionToken,
    domain: "localhost",
    path: "/",
    httpOnly: true,
  })

  // Set Mobile Viewport (iPhone 14 / standard 390x844)
  await sendCDP(ws, "Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  })

  // 1. Admin Products Dashboard
  console.log("Navigating to /admin (390px mobile)...")
  await sendCDP(ws, "Page.navigate", { url: "http://localhost:8443/admin" })
  await waitForSelector(ws, ".admin-mobile-product-card", 10000)
  await new Promise((r) => setTimeout(r, 1000))

  let shot = await sendCDP(ws, "Page.captureScreenshot", { format: "png" })
  fs.writeFileSync(path.join(ARTIFACT_DIR, "admin_products_mobile_390.png"), Buffer.from(shot.data, "base64"))
  console.log("Captured admin_products_mobile_390.png")

  // Scroll to show product cards clearly
  await sendCDP(ws, "Runtime.evaluate", {
    expression: `window.scrollBy({ top: 380, behavior: 'instant' })`,
  })
  await new Promise((r) => setTimeout(r, 500))
  shot = await sendCDP(ws, "Page.captureScreenshot", { format: "png" })
  fs.writeFileSync(path.join(ARTIFACT_DIR, "admin_products_cards_mobile_390.png"), Buffer.from(shot.data, "base64"))
  console.log("Captured admin_products_cards_mobile_390.png")

  // Scroll back up and open Add Product Modal on mobile
  await sendCDP(ws, "Runtime.evaluate", {
    expression: `window.scrollTo({ top: 0, behavior: 'instant' }); document.querySelector(".admin-mobile-fab")?.click() || document.querySelector(".btn-primary-add")?.click()`,
  })
  await new Promise((r) => setTimeout(r, 1000))
  shot = await sendCDP(ws, "Page.captureScreenshot", { format: "png" })
  fs.writeFileSync(path.join(ARTIFACT_DIR, "admin_add_modal_mobile_390.png"), Buffer.from(shot.data, "base64"))
  console.log("Captured admin_add_modal_mobile_390.png")

  // Close modal
  await sendCDP(ws, "Runtime.evaluate", {
    expression: `document.querySelector(".modal-close-btn")?.click()`,
  })
  await new Promise((r) => setTimeout(r, 500))

  // 2. Admin Orders Page
  console.log("Navigating to /admin/orders (390px mobile)...")
  await sendCDP(ws, "Page.navigate", { url: "http://localhost:8443/admin/orders" })
  await waitForSelector(ws, ".mobile-order-card", 10000)
  await new Promise((r) => setTimeout(r, 1000))

  shot = await sendCDP(ws, "Page.captureScreenshot", { format: "png" })
  fs.writeFileSync(path.join(ARTIFACT_DIR, "admin_orders_mobile_390.png"), Buffer.from(shot.data, "base64"))
  console.log("Captured admin_orders_mobile_390.png")

  // 3. Admin Settings Page
  console.log("Navigating to /admin/settings (390px mobile)...")
  await sendCDP(ws, "Page.navigate", { url: "http://localhost:8443/admin/settings" })
  await waitForSelector(ws, "form", 10000)
  await new Promise((r) => setTimeout(r, 1000))

  shot = await sendCDP(ws, "Page.captureScreenshot", { format: "png" })
  fs.writeFileSync(path.join(ARTIFACT_DIR, "admin_settings_mobile_390.png"), Buffer.from(shot.data, "base64"))
  console.log("Captured admin_settings_mobile_390.png")

  await fetch(`http://127.0.0.1:9222/json/close/${tab.id}`)
  ws.close()
  console.log("All screenshots captured successfully!")
}

run().catch((err) => {
  console.error("Error:", err)
  process.exit(1)
})
