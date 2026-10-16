"use client"

import React, { useState, useMemo } from "react"
import { Search, X, SlidersHorizontal, Layers, ChevronDown } from "lucide-react"
import type { Product, Department, Section } from "@/lib/db/types"
import NeutralProductCard from "@/components/NeutralProductCard"

interface AllProductsCatalogProps {
  initialProducts: Product[]
  departments: Department[]
  sections: Section[]
}

const PAGE_SIZE = 24
const arNum = new Intl.NumberFormat("ar-EG")

export default function AllProductsCatalog({
  initialProducts,
  departments,
  sections,
}: AllProductsCatalogProps) {
  const [selectedDept, setSelectedDept] = useState<string>("all")
  const [selectedSection, setSelectedSection] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE)

  // Map section_id to section details
  const sectionMap = useMemo(() => {
    const map = new Map<string, Section>()
    sections.forEach((s) => map.set(s.id, s))
    return map
  }, [sections])

  // Sub-sections filtered by selected department
  const availableSections = useMemo(() => {
    if (selectedDept === "all") {
      return sections
    }
    return sections.filter((s) => s.department_id === selectedDept)
  }, [sections, selectedDept])

  // Handle department change: reset section filter and pagination
  const handleDeptChange = (deptId: string) => {
    setSelectedDept(deptId)
    setSelectedSection("all")
    setVisibleCount(PAGE_SIZE)
  }

  // Handle section change: reset pagination
  const handleSectionChange = (sectionId: string) => {
    setSelectedSection(sectionId)
    setVisibleCount(PAGE_SIZE)
  }

  // Handle search change: reset pagination
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setVisibleCount(PAGE_SIZE)
  }

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    const cleanSearch = searchQuery.trim().toLowerCase()

    return initialProducts
      .filter((p) => {
        // Department filter
        const sec = sectionMap.get(p.section_id)
        const productDept = sec?.department_id || (p.section_id.includes("fruit") ? "fruits" : "vegetables")

        if (selectedDept !== "all" && productDept !== selectedDept) {
          return false
        }

        // Sub-section filter
        if (selectedSection !== "all" && p.section_id !== selectedSection) {
          return false
        }

        // Search filter
        if (cleanSearch) {
          const matchName = p.name_ar.toLowerCase().includes(cleanSearch)
          const matchSection = (sec?.name_ar || "").toLowerCase().includes(cleanSearch)
          const matchTag = (p.pack_label || "").toLowerCase().includes(cleanSearch)
          if (!matchName && !matchSection && !matchTag) {
            return false
          }
        }

        return true
      })
      .sort((a, b) => {
        // Group / sort by department then section
        const secA = sectionMap.get(a.section_id)
        const secB = sectionMap.get(b.section_id)
        const deptA = secA?.department_id || ""
        const deptB = secB?.department_id || ""

        if (deptA !== deptB) {
          // vegetables first, then fruits
          return deptA === "vegetables" ? -1 : 1
        }
        if (a.section_id !== b.section_id) {
          return a.section_id.localeCompare(b.section_id)
        }
        return a.sort_order - b.sort_order
      })
  }, [initialProducts, selectedDept, selectedSection, searchQuery, sectionMap])

  // Paginated products
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount)
  }, [filteredProducts, visibleCount])

  const hasMore = visibleCount < filteredProducts.length

  return (
    <div className="w-full space-y-6">
      {/* 1. Search Field & Quick Summary */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full flex-1">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="ابحث في جميع أصناف الخضار والفاكهة (طماطم، برتقال، نعناع...)"
            className="w-full pl-10 pr-10 py-3 bg-white border border-stone-200 rounded-2xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 transition"
              title="مسح البحث"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="text-xs text-stone-700 font-bold whitespace-nowrap self-end sm:self-center px-2">
          متاح {arNum.format(filteredProducts.length)} صنف
        </div>
      </div>

      {/* 2. Department Filter Chips: الكل | الخضار | الفاكهة */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-stone-700 shrink-0 ml-1">القسم:</span>
          {[
            { id: "all", label: "الكل" },
            { id: "vegetables", label: "الخضار" },
            { id: "fruits", label: "الفاكهة" },
          ].map((chip) => {
            const isActive = selectedDept === chip.id
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleDeptChange(chip.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-[#2F4A33] text-white shadow-sm"
                    : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
                }`}
              >
                {chip.label}
              </button>
            )
          })}
        </div>

        {/* 3. Sub-section Filter Chips (the sub-sections of selected department) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none pt-1">
          <span className="text-xs font-bold text-stone-700 shrink-0 ml-1">التصنيف:</span>
          <button
            type="button"
            onClick={() => handleSectionChange("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedSection === "all"
                ? "bg-[#D9788C] text-white shadow-xs"
                : "bg-white/80 text-stone-700 hover:bg-white border border-stone-200"
            }`}
          >
            جميع التصنيفات
          </button>
          {availableSections.map((sec) => {
            const isActive = selectedSection === sec.id
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => handleSectionChange(sec.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-[#2F3B27] text-white shadow-xs"
                    : "bg-white/80 text-stone-700 hover:bg-white border border-stone-200"
                }`}
              >
                {sec.name_ar}
              </button>
            )
          })}
        </div>
      </div>

      {/* 4. Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-300 bg-white/70 p-12 text-center my-8">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-stone-400">
            <Search size={24} />
          </div>
          <h3 className="text-base font-bold text-stone-800">لا توجد منتجات مطابقة</h3>
          <p className="mt-1 text-xs text-stone-500 max-w-sm mx-auto">
            {searchQuery
              ? `لم نعثر على أي صنف مطابق لـ "${searchQuery}". جرّب كلمة بحث أخرى أو أزل الفلاتر.`
              : "لا توجد منتجات في هذا التصنيف حالياً."}
          </p>
          {(searchQuery || selectedDept !== "all" || selectedSection !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("")
                setSelectedDept("all")
                setSelectedSection("all")
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition"
            >
              إعادة ضبط الفلاتر
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
          {paginatedProducts.map((product) => (
            <NeutralProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* 5. "عرض المزيد" Button (Pagination after 24 products) */}
      {hasMore && (
        <div className="pt-8 pb-4 text-center">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white hover:bg-stone-50 text-[#2F3B27] font-bold text-sm border border-[#2F3B27]/15 shadow-sm transition active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2F4A33]/30"
          >
            <span>عرض المزيد من الأصناف</span>
            <ChevronDown size={16} />
          </button>
          <div className="text-[11px] text-stone-600 mt-2 font-medium">
            يتم عرض {arNum.format(paginatedProducts.length)} من إجمالي {arNum.format(filteredProducts.length)} صنف
          </div>
        </div>
      )}
    </div>
  )
}
