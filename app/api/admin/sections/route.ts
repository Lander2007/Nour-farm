import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { isAuthenticatedAdmin } from "@/lib/auth/server-auth"
import { getSections, createSection, updateSection, deleteSection } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const departmentId = searchParams.get("departmentId") || undefined
    const sections = await getSections(departmentId)
    return NextResponse.json({ sections })
  } catch (err: any) {
    console.error("GET /api/admin/sections error:", err)
    return NextResponse.json({ error: "فشل استرجاع الأقسام" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const isAuth = await isAuthenticatedAdmin()
  if (!isAuth) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name_ar, department_id, cover_image, sort } = body

    if (!name_ar || typeof name_ar !== "string" || !name_ar.trim()) {
      return NextResponse.json({ error: "اسم القسم مطلوب" }, { status: 400 })
    }

    const cleanDept = department_id === "fruits" ? "fruits" : "vegetables"
    const trimmedName = name_ar.trim()

    // Generate clean ID from name or timestamp
    const cleanSlug = body.id
      ? String(body.id).trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-")
      : `sec-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`

    const existingSections = await getSections(cleanDept)
    const nextSort = typeof sort === "number" ? sort : (existingSections.length + 1)

    const newSection = await createSection({
      id: cleanSlug,
      department_id: cleanDept,
      name_ar: trimmedName,
      cover_image: cover_image || null,
      sort: nextSort,
    })

    // Revalidate paths
    revalidatePath("/")
    revalidatePath("/vegetables")
    revalidatePath("/fruits")
    revalidatePath("/admin")

    return NextResponse.json({ section: newSection }, { status: 201 })
  } catch (err: any) {
    console.error("POST /api/admin/sections error:", err)
    return NextResponse.json(
      { error: err.message || "حدث خطأ أثناء إنشاء القسم الجديد" },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  const isAuth = await isAuthenticatedAdmin()
  if (!isAuth) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { id, cover_image, name_ar, department_id, sort } = body

    if (!id) {
      return NextResponse.json({ error: "معرّف القسم مطلوب" }, { status: 400 })
    }

    const updates: any = {}
    if (cover_image !== undefined) updates.cover_image = cover_image
    if (name_ar !== undefined) updates.name_ar = name_ar
    if (department_id !== undefined) updates.department_id = department_id
    if (sort !== undefined) updates.sort = sort

    const updated = await updateSection(id, updates)

    // Revalidate paths
    revalidatePath("/")
    revalidatePath("/vegetables")
    revalidatePath("/fruits")
    revalidatePath("/products")
    revalidatePath("/admin")

    return NextResponse.json({ success: true, section: updated })
  } catch (err: any) {
    console.error("PUT /api/admin/sections error:", err)
    return NextResponse.json(
      { error: err.message || "فشل تحديث القسم" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  const isAuth = await isAuthenticatedAdmin()
  if (!isAuth) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "معرّف القسم مطلوب" }, { status: 400 })
    }

    await deleteSection(id)

    // Revalidate paths
    revalidatePath("/")
    revalidatePath("/vegetables")
    revalidatePath("/fruits")
    revalidatePath("/products")
    revalidatePath("/admin")

    return NextResponse.json({ success: true, message: "تم حذف القسم بنجاح" })
  } catch (err: any) {
    console.error("DELETE /api/admin/sections error:", err)
    return NextResponse.json(
      { error: err.message || "فشل حذف القسم" },
      { status: 500 }
    )
  }
}

