import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { isAuthenticatedAdmin } from "@/lib/auth/server-auth"
import { updateProduct, deleteProduct } from "@/lib/db"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await isAuthenticatedAdmin()
  if (!isAuth) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await req.json()
    const { published, price } = body

    if (published && (price === null || price === undefined || price <= 0)) {
      return NextResponse.json({ error: "لا يمكن نشر منتج بدون سعر" }, { status: 400 })
    }

    const updated = await updateProduct(id, body)
    if (!updated) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 })
    }

    revalidatePath("/")
    revalidatePath("/vegetables")
    revalidatePath("/fruits")
    revalidatePath("/admin")

    return NextResponse.json({ product: updated })
  } catch (err: any) {
    console.error("Update product error:", err)
    return NextResponse.json({ error: err.message || "فشل تحديث المنتج" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await isAuthenticatedAdmin()
  if (!isAuth) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  const { id } = await params

  try {
    const success = await deleteProduct(id)
    if (!success) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 })
    }

    revalidatePath("/")
    revalidatePath("/vegetables")
    revalidatePath("/fruits")
    revalidatePath("/admin")

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Delete product error:", err)
    return NextResponse.json({ error: err.message || "فشل حذف المنتج" }, { status: 500 })
  }
}
