import { Suspense } from "react"
import Catalog from "@/components/Catalog"

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            background: "#fbf6ea",
          }}
        >
          <div
            style={{
              textAlign: "center",
              fontFamily: "var(--font-display, sans-serif)",
              color: "#1e3322",
            }}
          >
            <div
              style={{
                width: "2.5rem",
                height: "2.5rem",
                border: "3px solid #e3dbca",
                borderTopColor: "#2e7d32",
                borderRadius: "50%",
                margin: "0 auto 1rem",
                animation: "spin 1s linear infinite",
              }}
            />
            <p style={{ fontWeight: 700, fontSize: "1.1rem" }}>
              جاري تجهيز متجر نور فارم...
            </p>
          </div>
        </div>
      }
    >
      <Catalog />
    </Suspense>
  )
}
