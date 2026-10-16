import React from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import NeutralProductCard from "@/components/NeutralProductCard"
import { getDepartment, getSection, getSections, getProducts } from "@/lib/db"
import { ChevronLeft, Layers, ShoppingBag } from "lucide-react"

interface SectionPageProps {
  params: Promise<{
    department: string
    section: string
  }>
}

export async function generateMetadata({ params }: SectionPageProps): Promise<Metadata> {
  const { department, section: sectionId } = await params
  const [dept, section] = await Promise.all([
    getDepartment(department),
    getSection(sectionId),
  ])

  if (!dept || !section) {
    return { title: "القسم غير موجود | نور فارم" }
  }

  return {
    title: `${section.name_ar} - قسم ${dept.name_ar} | نور فارم`,
    description: `تسوق ${section.name_ar} الطازجة من مزرعة نور فارم، بأسعار حقيقية وخيارات وزن دقيقة.`,
  }
}

export default async function DepartmentSectionPage({ params }: SectionPageProps) {
  const { department, section: sectionId } = await params

  if (department !== "vegetables" && department !== "fruits") {
    notFound()
  }

  const [dept, currentSection, siblingSections, products] = await Promise.all([
    getDepartment(department),
    getSection(sectionId),
    getSections(department),
    getProducts({ sectionId, publishedOnly: true }),
  ])

  if (!dept || !currentSection || currentSection.department_id !== department) {
    notFound()
  }

  const isVegetables = department === "vegetables"
  const themeClasses = isVegetables
    ? {
        accentBg: "bg-emerald-700",
        accentText: "text-emerald-800",
        badgeBg: "bg-emerald-50 text-emerald-950 border-emerald-200/70",
        activePill: "bg-emerald-700 text-white shadow-sm font-bold",
        inactivePill: "bg-white text-stone-700 hover:bg-emerald-50 hover:text-emerald-800 border border-stone-200",
      }
    : {
        accentBg: "bg-amber-600",
        accentText: "text-amber-800",
        badgeBg: "bg-amber-50 text-amber-950 border-amber-200/70",
        activePill: "bg-amber-700 text-white shadow-sm font-bold",
        inactivePill: "bg-white text-stone-700 hover:bg-amber-50 hover:text-amber-800 border border-stone-200",
      }

  return (
    <div className="min-h-screen bg-[#fcf9f2] text-stone-900 flex flex-col justify-between" dir="rtl">
      <Header />

      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumb Navigation */}
        <nav aria-label="مسار التصفح" className="mb-6 flex flex-wrap items-center gap-2 text-xs font-medium text-stone-700">
          <Link href="/" className="hover:text-emerald-800 transition-colors">
            الرئيسية
          </Link>
          <ChevronLeft size={14} className="text-stone-400" />
          <Link href={`/${department}`} className="hover:text-emerald-800 transition-colors">
            قسم {dept.name_ar}
          </Link>
          <ChevronLeft size={14} className="text-stone-400" />
          <span className="font-bold text-stone-900">{currentSection.name_ar}</span>
        </nav>

        {/* Section Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200/80 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-bold border ${themeClasses.badgeBg}`}>
                قسم {dept.name_ar}
              </span>
              <span className="text-xs text-stone-700 font-medium">
                • {products.length} صنف متاح
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
              {currentSection.name_ar}
            </h1>
          </div>

          <Link
            href={`/${department}`}
            className="text-xs font-bold text-stone-700 hover:text-stone-900 flex items-center gap-1 self-start md:self-auto"
          >
            <span>عرض كل أقسام {dept.name_ar}</span>
            <ChevronLeft size={14} />
          </Link>
        </div>

        {/* Sibling Section Tabs */}
        <div className="mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {siblingSections.map((sec) => {
              const isActive = sec.id === currentSection.id

              return (
                <Link
                  key={sec.id}
                  href={`/${department}/${sec.id}`}
                  className={`shrink-0 px-4 py-2 rounded-xl text-xs transition-all ${
                    isActive ? themeClasses.activePill : themeClasses.inactivePill
                  }`}
                >
                  {sec.name_ar}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Product Catalog Grid */}
        {products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-stone-300 bg-white/60 p-12 text-center my-8">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-stone-700">
              <ShoppingBag size={24} />
            </div>
            <h3 className="text-base font-bold text-stone-800">لا توجد منتجات منشورة حالياً في هذا القسم</h3>
            <p className="mt-1 text-xs text-stone-700 max-w-sm mx-auto">
              يمكن لمشرف المتجر إضافة وتفعيل المنتجات والأسعار من لوحة الإدارة لتظهر هنا فوراً.
            </p>
            <div className="mt-6">
              <Link
                href={`/${department}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-stone-800"
              >
                العودة لتصنيفات {dept.name_ar}
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <NeutralProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
