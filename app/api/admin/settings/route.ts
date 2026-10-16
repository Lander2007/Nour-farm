import { NextRequest, NextResponse } from "next/server"
import { isAuthenticatedAdmin } from "@/lib/auth/server-auth"
import { getSettings, updateSettings } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  const isAuth = await isAuthenticatedAdmin()
  if (!isAuth) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  try {
    const settings = await getSettings()
    return NextResponse.json({ settings })
  } catch (err: any) {
    console.error("Admin getSettings error:", err)
    return NextResponse.json(
      { error: err.message || "فشل جلب إعدادات المتجر" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  const isAuth = await isAuthenticatedAdmin()
  if (!isAuth) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const {
      storeAddress,
      serviceAreas,
      whatsappNumber,
      freeDeliveryActive,
      freeDeliveryText,
    } = body

    // Validation
    const updates: Record<string, any> = {}

    if (storeAddress !== undefined) {
      if (typeof storeAddress !== "string" || !storeAddress.trim()) {
        return NextResponse.json({ error: "عنوان المتجر مطلوب" }, { status: 400 })
      }
      updates.storeAddress = storeAddress.trim()
    }

    if (serviceAreas !== undefined) {
      if (!Array.isArray(serviceAreas)) {
        return NextResponse.json({ error: "قائمة مناطق التوصيل غير صحيحة" }, { status: 400 })
      }
      updates.serviceAreas = serviceAreas.map((a: any, idx: number) => ({
        id: a.id || `area-${idx + 1}-${Date.now()}`,
        name: String(a.name || "").trim(),
        enabled: Boolean(a.enabled),
      }))
    }

    if (whatsappNumber !== undefined) {
      updates.whatsappNumber = String(whatsappNumber).trim()
    }

    if (freeDeliveryActive !== undefined) {
      updates.freeDeliveryActive = Boolean(freeDeliveryActive)
    }

    if (freeDeliveryText !== undefined) {
      updates.freeDeliveryText = String(freeDeliveryText).trim()
    }

    const updated = await updateSettings(updates)
    return NextResponse.json({ settings: updated })
  } catch (err: any) {
    console.error("Admin updateSettings error:", err)
    return NextResponse.json(
      { error: err.message || "فشل حفظ إعدادات المتجر" },
      { status: 500 }
    )
  }
}
