"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Lock, User, KeyRound, ArrowLeft, AlertCircle, ShieldCheck } from "lucide-react"
import "../admin.css"

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "بيانات الدخول غير صحيحة")
        setIsLoading(false)
        return
      }

      // Success -> Force full window navigation to /admin with fresh cookie
      window.location.href = "/admin"
    } catch {
      setError("حدث خطأ أثناء الاتصال بالخادم. حاول مرة أخرى.")
      setIsLoading(false)
    }
  }

  return (
    <div className="admin-lock-screen">
      <div className="admin-lock-card">
        <div className="lock-logo-badge">
          <Image
            src="/logo-icon.png"
            alt="Noor Farm"
            width={48}
            height={48}
            style={{ borderRadius: "10px" }}
          />
        </div>

        <h1 className="lock-title">لوحة إدارة نور فارم</h1>
        <p className="lock-subtitle">
          تسجيل الدخول المخصص للمشرفين. يرجى إدخال اسم المستخدم وكلمة المرور للوصول إلى لوحة التحكم.
        </p>

        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              color: "#fca5a5",
              padding: "0.75rem 1rem",
              borderRadius: "12px",
              marginBottom: "1.25rem",
              fontSize: "0.88rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              textAlign: "right",
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} action="#" method="POST" style={{ textAlign: "right" }}>
          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "rgba(255, 255, 255, 0.8)",
                marginBottom: "0.4rem",
              }}
            >
              اسم المستخدم
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                className="lock-input"
                style={{ textAlign: "right", fontSize: "0.95rem", letterSpacing: "normal", paddingRight: "2.75rem" }}
                placeholder="أدخل اسم المستخدم..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                disabled={isLoading}
              />
              <User
                size={18}
                style={{
                  position: "absolute",
                  right: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(255, 255, 255, 0.4)",
                  pointerEvents: "none",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "rgba(255, 255, 255, 0.8)",
                marginBottom: "0.4rem",
              }}
            >
              كلمة المرور
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="password"
                className="lock-input"
                style={{ textAlign: "right", fontSize: "0.95rem", letterSpacing: "normal", paddingRight: "2.75rem" }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <KeyRound
                size={18}
                style={{
                  position: "absolute",
                  right: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(255, 255, 255, 0.4)",
                  pointerEvents: "none",
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="lock-btn-submit"
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.7 : 1 }}
          >
            <Lock size={18} />
            <span>{isLoading ? "جاري التحقق..." : "تسجيل الدخول"}</span>
          </button>
        </form>



        <div style={{ marginTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem" }}>
          <Link
            href="/"
            style={{
              fontSize: "0.85rem",
              color: "rgba(255, 255, 255, 0.6)",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={14} />
            <span>العودة إلى واجهة المتجر الرئيسية</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
