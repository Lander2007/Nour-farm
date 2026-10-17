"use client"

import React, { useState, useMemo } from "react"
import {
  Search,
  X,
  SlidersHorizontal,
  Filter,
  RotateCcw,
  Tag,
  ChevronDown,
  Layers,
  ArrowUpDown,
} from "lucide-react"
import type { Product, Department, Section } from "@/lib/db/types"
import NeutralProductCard from "@/components/NeutralProductCard"

interface AllProductsCatalogProps {
  initialProducts: Product[]
  departments: Department[]
  sections: Section[]
}

const PAGE_SIZE = 24
const arNum = new Intl.NumberFormat("ar-EG")

type SortOption = "featured" | "price-asc" | "price-desc" | "name"

const PRICE_PRESETS = [
  { label: "كل الأسعار", min: 0, max: 99999 },
  { label: "أقل من ٢٥ ج.م", min: 0, max: 25 },
  { label: "من ٢٥ إلى ٥٠ ج.م", min: 25, max: 50 },
  { label: "من ٥٠ إلى ١٠٠ ج.م", min: 50, max: 100 },
  { label: "أكثر من ١٠٠ ج.م", min: 100, max: 99999 },
]

const TAG_PRESETS = [
  "الكل",
  "الأكثر طلباً",
  "طازج اليوم",
  "عضوي",
  "جاهز للطبخ",
  "سلطات",
]

