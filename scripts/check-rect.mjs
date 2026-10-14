async function test() {
  const pages = await fetch("http://127.0.0.1:9222/json").then((r) => r.json())
  const p = pages.find((x) => x.url.includes("8443"))
  if (!p) return console.log("No 8443 page found")

  const ws = new WebSocket(p.webSocketDebuggerUrl)
  await new Promise((r) => ws.addEventListener("open", r))

  const evalExpr = (expression) =>
    new Promise((resolve) => {
      const id = 123
      ws.addEventListener("message", function handler(e) {
        const d = JSON.parse(e.data)
        if (d.id === id) {
          ws.removeEventListener("message", handler)
          resolve(d.result.result.value)
        }
      })
      ws.send(JSON.stringify({ id, method: "Runtime.evaluate", params: { expression, returnByValue: true } }))
    })

  const res = await evalExpr(`(() => {
    const el = document.elementFromPoint(25, 25);
    const sprites = Array.from(document.querySelectorAll(".hero-falling-sprite")).map(s => ({
      id: s.getAttribute("data-item-id"),
      rect: { left: s.getBoundingClientRect().left, top: s.getBoundingClientRect().top }
    }));
    return {
      elementFromPoint: el ? { tag: el.tagName, class: el.className, html: el.outerHTML.slice(0, 100) } : null,
      sprites
    };
  })()`)

  console.log("Element at top-left:", JSON.stringify(res, null, 2))
  ws.close()
}

test()
