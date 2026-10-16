import { NextRequest, NextResponse } from "next/server"
import { getProducts, getSections, getDepartments } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sectionId = searchParams.get("sectionId") || undefined
    const search = searchParams.get("search")?.toLowerCase().trim()

    let products = await getProducts({ sectionId, publishedOnly: true })

    if (search) {
      products = products.filter((p) => p.name_ar.toLowerCase().includes(search))
    }

    return NextResponse.json({ products })
  } catch (error) {
    console.error("Error in GET /api/products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
