import React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { isAuthenticatedAdmin } from "@/lib/auth/server-auth"
import { isUsingDevFallback, assertDatabaseConfigured } from "@/lib/db"
import { AlertTriangle, Database } from "lucide-react"
import AdminMobileNav from "@/components/admin/AdminMobileNav"

export const metadata = {
  title: "لوحة التحكم | نور فارم - NOOR FARM",
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fail loudly in production if DB env vars are missing
  try {
    assertDatabaseConfigured()
  } catch (err: any) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "#0d1a11",
          color: "#ffffff",
          direction: "rtl",
          fontFamily: "var(--font-body), sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 580,
            background: "rgba(239, 68, 68, 0.1)",
            border: "2px solid #ef4444",
            borderRadius: 20,
            padding: "2.5rem 2rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "#ef4444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
            }}
          >
            <AlertTriangle size={34} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "1rem" }}>
            خطأ في إعدادات قاعدة البيانات السحابية (Production)
          </h1>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.7, opacity: 0.9, marginBottom: "1.5rem" }}>
            لم يتم العثور على متغيرات الاتصال بـ Supabase على خادم الإنتاج. وفقاً لقواعد الحماية، تم إيقاف لوحة التحكم فوراً لمنع فقدان البيانات.
          </p>
          <div
            style={{
              background: "rgba(0,0,0,0.4)",
              padding: "1rem",
              borderRadius: 12,
              fontFamily: "monospace",
              fontSize: "0.85rem",
              textAlign: "left",
              direction: "ltr",
              color: "#fca5a5",
            }}
          >
            NEXT_PUBLIC_SUPABASE_URL=...<br />
            SUPABASE_SERVICE_ROLE_KEY=...
          </div>
        </div>
      </div>
    )
  }

  const isAuth = await isAuthenticatedAdmin()
  const isDev = isUsingDevFallback()

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* DEVELOPMENT FALLBACK BANNER */}
      {isDev && isAuth && (
        <aside
          role="status"
          aria-live="polite"
          style={{
            background: "#fffbeb",
            borderBottom: "1px solid #fef3c7",
            padding: "0.65rem 1.5rem",
            color: "#92400e",
            fontSize: "0.85rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.6rem",
            direction: "rtl",
            textAlign: "center",
            zIndex: 100,
            position: "sticky",
            top: 0,
          }}
        >
          <Database size={16} color="#d97706" />
          <span>
            تنبيه وضع التطوير: التخزين محلي، التغييرات لن تظهر للزبائن حتى يتم ربط قاعدة بيانات Supabase.
          </span>
        </aside>
      )}

      {children}
      <AdminMobileNav />
    </div>
  )
}
