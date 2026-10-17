"use client"

import React, { useEffect } from "react"
import { useSettingsStore } from "@/store/settings"

interface SlimFooterProps {
  initialAddress?: string
  initialAreas?: string[]
}

export default function SlimFooter({
  initialAddress,
  initialAreas,
}: SlimFooterProps) {
  const { settings, fetchSettings } = useSettingsStore()

  useEffect(() => {
    if (!initialAddress) {
      void fetchSettings()
    }
  }, [initialAddress, fetchSettings])

  const address = initialAddress || settings?.storeAddress || "أكتوبر – الحي المتميز – السياحية الأولى"
  
  const enabledAreas = initialAreas
    ? initialAreas
    : (settings?.serviceAreas || []).filter((a) => a?.enabled).map((a) => a.name)

  const areasString =
    enabledAreas.length > 0
      ? enabledAreas.join(" • ")
      : "أكتوبر – الحي المتميز • أكتوبر – غرب سوميد"

  return (
    <footer
      className="w-full border-t border-[#2F3B27]/10 bg-[#FFCED8]/95 py-2 px-3 text-center text-[11px] sm:text-xs text-[#2F3B27]/80 font-medium select-none z-20 shrink-0"
      dir="rtl"
    >
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-3 gap-y-0.5 leading-snug">
        <span>
          <strong className="text-[#2F3B27]">العنوان:</strong> {address}
        </span>
        <span className="text-[#2F3B27]/30 hidden sm:inline">•</span>
        <span>
          <strong className="text-[#2F3B27]">مناطق التوصيل:</strong> {areasString}
        </span>
      </div>
    </footer>
  )
}
