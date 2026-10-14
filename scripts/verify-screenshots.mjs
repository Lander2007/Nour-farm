import fs from "fs"
import path from "path"

const ARTIFACT_DIR = "C:/Users/kaled/.gemini/antigravity-ide/brain/481568d5-e4cf-4519-ac89-1ba6bafad766"

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

async function captureProgress(ws, name, scrollY) {
  // Scroll window to exact position
  await sendCDP(ws, "Runtime.evaluate", {
    expression: `window.scrollTo(0, ${scrollY});`,
  })
  // Wait 350ms for GSAP ticker to compute and write transforms
  await new Promise((r) => setTimeout(r, 400))

  const shot = await sendCDP(ws, "Page.captureScreenshot", {
    format: "png",
  })
  const filePath = path.join(ARTIFACT_DIR, `${name}.png`)
  fs.writeFileSync(filePath, Buffer.from(shot.data, "base64"))
  console.log(`Saved screenshot: ${name}.png at scrollY=${scrollY}`)
}

async function run() {
  console.log("Creating new tab on port 8443...")
  const res = await fetch("http://127.0.0.1:9222/json/new?http://localhost:8443/", {
    method: "PUT",
  })
  const tab = await res.json()
  console.log("Tab opened:", tab.id)

  const ws = new WebSocket(tab.webSocketDebuggerUrl)
  await new Promise((resolve) => ws.addEventListener("open", resolve))
  console.log("WebSocket connected!")

  // Enable Page & Runtime
  await sendCDP(ws, "Page.enable")
  await sendCDP(ws, "Runtime.enable")

  // Wait 2.5s for fonts, images, and Lenis to initialize
  await new Promise((r) => setTimeout(r, 2500))

  // ═══════════════════════════════════════════════════════════════
  // 1. DESKTOP VERIFICATION (1440 x 900)
  // ═══════════════════════════════════════════════════════════════
  console.log("Configuring Desktop viewport: 1440x900...")
  await sendCDP(ws, "Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await sendCDP(ws, "Runtime.evaluate", {
    expression: "window.dispatchEvent(new Event('resize'));",
  })
  await new Promise((r) => setTimeout(r, 600))

  // Measure hero height and scroll range
  const metrics = await sendCDP(ws, "Runtime.evaluate", {
    expression: `(() => {
      const hero = document.querySelector('.plate-hero-container');
      const stage = document.querySelector('.plate-hero-stage');
      return {
        heroHeight: hero ? hero.offsetHeight : 1980,
        winHeight: window.innerHeight,
        scrollRange: (hero ? hero.offsetHeight : 1980) - window.innerHeight
      };
    })()`,
    returnByValue: true,
  })
  console.log("Desktop metrics:", metrics.result.value)
  const rangeD = metrics.result.value.scrollRange || 1080

  const desktopCheckpoints = [
    { p: 0.0, name: "desktop_p0_top" },
    { p: 0.2, name: "desktop_p02_tilt" },
    { p: 0.35, name: "desktop_p035_slide" },
    { p: 0.5, name: "desktop_p05_flip" },
    { p: 0.7, name: "desktop_p07_falling" },
    { p: 0.9, name: "desktop_p09_landing" },
    { p: 1.0, name: "desktop_p10_shop" },
  ]

  for (const cp of desktopCheckpoints) {
    const sY = Math.round(cp.p * rangeD)
    await captureProgress(ws, cp.name, sY)
  }

  // Test reversing (scroll back to top)
  console.log("Testing reverse scroll back to top...")
  await captureProgress(ws, "desktop_reverse_top", 0)

  // Test anchor jump to #shop
  console.log("Testing anchor jump to #shop...")
  await sendCDP(ws, "Runtime.evaluate", {
    expression: `(() => {
      const shop = document.getElementById('shop');
      if (shop) shop.scrollIntoView({ behavior: 'instant' });
    })()`,
  })
  await new Promise((r) => setTimeout(r, 500))
  const shotShop = await sendCDP(ws, "Page.captureScreenshot", { format: "png" })
  fs.writeFileSync(path.join(ARTIFACT_DIR, "desktop_jump_shop.png"), Buffer.from(shotShop.data, "base64"))
  console.log("Saved screenshot: desktop_jump_shop.png")

  // Capture Story section & Categories section
  console.log("Capturing Story and Categories...")
  await sendCDP(ws, "Runtime.evaluate", {
    expression: `(() => {
      const story = document.getElementById('story');
      if (story) story.scrollIntoView({ behavior: 'instant' });
    })()`,
  })
  await new Promise((r) => setTimeout(r, 500))
  const shotStory = await sendCDP(ws, "Page.captureScreenshot", { format: "png" })
  fs.writeFileSync(path.join(ARTIFACT_DIR, "desktop_story_scene.png"), Buffer.from(shotStory.data, "base64"))

  await sendCDP(ws, "Runtime.evaluate", {
    expression: `(() => {
      const cat = document.getElementById('categories');
      if (cat) cat.scrollIntoView({ behavior: 'instant' });
    })()`,
  })
  await new Promise((r) => setTimeout(r, 500))
  const shotCat = await sendCDP(ws, "Page.captureScreenshot", { format: "png" })
  fs.writeFileSync(path.join(ARTIFACT_DIR, "desktop_categories.png"), Buffer.from(shotCat.data, "base64"))

  // ═══════════════════════════════════════════════════════════════
  // 2. MOBILE VERIFICATION (390 x 844)
  // ═══════════════════════════════════════════════════════════════
  console.log("Configuring Mobile viewport: 390x844...")
  await sendCDP(ws, "Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  })
  await sendCDP(ws, "Runtime.evaluate", {
    expression: `(() => {
      window.scrollTo(0, 0);
      if (window.__lenis) {
        window.__lenis.scrollTo(0, { immediate: true });
      }
      window.dispatchEvent(new Event('resize'));
    })()`,
  })
  await new Promise((r) => setTimeout(r, 1200))

  const metricsM = await sendCDP(ws, "Runtime.evaluate", {
    expression: `(() => {
      const hero = document.querySelector('.plate-hero-container');
      return {
        scrollRange: (hero ? hero.offsetHeight : 1856) - window.innerHeight
      };
    })()`,
    returnByValue: true,
  })
  const rangeM = metricsM.result.value.scrollRange || 1013

  const mobileCheckpoints = [
    { p: 0.0, name: "mobile_p0_top" },
    { p: 0.2, name: "mobile_p02_tilt" },
    { p: 0.35, name: "mobile_p035_slide" },
    { p: 0.5, name: "mobile_p05_flip" },
    { p: 0.7, name: "mobile_p07_falling" },
    { p: 0.9, name: "mobile_p09_landing" },
    { p: 1.0, name: "mobile_p10_shop" },
  ]

  for (const cp of mobileCheckpoints) {
    const sY = Math.round(cp.p * rangeM)
    await captureProgress(ws, cp.name, sY)
  }

  // Check console logs
  const logs = await sendCDP(ws, "Runtime.evaluate", {
    expression: `(() => {
      return window.__consoleErrors || [];
    })()`,
    returnByValue: true,
  })
  console.log("Console errors detected:", logs.result.value)

  // Close tab
  await fetch(`http://127.0.0.1:9222/json/close/${tab.id}`)
  ws.close()
  console.log("Verification finished successfully!")
}

run().catch((err) => {
  console.error("Error during verification:", err)
  process.exit(1)
})
