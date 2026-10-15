import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { isAuthenticatedAdmin } from "@/lib/auth/server-auth"
import { bulkCreateDraftProducts } from "@/lib/db"

export async function POST(req: NextRequest) {
  const isAuth = await isAuthenticatedAdmin()
  if (!isAuth) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { items } = body // array of { name_ar, image_url, section_id }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "قائمة العناصر فارغة" }, { status: 400 })
    }

    const created = await bulkCreateDraftProducts(items)

    revalidatePath("/admin")
    revalidatePath("/vegetables")
    revalidatePath("/fruits")

    return NextResponse.json({ products: created, count: created.length }, { status: 201 })
  } catch (err: any) {
    console.error("Bulk create error:", err)
    return NextResponse.json({ error: err.message || "فشل الاستيراد الجماعي" }, { status: 500 })
  }
}
