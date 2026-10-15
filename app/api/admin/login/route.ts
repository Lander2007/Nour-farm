import { NextRequest, NextResponse } from "next/server"
import crypto from "node:crypto"
import {
  checkRateLimit,
  recordFailedLogin,
  clearRateLimit,
  verifyPassword,
  createAdminSession,
  isAuthEnvConfigured,
} from "@/lib/auth/server-auth"

export async function POST(req: NextRequest) {
  // Determine client IP
  const forwardedFor = req.headers.get("x-forwarded-for")
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1"

  // Check rate limiter: 5 attempts per 15 minutes
  const rateLimit = checkRateLimit(ip)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: `تم تجاوز الحد الأقصى لمحاولات الدخول. يرجى المحاولة بعد ${rateLimit.remainingMinutes} دقيقة.`,
      },
      { status: 429 }
    )
  }

  // Check if credentials env vars are configured
  const authConfig = isAuthEnvConfigured()
  if (!authConfig.configured) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          error: "تسجيل الدخول معطل حالياً: لم يتم تعيين متغيرات البيئة الخاصة بحساب المشرف في الخادم.",
        },
        { status: 503 }
      )
    }
  }

  let body: { username?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 })
  }

  const { username, password } = body

  if (!username || !password) {
    recordFailedLogin(ip)
    return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 })
  }

  const rawExpectedUser = process.env.ADMIN_USERNAME
  const expectedUsername = rawExpectedUser ? rawExpectedUser.replace(/^["']|["']$/g, "").trim() : null
  const expectedPasswordHash = process.env.ADMIN_PASSWORD_HASH

  // Constant-time check for username
  let usernameMatch = false
  if (expectedUsername) {
    const cleanInputUser = username.trim()
    const userBuf = Buffer.from(cleanInputUser)
    const expBuf = Buffer.from(expectedUsername)
    if (userBuf.length === expBuf.length && crypto.timingSafeEqual(userBuf, expBuf)) {
      usernameMatch = true
    }
  }

  // Check password hash
  let passwordMatch = false
  if (expectedPasswordHash) {
    passwordMatch = verifyPassword(password, expectedPasswordHash)
  }

  // In development ONLY, allow a bootstrap admin if env vars are not set yet
  if (!authConfig.configured && process.env.NODE_ENV !== "production") {
    if (username === "admin" && (password === "2026" || password === "admin")) {
      usernameMatch = true
      passwordMatch = true
    }
  }

  if (!usernameMatch || !passwordMatch) {
    recordFailedLogin(ip)
    return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 })
  }

  // Success
  clearRateLimit(ip)
  await createAdminSession(username)

  return NextResponse.json({ success: true })
}
