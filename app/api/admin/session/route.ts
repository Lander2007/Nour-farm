import { NextResponse } from "next/server"
import { isAuthenticatedAdmin, isAuthEnvConfigured, verifyPassword } from "@/lib/auth/server-auth"
import { isUsingDevFallback } from "@/lib/db"

export async function GET() {
  const isAuth = await isAuthenticatedAdmin()
  const authConfig = isAuthEnvConfigured()
  const isDevFallback = isUsingDevFallback()

  return NextResponse.json({
    authenticated: isAuth,
    isDevFallback,
    authConfigured: authConfig.configured,
  })
}
