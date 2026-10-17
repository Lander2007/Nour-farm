"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Layers, ShoppingBag, Settings, ExternalLink } from "lucide-react"

export default function AdminMobileNav() {
  const pathname = usePathname()

  // Do not display on login page
  if (pathname === "/admin/login") return null

  const isSections = pathname === "/admin" || pathname.startsWith("/admin/sections")
  const isOrders = pathname.startsWith("/admin/orders")
  const isSettings = pathname.startsWith("/admin/settings")

  return (
    <nav
      className="admin-mobile-bottom-nav"
      aria-label="شريط تنقل الإدارة للهاتف"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "64px",
        background: "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderTop: "1.5px solid rgba(47, 59, 39, 0.12)",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "space-around",
        zIndex: 9999,
        direction: "rtl",
        boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.08)",
        paddingBottom: "max(0px, env(safe-area-inset-bottom))",
      }}
    >
      <Link
        href="/admin"
        className={`admin-mobile-tab ${isSections ? "is-active" : ""}`}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "44px",
          color: isSections ? "#1b5e20" : "#64748b",
          fontWeight: isSections ? 800 : 600,
          fontSize: "0.74rem",
          textDecoration: "none",
          gap: "4px",
          background: isSections ? "rgba(46, 125, 50, 0.08)" : "transparent",
          transition: "all 0.15s ease",
        }}
      >
        <Layers size={20} color={isSections ? "#1b5e20" : "#64748b"} />
        <span>الأقسام</span>
      </Link>

      <Link
        href="/admin/orders"
        className={`admin-mobile-tab ${isOrders ? "is-active" : ""}`}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "44px",
          color: isOrders ? "#1b5e20" : "#64748b",
          fontWeight: isOrders ? 800 : 600,
          fontSize: "0.74rem",
          textDecoration: "none",
          gap: "4px",
          background: isOrders ? "rgba(46, 125, 50, 0.08)" : "transparent",
          transition: "all 0.15s ease",
        }}
      >
        <ShoppingBag size={20} color={isOrders ? "#1b5e20" : "#64748b"} />
        <span>الطلبات</span>
      </Link>

      <Link
        href="/admin/settings"
        className={`admin-mobile-tab ${isSettings ? "is-active" : ""}`}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "44px",
          color: isSettings ? "#1b5e20" : "#64748b",
          fontWeight: isSettings ? 800 : 600,
          fontSize: "0.74rem",
          textDecoration: "none",
          gap: "4px",
          background: isSettings ? "rgba(46, 125, 50, 0.08)" : "transparent",
          transition: "all 0.15s ease",
        }}
      >
        <Settings size={20} color={isSettings ? "#1b5e20" : "#64748b"} />
        <span>الإعدادات</span>
      </Link>

      <Link
        href="/"
        target="_blank"
        className="admin-mobile-tab"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "44px",
          color: "#64748b",
          fontWeight: 600,
          fontSize: "0.74rem",
          textDecoration: "none",
          gap: "4px",
          transition: "all 0.15s ease",
        }}
      >
        <ExternalLink size={20} color="#64748b" />
        <span>المتجر</span>
      </Link>
    </nav>
  )
}
