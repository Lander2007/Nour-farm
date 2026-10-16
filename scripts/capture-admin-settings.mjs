import fs from "fs"
import path from "path"
import crypto from "crypto"

const ARTIFACT_DIR = "C:/Users/kaled/.gemini/antigravity-ide/brain/88dbecaf-619f-4d3f-8589-71874845a6e1"
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
  const payload = "Admin:" + (Date.now() + 86400000)
  const hmac = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex")
  const sessionToken = `${payload}.${hmac}`

  console.log("Opening new tab for admin settings...")
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

  await sendCDP(ws, "Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  })

  await sendCDP(ws, "Page.navigate", { url: "http://localhost:8443/admin/settings" })
  await new Promise((r) => setTimeout(r, 2000))

  const shot = await sendCDP(ws, "Page.captureScreenshot", { format: "png" })
  const outPath = path.join(ARTIFACT_DIR, "admin_settings.png")
  fs.writeFileSync(outPath, Buffer.from(shot.data, "base64"))
  console.log("Saved admin settings screenshot to:", outPath)

  await fetch(`http://127.0.0.1:9222/json/close/${tab.id}`)
  ws.close()
}

run().catch((err) => {
  console.error("Error:", err)
  process.exit(1)
})
