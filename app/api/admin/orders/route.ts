import { NextRequest, NextResponse } from "next/server"
import { isAuthenticatedAdmin } from "@/lib/auth/server-auth"
import {
  getOrders,
  updateOrderStatus,
  updateOrderDeliveryFee,
  type OrderStatus,
  type DeliveryFeeStatus,
} from "@/lib/db"

export const dynamic = "force-dynamic"

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
    const body = await req.json()
    const { id, status, deliveryFee, deliveryFeeStatus } = body

    if (!id) {
      return NextResponse.json({ error: "معرف الطلب مطلوب" }, { status: 400 })
    }

    let updatedOrder = null

    // If delivery fee is being updated
    if (deliveryFeeStatus !== undefined || deliveryFee !== undefined) {
      const feeStatus: DeliveryFeeStatus = deliveryFeeStatus === "free" ? "free" : "set"
      const feeNum = feeStatus === "free" ? 0 : Number(deliveryFee) || 0

      if (feeStatus === "set" && (isNaN(feeNum) || feeNum < 0)) {
        return NextResponse.json(
          { error: "رسوم التوصيل يجب أن تكون رقماً موجباً" },
          { status: 400 }
        )
      }

      updatedOrder = await updateOrderDeliveryFee(id, feeNum, feeStatus)
    }

    // If payment status is being updated
    const rawPayStatus = body.paymentStatus || body.payment_status
    if (rawPayStatus !== undefined) {
      if (rawPayStatus !== "pending" && rawPayStatus !== "received") {
        return NextResponse.json({ error: "حالة الدفع غير صحيحة" }, { status: 400 })
      }
      const { updateOrderPaymentStatus } = await import("@/lib/db")
      updatedOrder = await updateOrderPaymentStatus(id, rawPayStatus as any)
    }

    // If order status is being updated
    if (status) {
      updatedOrder = await updateOrderStatus(id, status as OrderStatus)
    }

    if (!updatedOrder) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 })
    }

    return NextResponse.json({ order: updatedOrder })
  } catch (err: any) {
    console.error("Order update error:", err)
    return NextResponse.json(
      { error: err.message || "فشل تحديث الطلب" },
      { status: 500 }
    )
  }
}
