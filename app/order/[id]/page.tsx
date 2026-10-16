import React from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getOrderById } from "@/lib/db"
import BrandMark from "@/components/BrandMark"
import OrderConfirmationClient from "./OrderConfirmationClient"

interface OrderPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: OrderPageProps): Promise<Metadata> {
  const { id } = await params
  const order = await getOrderById(id)
  if (!order) {
    return { title: "الطلب غير موجود | نور فارم" }
  }
  return {
    title: `تفاصيل الطلب #${order.order_number} | نور فارم`,
    description: `استلام ومتابعة تفاصيل الطلب رقم #${order.order_number} من نور فارم.`,
  }
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params
  const order = await getOrderById(id)

  if (!order) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[#faf6ee] text-[#1a2a1d] font-sans antialiased" dir="rtl">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200 py-3.5 px-4 md:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2">
            <BrandMark />
          </Link>
          <div className="flex items-center gap-2 text-xs md:text-sm text-stone-500 font-medium">
            <span>تأكيد واستلام الطلب</span>
          </div>
        </div>
      </header>

      {/* Main Order View */}
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <OrderConfirmationClient order={order} />
      </main>
    </div>
  )
}
