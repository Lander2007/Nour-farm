import { NextRequest, NextResponse } from "next/server"
import { isAuthenticatedAdmin } from "@/lib/auth/server-auth"
import { getOrders, updateOrderStatus, type OrderStatus } from "@/lib/db"

export async function GET(req: NextRequest) {
  const isAuth = await isAuthenticatedAdmin()
  if (!isAuth) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = (searchParams.get("status") as OrderStatus) || undefined

  const orders = await getOrders({ status })
  return NextResponse.json({ orders })
}

export async function PATCH(req: NextRequest) {
  const isAuth = await isAuthenticatedAdmin()
  if (!isAuth) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  try {
    const { id, status } = await req.json()
    if (!id || !status) {
      return NextResponse.json({ error: "المعرف والحالة مطلوبان" }, { status: 400 })
    }

    const updated = await updateOrderStatus(id, status)
    if (!updated) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 })
    }

    return NextResponse.json({ order: updated })
  } catch (err: any) {
    console.error("Order status update error:", err)
    return NextResponse.json({ error: err.message || "فشل تحديث حالة الطلب" }, { status: 500 })
  }
}