export default function AllProductsCatalog({
  initialProducts,
  departments,
  sections,
}: AllProductsCatalogProps) {
  const [selectedDept, setSelectedDept] = useState<string>("all")
  const [selectedSection, setSelectedSection] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [sortBy, setSortBy] = useState<SortOption>("featured")
  const [pricePresetIdx, setPricePresetIdx] = useState<number>(0)
  const [minPrice, setMinPrice] = useState<number | "">("")
  const [maxPrice, setMaxPrice] = useState<number | "">("")
  const [selectedTag, setSelectedTag] = useState<string>("الكل")
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(true)
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

  // Reset all filters to default
  const resetAllFilters = () => {
    setSelectedDept("all")
    setSelectedSection("all")
    setSearchQuery("")
    setSortBy("featured")
    setPricePresetIdx(0)
    setMinPrice("")
    setMaxPrice("")
    setSelectedTag("الكل")
    setVisibleCount(PAGE_SIZE)
  }

  // Check if any filter is active
  const hasActiveFilters =
    selectedDept !== "all" ||
    selectedSection !== "all" ||
    searchQuery.trim() !== "" ||
    sortBy !== "featured" ||
    pricePresetIdx !== 0 ||
    minPrice !== "" ||
    maxPrice !== "" ||
    selectedTag !== "الكل"

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    const cleanSearch = searchQuery.trim().toLowerCase()

    const activeMin =
      minPrice !== "" ? Number(minPrice) : PRICE_PRESETS[pricePresetIdx].min
    const activeMax =
      maxPrice !== "" ? Number(maxPrice) : PRICE_PRESETS[pricePresetIdx].max

    return initialProducts
      .filter((p) => {
        // 1. Department filter
        const sec = sectionMap.get(p.section_id)
        const productDept =
          sec?.department_id ||
          (p.section_id.includes("fruit") ? "fruits" : "vegetables")

        if (selectedDept !== "all" && productDept !== selectedDept) {
          return false
        }

        // 2. Sub-section filter
        if (selectedSection !== "all" && p.section_id !== selectedSection) {
          return false
        }

        // 3. Price filter
        const price = p.price ?? 0
        if (price < activeMin || price > activeMax) {
          return false
        }

        // 4. Tag / Attribute filter
        if (selectedTag !== "الكل") {
          const matchTag =
            (p.pack_label || "").includes(selectedTag) ||
            p.name_ar.includes(selectedTag) ||
            (sec?.name_ar || "").includes(selectedTag)
          if (!matchTag) {
            return false
          }
        }

        // 5. Search filter
        if (cleanSearch) {
          const matchName = p.name_ar.toLowerCase().includes(cleanSearch)
          const matchSection = (sec?.name_ar || "")
            .toLowerCase()
            .includes(cleanSearch)
          const matchLabel = (p.pack_label || "")
            .toLowerCase()
            .includes(cleanSearch)
          if (!matchName && !matchSection && !matchLabel) {
            return false
          }
        }

        return true
      })
      .sort((a, b) => {
        // User explicit sort options
        if (sortBy === "price-asc") {
          return (a.price ?? 0) - (b.price ?? 0)
        }
        if (sortBy === "price-desc") {
          return (b.price ?? 0) - (a.price ?? 0)
        }
        if (sortBy === "name") {
          return a.name_ar.localeCompare(b.name_ar, "ar")
        }

        // Default 'featured': group by department then section then sort
        const secA = sectionMap.get(a.section_id)
        const secB = sectionMap.get(b.section_id)
        const deptA = secA?.department_id || ""
        const deptB = secB?.department_id || ""

        if (deptA !== deptB) {
          return deptA === "vegetables" ? -1 : 1
        }
        if (a.section_id !== b.section_id) {
          return a.section_id.localeCompare(b.section_id)
        }
        const sortA = (a as any).sort ?? (a as any).sort_order ?? 0
        const sortB = (b as any).sort ?? (b as any).sort_order ?? 0
        return sortA - sortB
      })
  }, [
    initialProducts,
    selectedDept,
    selectedSection,
    searchQuery,
    sortBy,
    pricePresetIdx,
    minPrice,
    maxPrice,
    selectedTag,
    sectionMap,
  ])

  // Paginated products
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount)
  }, [filteredProducts, visibleCount])

  const hasMore = visibleCount < filteredProducts.length

  return (
    <div className="w-full space-y-5">
      {/* 1. Search Bar & Controls Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Field */}
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="ابحث في جميع أصناف الخضار والفاكهة (طماطم، برتقال، نعناع...)"
            className="w-full pl-10 pr-10 py-3 bg-white border border-stone-200/90 rounded-2xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition shadow-xs"
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

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative inline-flex items-center">
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500">
              <SlidersHorizontal size={14} />
            </span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as SortOption)
                setVisibleCount(PAGE_SIZE)
              }}
              aria-label="ترتيب المنتجات"
              className="appearance-none bg-white border border-stone-200/90 text-stone-800 text-xs font-bold py-3 pr-8 pl-8 rounded-2xl shadow-xs hover:border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 cursor-pointer"
            >
              <option value="featured">ترتيب: الأكثر تميزاً</option>
              <option value="price-asc">السعر: من الأقل للأعلى</option>
              <option value="price-desc">السعر: من الأعلى للأقل</option>
              <option value="name">الاسم أبجدياً (أ - ي)</option>
            </select>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
              <ChevronDown size={14} />
            </span>
          </div>

          {/* Advanced Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-3 rounded-2xl text-xs font-bold border transition shadow-xs cursor-pointer ${
              showAdvancedFilters || pricePresetIdx !== 0 || minPrice !== "" || maxPrice !== "" || selectedTag !== "الكل"
                ? "bg-[#D9788C] text-white border-[#D9788C]"
                : "bg-white text-stone-700 hover:bg-stone-50 border-stone-200/90"
            }`}
            title="تصفية إضافية بالسعر والسمات"
          >
            <Filter size={14} />
            <span>تصفية</span>
            {(pricePresetIdx !== 0 || minPrice !== "" || maxPrice !== "" || selectedTag !== "الكل") && (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>
        </div>
      </div>

      {/* 2. Department Filter Chips: الكل | الخضار | الفاكهة */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-stone-800 shrink-0 ml-1">القسم:</span>
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
                    ? "bg-[#D9788C] text-white shadow-sm ring-2 ring-[#D9788C]/20"
                    : "bg-white text-stone-700 hover:bg-stone-50 border border-stone-200/90 shadow-xs"
                }`}
              >
                {chip.label}
              </button>
            )
          })}
        </div>

        {/* 3. Sub-section Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none pt-0.5">
          <span className="text-xs font-bold text-stone-800 shrink-0 ml-1">التصنيف:</span>
          <button
            type="button"
            onClick={() => handleSectionChange("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedSection === "all"
                ? "bg-[#D9788C] text-white shadow-xs"
                : "bg-white/85 text-stone-700 hover:bg-white border border-stone-200/80 shadow-2xs"
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
                    ? "bg-[#D9788C] text-white shadow-xs"
                    : "bg-white/85 text-stone-700 hover:bg-white border border-stone-200/80 shadow-2xs"
                }`}
              >
                {sec.name_ar}
              </button>
            )
          })}
        </div>
      </div>

      {/* 4. Advanced Filters Panel (Collapsible / Expandable) */}
      {showAdvancedFilters && (
        <div className="bg-white/90 backdrop-blur-xs border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <Filter size={14} className="text-[#D9788C]" />
              <span>فلاتر متقدمة (السعر والسمات)</span>
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>إعادة ضبط الكل</span>
              </button>
            )}
          </div>

          {/* Price Filter Presets */}
          <div>
            <span className="text-[11px] font-bold text-stone-600 block mb-2">
              نطاق السعر:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRICE_PRESETS.map((preset, idx) => {
                const isActive =
                  pricePresetIdx === idx && minPrice === "" && maxPrice === ""
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setPricePresetIdx(idx)
                      setMinPrice("")
                      setMaxPrice("")
                      setVisibleCount(PAGE_SIZE)
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      isActive
                        ? "bg-[#D9788C] text-white shadow-xs"
                        : "bg-stone-100 hover:bg-stone-200/80 text-stone-700 border border-stone-200/50"
                    }`}
                  >
                    {preset.label}
                  </button>
                )
              })}
            </div>

            {/* Custom Price Range Input */}
            <div className="flex items-center gap-2 mt-3 text-xs text-stone-600 font-medium">
              <span>سعر مخصص:</span>
              <input
                type="number"
                min={0}
                placeholder="من"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value === "" ? "" : Number(e.target.value))
                  setVisibleCount(PAGE_SIZE)
                }}
                className="w-20 px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-[#D9788C] text-center"
              />
              <span>إلى</span>
              <input
                type="number"
                min={0}
                placeholder="إلى"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))
                  setVisibleCount(PAGE_SIZE)
                }}
                className="w-20 px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-[#D9788C] text-center"
              />
              <span>ج.م</span>
            </div>
          </div>

          {/* Tag Filter */}
          <div>
            <span className="text-[11px] font-bold text-stone-600 block mb-2">
              السمات والمميزات:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {TAG_PRESETS.map((t) => {
                const isActive = selectedTag === t
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setSelectedTag(t)
                      setVisibleCount(PAGE_SIZE)
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      isActive
                        ? "bg-[#D9788C] text-white shadow-xs"
                        : "bg-stone-100 hover:bg-stone-200/80 text-stone-700 border border-stone-200/50"
                    }`}
                  >
                    {t}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. Summary Count & Reset Link */}
      <div className="flex items-center justify-between text-xs text-stone-700 px-1 pt-1">
        <span className="font-bold">
          متاح {arNum.format(filteredProducts.length)} صنف مطابق
        </span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetAllFilters}
            className="text-xs text-rose-600 hover:text-rose-700 font-bold inline-flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>مسح جميع الفلاتر</span>
          </button>
        )}
      </div>

      {/* 6. Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-300 bg-white/70 p-12 text-center my-8 shadow-xs">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-stone-400">
            <Search size={24} />
          </div>
          <h3 className="text-base font-bold text-stone-800">لا توجد منتجات مطابقة</h3>
          <p className="mt-1 text-xs text-stone-500 max-w-sm mx-auto">
            {searchQuery
              ? `لم نعثر على أي صنف مطابق لـ "${searchQuery}". جرّب كلمة بحث أخرى أو أزل بعض الفلاتر.`
              : "لا توجد منتجات تطابق اختياراتك الحالية من الأقسام والأسعار."}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="mt-4 px-4 py-2 rounded-xl bg-[#D9788C] hover:bg-[#ce6a7e] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              إعادة ضبط جميع الفلاتر
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

      {/* 7. "عرض المزيد" Button (Pagination after 24 products) */}
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
