"use client"

import { create } from "zustand"
import type { StoreSettings } from "@/lib/db/types"

interface SettingsState {
  settings: StoreSettings
  isLoading: boolean
  fetchSettings: () => Promise<void>
}

const DEFAULT_SETTINGS: StoreSettings = {
  storeAddress: "أكتوبر – الحي المتميز – السياحية الأولى",
  serviceAreas: [
    { id: "area-1", name: "أكتوبر – الحي المتميز", enabled: true },
    { id: "area-2", name: "أكتوبر – غرب سوميد", enabled: true },
  ],
  whatsappNumber: "01224272991",
  freeDeliveryActive: false,
  freeDeliveryText: "التوصيل مجاني في عروض الافتتاح",
  walletNumber: "",
  walletLabel: "",
  instapayAddress: "",
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoading: false,
  fetchSettings: async () => {
    try {
      set({ isLoading: true })
      const res = await fetch("/api/settings")
      if (res.ok) {
        const data = await res.json()
        if (data.settings) {
          set({ settings: data.settings })
        }
      }
    } catch {
      // keep fallback
    } finally {
      set({ isLoading: false })
    }
  },
}))

export function useStoreSettings(): StoreSettings {
  const settings = useSettingsStore((s) => s.settings)
  const fetchSettings = useSettingsStore((s) => s.fetchSettings)

  // Fetch once if needed
  if (typeof window !== "undefined" && !useSettingsStore.getState().isLoading && settings === DEFAULT_SETTINGS) {
    void fetchSettings()
  }

  return settings
}
