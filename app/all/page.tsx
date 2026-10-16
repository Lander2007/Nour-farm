import React from "react"
import Link from "next/link"
import type { Metadata } from "next"
import Header from "@/components/Header"
import SlimFooter from "@/components/SlimFooter"
import AllProductsCatalog from "@/components/AllProductsCatalog"
import { getDepartments, getSections, getProducts, getPublicSettings } from "@/lib/db"
import { ChevronLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "الكل - جميع أصناف الخضار والفاكهة | نور فارم",
  description: "تصفح جميع أصناف الخضار الطازج، الورقيات، الفواكه الطازجة، والمنتجات المجهزة للطبخ من نور فارم.",
}

export default async function AllProductsPage() {
  const [departments, sections, products, settings] = await Promise.all([
    getDepartments(),
    getSections(),
    getProducts({ publishedOnly: true }),
    getPublicSettings(),
  ])

  const enabledAreas = settings.serviceAreas
    .filter((a) => a.enabled)
    .map((a) => a.name)

  return (
    <div className="min-h-screen bg-[#F7F0E3] text-[#2F3B27] flex flex-col justify-between" dir="rtl">
      {/* 1. Top Header */}
      <Header solid />

      {/* 2. Main Catalog */}
      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumb Navigation */}
        <nav aria-label="مسار التصفح" className="mb-4 flex items-center gap-2 text-xs font-medium text-stone-700">
          <Link href="/" className="hover:text-emerald-800 transition-colors">
            الرئيسية
          </Link>
          <ChevronLeft size={14} className="text-stone-400" />
          <span className="font-bold text-[#2F3B27]">جميع الأصناف (الكل)</span>
        </nav>

        {/* Page Title & Subtitle */}
        <div className="mb-8 border-b border-[#2F3B27]/10 pb-5">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#2F3B27] tracking-tight mb-2">
            جميع الأصناف
          </h1>
          <p className="text-xs sm:text-sm text-[#2F3B27]/75 font-medium leading-relaxed max-w-2xl">
            تصفّح تشكيلة نور فارم الكاملة من الخضار والفاكهة اليومية الطازجة، المنتقاة بالواحدة من المزرعة مباشرة.
          </p>
        </div>

        {/* Interactive Catalog Component */}
        <AllProductsCatalog
          initialProducts={products}
          departments={departments}
          sections={sections}
        />
      </main>

      {/* 3. Slim Footer */}
      <SlimFooter initialAddress={settings.storeAddress} initialAreas={enabledAreas} />
    </div>
  )
}
