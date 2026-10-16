"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import { MapPin, Navigation, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

export interface LocationData {
  lat: number
  lng: number
  source: "gps" | "pin"
  address_text?: string
}

interface LeafletLocationPickerProps {
  onLocationSelect: (location: LocationData | null) => void
  initialLocation?: LocationData | null
  height?: string
}

import { isWithinEgypt } from "@/lib/utils/geo"

const POPULAR_DISTRICTS = [
  { name: "المعادي", lat: 29.9602, lng: 31.2569 },
  { name: "التجمع الخامس", lat: 30.0074, lng: 31.4285 },
  { name: "الشيخ زايد", lat: 30.0543, lng: 30.9829 },
  { name: "مصر الجديدة", lat: 30.0889, lng: 31.3285 },
  { name: "الدقي والمهندسين", lat: 30.0384, lng: 31.2119 },
  { name: "مدينة ٦ أكتوبر", lat: 29.9723, lng: 30.9416 },
  { name: "الزمالك", lat: 30.0609, lng: 31.2198 },
  { name: "مدينة نصر", lat: 30.0566, lng: 31.3431 },
]

export default function LeafletLocationPicker({
  onLocationSelect,
  initialLocation,
  height = "380px",
}: LeafletLocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [currentLoc, setCurrentLoc] = useState<LocationData | null>(initialLocation || null)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsError, setGpsError] = useState<string | null>(null)
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false)
  const [resolvedAddress, setResolvedAddress] = useState<string>(
    initialLocation?.address_text || ""
  )
  const [resolvingAddress, setResolvingAddress] = useState(false)

  // Reverse geocode via Nominatim OSM
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      setResolvingAddress(true)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`,
        { headers: { "User-Agent": "NoorFarm-EgyptDelivery/2.0" } }
      )
      if (res.ok) {
        const data = await res.json()
        if (data && data.display_name) {
          const parts = data.display_name.split(",").slice(0, 4).join("،")
          setResolvedAddress(parts)
          return parts
        }
      }
    } catch {
      // Ignore network geocoding errors gracefully
    } finally {
      setResolvingAddress(false)
    }
    return ""
  }, [])

  // Update pin and trigger callback
  const handleCoordUpdate = useCallback(
    async (lat: number, lng: number, source: "gps" | "pin") => {
      setGpsError(null)

      if (!isWithinEgypt(lat, lng)) {
        setGpsError("الموقع المختار خارج جمهورية مصر العربية. برجاء اختيار موقع داخل مصر.")
        setCurrentLoc(null)
        onLocationSelect(null)
        return
      }

      const addressText = await reverseGeocode(lat, lng)
      const loc: LocationData = {
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6)),
        source,
        address_text: addressText || `موقع محدد (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      }
      setCurrentLoc(loc)
      onLocationSelect(loc)
    },
    [onLocationSelect, reverseGeocode]
  )

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true

    const initMap = async () => {
      if (typeof window === "undefined" || !mapContainerRef.current) return

      // Load Leaflet CSS dynamically if not present
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link")
        link.id = "leaflet-css"
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)
      }

      const L = await import("leaflet")
      if (!isMounted || !mapContainerRef.current) return

      // Create Custom SVG Pin Icon
      const customPinSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 48" width="36" height="48">
          <filter id="shadow" x="-20%" y="-10%" width="140%" height="130%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity="0.35"/>
          </filter>
          <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 30 18 30s18-16.5 18-30C36 8.06 27.94 0 18 0z" fill="#2e7d32" filter="url(#shadow)"/>
          <circle cx="18" cy="18" r="7" fill="#ffffff"/>
          <circle cx="18" cy="18" r="3.5" fill="#1b5e20"/>
        </svg>
      `
      const pinIcon = L.divIcon({
        className: "custom-leaflet-pin",
        html: customPinSvg,
        iconSize: [36, 48],
        iconAnchor: [18, 48],
      })

      const defaultLat = initialLocation?.lat || 30.0444
      const defaultLng = initialLocation?.lng || 31.2357

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }

      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: initialLocation ? 15 : 12,
        zoomControl: true,
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      // Add draggable pin
      const marker = L.marker([defaultLat, defaultLng], {
        icon: pinIcon,
        draggable: true,
      }).addTo(map)

      marker.on("dragend", () => {
        const pos = marker.getLatLng()
        handleCoordUpdate(pos.lat, pos.lng, "pin")
      })

      map.on("click", (e: any) => {
        marker.setLatLng(e.latlng)
        handleCoordUpdate(e.latlng.lat, e.latlng.lng, "pin")
      })

      mapInstanceRef.current = map
      markerRef.current = marker
      setIsLeafletLoaded(true)

      // If initial location was passed, update once
      if (initialLocation) {
        handleCoordUpdate(initialLocation.lat, initialLocation.lng, initialLocation.source)
      }
    }

    initMap()

    return () => {
      isMounted = false
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle GPS detection
  const handleGpsDetect = () => {
    if (!navigator.geolocation) {
      setGpsError("خاصية تحديد الموقع غير مدعومة في متصفحك.")
      return
    }

    setGpsLoading(true)
    setGpsError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false)
        const { latitude, longitude } = pos.coords

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 16, { animate: true, duration: 1 })
          markerRef.current.setLatLng([latitude, longitude])
        }
        handleCoordUpdate(latitude, longitude, "gps")
      },
      (err) => {
        setGpsLoading(false)
        console.warn("Geolocation error:", err)
        if (err.code === 1) {
          setGpsError("تم رفض إذن تحديد الموقع. برجاء تفعيل الموقع في إعدادات متصفحك أو اختيار النقطة يدوياً على الخريطة.")
        } else {
          setGpsError("تعذر التقاط الموقع بدقة عبر GPS. برجاء الضغط على الخريطة لتحديد مكانك.")
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  // Handle District Presets
  const handleSelectDistrict = (d: (typeof POPULAR_DISTRICTS)[0]) => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.flyTo([d.lat, d.lng], 15, { animate: true, duration: 0.8 })
      markerRef.current.setLatLng([d.lat, d.lng])
    }
    handleCoordUpdate(d.lat, d.lng, "pin")
  }

  return (
    <div className="leaflet-picker-wrapper space-y-3">
      {/* Header and GPS button */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-700" />
          <span className="font-bold text-gray-900 text-sm md:text-base">
            تحديد موقع التوصيل على الخريطة
          </span>
          <span className="bg-rose-100 text-rose-800 text-xs px-2 py-0.5 rounded-full font-bold">
            إلزامي
          </span>
        </div>

        <button
          type="button"
          onClick={handleGpsDetect}
          disabled={gpsLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 text-xs md:text-sm font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
        >
          {gpsLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
          ) : (
            <Navigation className="w-4 h-4 text-emerald-700" />
          )}
          <span>تحديد موقعي الحالي عبر GPS</span>
        </button>
      </div>

      {/* GPS or Bounds Error Notice */}
      {gpsError && (
        <div className="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs md:text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* District Quick Select Buttons */}
      <div className="space-y-1.5">
        <span className="text-xs text-gray-500 font-medium">أو اختر من المناطق السريعة:</span>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_DISTRICTS.map((d) => (
            <button
              key={d.name}
              type="button"
              onClick={() => handleSelectDistrict(d)}
              className="text-xs px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition font-medium cursor-pointer"
            >
              {d.name}
            </button>
          ))}
        </div>
      </div>

      {/* Leaflet Map Canvas Container */}
      <div
        className="relative w-full rounded-xl overflow-hidden border border-gray-300 shadow-inner bg-stone-100"
        style={{ height }}
      >
        <div ref={mapContainerRef} className="w-full h-full" />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px] text-gray-600 font-medium shadow-sm z-[1000] pointer-events-none">
          اسحب الدبوس أو اضغط على الخريطة لتحديد عنوانك بدقة
        </div>
      </div>

      {/* Selected Location State Banner */}
      {currentLoc ? (
        <div className="flex items-start gap-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-xs md:text-sm">
            <span className="font-bold block text-emerald-800">
              تم تحديد موقع التوصيل بنجاح ({currentLoc.source === "gps" ? "عبر GPS" : "تحديد يدوي"})
            </span>
            <p className="text-gray-700 mt-0.5">
              {resolvingAddress ? (
                <span className="text-gray-500">جاري قراءة تفاصيل المنطقة...</span>
              ) : (
                resolvedAddress || `إحداثيات: ${currentLoc.lat}, ${currentLoc.lng}`
              )}
            </p>
            <span className="text-[11px] text-gray-400 font-mono block mt-0.5">
              {currentLoc.lat}, {currentLoc.lng}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs md:text-sm">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            برجاء الضغط على الخريطة أو زر GPS لتحديد موقع التوصيل لتفعيل زر تأكيد الطلب.
          </span>
        </div>
      )}
    </div>
  )
}
