import React from "react"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import Header from "@/components/Header"
import SlimFooter from "@/components/SlimFooter"
import { getSections, getProducts } from "@/lib/db"
import { ArrowLeft, ChevronLeft, Sparkles, Apple, Clock, Layers } from "lucide-react"

export const metadata: Metadata = {
  title: "قسم الفاكهة | نور فارم - فواكه موسمية طازجة ومجهزة",
  description: "تصفح أقسام الفواكه في نور فارم: فاكهة طازجة، فاكهة مقطعة ومجهزة، وميكسات وعصائر طازجة.",
}

const SECTION_DESCRIPTIONS: Record<string, string> = {
  "fresh-fruits": "برقوق أحمر سكري، خوخ، كانتالوب عسلي، ليمون، وأفوكادو مختار بالواحدة.",
  "cut-fruits": "سالاد فروت مشكل طازج، مكعبات كانتالوب وبطيخ مجهزة في علب محكمة للتقديم فوراً.",
}

export default async function FruitsDepartmentPage() {
  const [sections, allProducts] = await Promise.all([
    getSections("fruits"),
    getProducts({ publishedOnly: true }),
  ])

  // Count products per section
  const sectionCounts = sections.reduce<Record<string, number>>((acc, sec) => {
    acc[sec.id] = allProducts.filter((p) => p.section_id === sec.id).length
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-[#EDE3CF] text-stone-900 flex flex-col justify-between" dir="rtl">
      <Header />

      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumb */}
        <nav aria-label="مسار التصفح" className="mb-6 flex items-center gap-2 text-xs font-medium text-stone-700">
          <Link href="/" className="hover:text-amber-800 transition-colors">
            الرئيسية
          </Link>
          <ChevronLeft size={14} />
          <span className="text-amber-950 font-bold">قسم الفاكهة</span>
        </nav>

        {/* Hero Section Header */}
        <div className="relative mb-12 overflow-hidden rounded-3xl bg-linear-to-l from-amber-900 via-orange-900 to-amber-950 p-8 sm:p-12 text-white shadow-xl">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-800/80 px-3.5 py-1 text-xs font-semibold text-amber-200 border border-amber-700/50 mb-4">
              <Sparkles size={13} />
              فواكه الموسم الطبيعية
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              فاكهة طازجة وحلوة المذاق
            </h1>
            <p className="mt-3 text-base sm:text-lg text-amber-100/90 font-medium leading-relaxed">
              فواكه موسمية سكرية، منتقاة بعناية حبة بحبة، ومجهزة أيضاً في علب طازجة للتقديم المباشر.
            </p>
          </div>
          {/* Subtle background glow */}
          <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-orange-600/20 blur-3xl pointer-events-none" />
        </div>

        {/* Section Cards Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
              اختر تصنيف الفاكهة
            </h2>
            <span className="text-xs font-semibold text-stone-700 bg-stone-200/80 px-3 py-1 rounded-full">
              {sections.length} تصنيفات
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section) => {
              const isComingSoon = false
              const count = sectionCounts[section.id] || 0
              const description = SECTION_DESCRIPTIONS[section.id] || "أصناف فواكه طازجة مختارة بعناية."

              const cardContent = (
                <>
                  {/* Image Container */}
                  <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                    {section.cover_image ? (
                      <Image
                        src={section.cover_image}
                        alt={section.name_ar}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className={`object-cover transition-transform duration-500 ${
                          isComingSoon ? "grayscale-30 opacity-70" : "group-hover:scale-105"
                        }`}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-amber-50 text-amber-800">
                        <Apple className="w-10 h-10 text-amber-600" />
                      </div>
                    )}

                    {isComingSoon ? (
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-900/90 backdrop-blur-md px-3 py-1 text-xs font-black text-amber-200 shadow-sm border border-amber-700">
                          <Clock size={12} />
                          قريباً
                        </span>
                      </div>
                    ) : (
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white">
                          {count} أصناف
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content Container */}
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <h3 className="text-lg font-bold text-stone-900 group-hover:text-amber-800 transition-colors mb-2">
                        {section.name_ar}
                      </h3>
                      <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                        {description}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-amber-800">
                      <span>{isComingSoon ? "انتظرونا قريباً" : "تصفح الأصناف"}</span>
                      {!isComingSoon && (
                        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                      )}
                    </div>
                  </div>
                </>
              )

              if (isComingSoon) {
                return (
                  <div
                    key={section.id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl bg-white/70 border border-stone-200/60 shadow-xs opacity-90 cursor-not-allowed"
                  >
                    {cardContent}
                  </div>
                )
              }

              return (
                <Link
                  key={section.id}
                  href={`/fruits/${section.id}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-stone-200/90 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  {cardContent}
                </Link>
              )
            })}
          </div>
        </div>
      </main>

      <SlimFooter />
    </div>
  )
}
