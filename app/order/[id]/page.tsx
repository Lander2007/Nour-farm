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
    <div
      className="min-h-screen bg-[#F7F0E3] text-[#2F3B27] font-sans antialiased flex flex-col items-center justify-start w-full"
      dir="rtl"
    >
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-stone-200 py-3.5 px-4 md:px-8 flex items-center justify-center">
        <div
          className="w-full max-w-4xl flex items-center justify-between"
          style={{ maxWidth: "896px", margin: "0 auto", width: "100%" }}
        >
          <Link href="/" className="inline-flex items-center gap-2">
            <BrandMark />
          </Link>
          <div className="flex items-center gap-2 text-xs md:text-sm text-stone-500 font-medium">
            <span>تأكيد واستلام الطلب</span>
          </div>
        </div>
      </header>

      {/* Main Order View */}
      <main
        className="w-full max-w-4xl px-4 py-8 md:py-12"
        style={{ maxWidth: "896px", margin: "0 auto", width: "100%" }}
      >
        <OrderConfirmationClient order={order} />
      </main>
    </div>
  )
}
