import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { isAuthenticatedAdmin } from "@/lib/auth/server-auth"
import { getProducts, createProduct } from "@/lib/db"

export async function GET(req: NextRequest) {
  const isAuth = await isAuthenticatedAdmin()
  if (!isAuth) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const sectionId = searchParams.get("sectionId") || undefined

  const products = await getProducts({ sectionId })
  return NextResponse.json({ products })
}

export async function POST(req: NextRequest) {
  const isAuth = await isAuthenticatedAdmin()
  if (!isAuth) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name_ar, section_id, price, unit_type, pack_label, step, published, image_url, sort } = body

    if (!name_ar || !section_id) {
      return NextResponse.json({ error: "اسم المنتج والقسم مطلوبان" }, { status: 400 })
    }

    if (published && (price === null || price === undefined || price <= 0)) {
      return NextResponse.json({ error: "لا يمكن نشر منتج بدون تحديد سعر صالح" }, { status: 400 })
    }

    const newProduct = await createProduct({
      id: body.id || `prod-${Math.floor(1000 + Math.random() * 9000)}`,
      section_id,
      name_ar: name_ar.trim(),
      image_url: image_url || null,
      price: price !== undefined && price !== null ? Number(price) : null,
      unit_type: unit_type || "kg",
      pack_label: pack_label || null,
      step: Number(step) || (unit_type === "kg" ? 0.5 : 1),
      published: Boolean(published),
      sort: Number(sort) || 0,
    })

    // Revalidate storefront pages
    revalidatePath("/")
    revalidatePath("/vegetables")
    revalidatePath("/fruits")
    revalidatePath("/admin")

    return NextResponse.json({ product: newProduct }, { status: 201 })
  } catch (err: any) {
    console.error("Create product error:", err)
    return NextResponse.json({ error: err.message || "فشل إنشاء المنتج" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const isAuth = await isAuthenticatedAdmin()
  if (!isAuth) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  try {
    const { deleteAllProducts } = await import("@/lib/db")
    await deleteAllProducts()

    // Revalidate all pages
    revalidatePath("/")
    revalidatePath("/vegetables")
    revalidatePath("/fruits")
    revalidatePath("/products")
    revalidatePath("/admin")

    return NextResponse.json({ success: true, message: "تم حذف جميع المنتجات بنجاح" })
  } catch (err: any) {
    console.error("Delete all products error:", err)
    return NextResponse.json({ error: err.message || "فشل حذف المنتجات" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const isAuth = await isAuthenticatedAdmin()
  if (!isAuth) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const { resequenceProducts, updateProduct } = await import("@/lib/db")

    if (body.resequence) {
      const updated = await resequenceProducts()
      revalidatePath("/")
      revalidatePath("/vegetables")
      revalidatePath("/fruits")
      revalidatePath("/products")
      revalidatePath("/admin")
      return NextResponse.json({ success: true, products: updated })
    }

    if (body.id && body.sort !== undefined) {
      const prod = await updateProduct(body.id, { sort: Number(body.sort) })
      revalidatePath("/admin")
      return NextResponse.json({ success: true, product: prod })
    }

    return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 })
  } catch (err: any) {
    console.error("Patch products error:", err)
    return NextResponse.json({ error: err.message || "فشل تحديث الترتيب" }, { status: 500 })
  }
}

