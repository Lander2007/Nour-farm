import crypto from "node:crypto"
import { cookies } from "next/headers"

const COOKIE_NAME = "nf_admin_session"
const SESSION_DURATION_SECONDS = 12 * 60 * 60 // 12 hours

// In-memory rate limiter: IP -> { count: number, resetAt: number }
const loginAttempts = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(ip: string): { allowed: boolean; remainingMinutes: number } {
  // In development, do not lock out localhost
  if (process.env.NODE_ENV !== "production" && (ip === "127.0.0.1" || ip === "::1" || ip === "localhost")) {
    return { allowed: true, remainingMinutes: 0 }
  }

  const now = Date.now()
  const record = loginAttempts.get(ip)

  if (!record || now > record.resetAt) {
    return { allowed: true, remainingMinutes: 15 }
  }

  if (record.count >= 5) {
    const remainingMinutes = Math.ceil((record.resetAt - now) / 60000)
    return { allowed: false, remainingMinutes }
  }

  return { allowed: true, remainingMinutes: 15 }
}

export function recordFailedLogin(ip: string): void {
  const now = Date.now()
  const record = loginAttempts.get(ip)

  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 })
  } else {
    record.count += 1
  }
}

export function clearRateLimit(ip: string): void {
  loginAttempts.delete(ip)
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex")
  const derived = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 }).toString("hex")
  return `scrypt:${salt}:${derived}`
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash) {
    return false
  }

  const cleanHash = storedHash.replace(/^["']|["']$/g, "").trim()
  const delimiter = cleanHash.includes(":") ? ":" : "$"
  const parts = cleanHash.split(delimiter)
  if (parts.length !== 3) return false

  const [prefix, salt, expectedHex] = parts
  if (prefix !== "scrypt" || !salt || !expectedHex) return false

  try {
    const expectedBuf = Buffer.from(expectedHex, "hex")
    const derivedBuf = crypto.scryptSync(password, salt, expectedBuf.length, {
      N: 16384,
      r: 8,
      p: 1,
    })

    if (derivedBuf.length !== expectedBuf.length) return false
    return crypto.timingSafeEqual(derivedBuf, expectedBuf)
  } catch {
    return false
  }
}

export function signToken(payload: string, secret: string): string {
  const hmac = crypto.createHmac("sha256", secret)
  hmac.update(payload)
  return `${payload}.${hmac.digest("hex")}`
}

export function verifyToken(token: string, secret: string): string | null {
  const lastDot = token.lastIndexOf(".")
  if (lastDot === -1) return null

  const payload = token.slice(0, lastDot)
  const signature = token.slice(lastDot + 1)

  const hmac = crypto.createHmac("sha256", secret)
  hmac.update(payload)
  const expectedSig = hmac.digest("hex")

  try {
    const sigBuf = Buffer.from(signature, "hex")
    const expectedBuf = Buffer.from(expectedSig, "hex")
    if (sigBuf.length !== expectedBuf.length) return null
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null

    return payload
  } catch {
    return null
  }
}

export async function createAdminSession(username: string): Promise<void> {
  const secret = process.env.SESSION_SECRET || "default_dev_session_secret_replace_in_prod"
  const expiresAt = Date.now() + SESSION_DURATION_SECONDS * 1000
  const payload = `${username}:${expiresAt}`
  const token = signToken(payload, secret)

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  })
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function isAuthenticatedAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return false

  const secret = process.env.SESSION_SECRET || "default_dev_session_secret_replace_in_prod"
  const payload = verifyToken(token, secret)
  if (!payload) return false

  const [username, expiresStr] = payload.split(":")
  const expiresAt = Number(expiresStr)
  if (!username || isNaN(expiresAt) || Date.now() > expiresAt) {
    return false
  }

  return true
}

export function isAuthEnvConfigured(): { configured: boolean; missing: string[] } {
  const missing: string[] = []
  if (!process.env.ADMIN_USERNAME) missing.push("ADMIN_USERNAME")
  if (!process.env.ADMIN_PASSWORD_HASH) missing.push("ADMIN_PASSWORD_HASH")
  if (!process.env.SESSION_SECRET) missing.push("SESSION_SECRET")

  return {
    configured: missing.length === 0,
    missing,
  }
}
