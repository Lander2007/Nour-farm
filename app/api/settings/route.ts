import { NextResponse } from "next/server"
import { getPublicSettings } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const settings = await getPublicSettings()
    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Error fetching public settings:", error)
    return NextResponse.json(
      { error: "فشل استرجاع إعدادات المتجر" },
      { status: 500 }
    )
  }
}
