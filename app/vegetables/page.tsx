import React from "react"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { getSections, getProducts } from "@/lib/db"
import { ArrowLeft, ChevronLeft, Sparkles, Carrot, Utensils, Salad, Leaf } from "lucide-react"

export const metadata: Metadata = {
  title: "قسم الخضار | نور فارم - خضار طازج ومجهز من المزرعة",
  description: "تصفح أقسام الخضار في نور فارم: خضار طازج، ورقيات وأعشاب، خضار متقطع ومجهز، وسلطات جاهزة.",
}

const SECTION_DESCRIPTIONS: Record<string, string> = {
  "fresh-vegetables": "طماطم، خيار، بطاطس تحمير، جزر، فلفل ألوان وأصناف الخضار اليومية.",
  herbs: "نعناع بلدي، ريحان إيطالي، بقدونس، كزبرة، شبت وجرجير مغسول ونظيف.",
  "ready-vegetables": "بامية مقمعة، خضار سوتيه، بصل مقطع جاهز للطبخ فوراً بدون مجهود.",
  salads: "سلطة خضراء متوازنة، وسلطة كول سلو طازجة مجهزة للتقديم.",
}

const SECTION_ICONS: Record<string, React.ReactNode> = {
  "fresh-vegetables": <Carrot className="w-5 h-5 text-emerald-600" />,
  herbs: <Leaf className="w-5 h-5 text-emerald-600" />,
  "ready-vegetables": <Utensils className="w-5 h-5 text-emerald-600" />,
  salads: <Salad className="w-5 h-5 text-emerald-600" />,
}

export default async function VegetablesDepartmentPage() {
  const [sections, allProducts] = await Promise.all([
    getSections("vegetables"),
    getProducts({ publishedOnly: true }),
  ])

  // Count products per section
  const sectionCounts = sections.reduce<Record<string, number>>((acc, sec) => {
    acc[sec.id] = allProducts.filter((p) => p.section_id === sec.id).length
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-[#fcf9f2] text-stone-900 flex flex-col justify-between" dir="rtl">
      <Header />

      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumb */}
        <nav aria-label="مسار التصفح" className="mb-6 flex items-center gap-2 text-xs font-medium text-stone-700">
          <Link href="/" className="hover:text-emerald-800 transition-colors">
            الرئيسية
          </Link>
          <ChevronLeft size={14} />
          <span className="text-emerald-950 font-bold">قسم الخضار</span>
        </nav>

        {/* Hero Section Header */}
        <div className="relative mb-12 overflow-hidden rounded-3xl bg-linear-to-l from-emerald-900 via-emerald-850 to-emerald-950 p-8 sm:p-12 text-white shadow-xl">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-800/80 px-3.5 py-1 text-xs font-semibold text-emerald-200 border border-emerald-700/50 mb-4">
              <Sparkles size={13} />
              قسم الخضار اليومي
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              خضار يومي من المزرعة
            </h1>
            <p className="mt-3 text-base sm:text-lg text-emerald-100/90 font-medium leading-relaxed">
              خضار طازج، ورقيات منتقاة، وأصناف مجهزة ومغسولة جاهزة للطبخ فوراً بدون أي عناء.
            </p>
          </div>
          {/* Subtle background glow */}
          <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-emerald-700/30 blur-3xl pointer-events-none" />
        </div>

        {/* 4 Section Cards Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
              اختر تصنيف الخضار
            </h2>
            <span className="text-xs font-semibold text-stone-700 bg-stone-200/80 px-3 py-1 rounded-full">
              4 تصنيفات رئيسية
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map((section) => {
              const count = sectionCounts[section.id] || 0
              const description = SECTION_DESCRIPTIONS[section.id] || "أصناف طازجة منتقاة بعناية."
              const icon = SECTION_ICONS[section.id] || <Leaf className="w-5 h-5 text-emerald-600" />

              return (
                <Link
                  key={section.id}
                  href={`/vegetables/${section.id}`}
                  className="group relative flex flex-col sm:flex-row overflow-hidden rounded-2xl bg-white border border-stone-200/90 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  {/* Image Container */}
                  <div className="relative h-48 sm:h-auto sm:w-48 shrink-0 overflow-hidden bg-stone-100">
                    {section.cover_image ? (
                      <Image
                        src={section.cover_image}
                        alt={section.name_ar}
                        fill
                        sizes="(max-width: 640px) 100vw, 192px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-emerald-50 text-emerald-800">
                        {icon}
                      </div>
                    )}
                    <div className="absolute top-3 right-3 sm:hidden">
                      <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white">
                        {count} أصناف
                      </span>
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
                            {icon}
                          </div>
                          <h3 className="text-lg font-bold text-stone-900 group-hover:text-emerald-800 transition-colors">
                            {section.name_ar}
                          </h3>
                        </div>
                        <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-950 border border-emerald-200/60">
                          {count} أصناف
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                        {description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-emerald-800 group-hover:text-emerald-900">
                      <span>تصفح الأصناف</span>
                      <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
