"use client"

// Define libraries array outside components to prevent reload loops

// Default fallback coordinate (Cairo, Egypt)
/** Callback triggered when a location is selected or resolved */
/** Optional initial coordinates */
/** Custom container class */
/** Height of the map area (default: 380px) */

/* ═══════════════════════════════════════════════════════════════════
   1. FALLBACK LOCATION PICKER (Zero Google Maps API Calls / Zero Key Errors)
   ═══════════════════════════════════════════════════════════════════ */

// Native device geolocation (does not use or require Google Maps API)

// Interactive canvas click handler to place pin

// Simulate minor coordinate displacement based on click
/* Header & Device GPS Detect Action */ /* Geolocation notice */ /* Visual Interactive Map Canvas Preview */ /* Subtle grid & road map simulation lines */ /* Dynamic Positioned Pin */ /* Coordinates indicator at bottom corner */ /* Quick Egyptian District Presets */ /* Manual Detailed Address Input */ /* Active Address Confirmation Banner */

/* ═══════════════════════════════════════════════════════════════════
   2. LOADED GOOGLE MAP (Active only when Google Maps API key is loaded)
   ═══════════════════════════════════════════════════════════════════ */

// Safe Reverse Geocoding with google.maps.Geocoder

// User Geolocation Detector

// Auto-detect location or resolve initial coordinates on mount
/* Header & Detect Location Action */ /* Geolocation Notice (if denied or error) */ /* Interactive Google Map Area */ /* Resolved Address Preview Box */

/* ═══════════════════════════════════════════════════════════════════
   3. GOOGLE MAPS SCRIPT LOADER WRAPPER
   Only mounts when a non-empty API key is available.
   ═══════════════════════════════════════════════════════════════════ */

// If Google Maps fails to load or script errors occur, fall back smoothly

// Loading skeleton while Google Maps script is downloading

/* ═══════════════════════════════════════════════════════════════════
   4. PRIMARY EXPORT: LocationPicker
   Conditionally renders:
   - FallbackLocationPicker if NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is unset or empty
     (Guarantees zero unauthenticated Google Maps calls & zero console errors)
   - GoogleMapLocationPickerInner if a valid API key is present
   ═══════════════════════════════════════════════════════════════════ */

// When no API key is provided, never invoke useJsApiLoader or Geocoder

import React, { useState, useEffect, useCallback, useRef } from "react"
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api"
import {
  MapPin,
  Navigation,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = [
  "places",
]
const DEFAULT_CENTER = {
  lat: 30.0444,
  lng: 31.2357,
}

const POPULAR_DISTRICTS = [
  { name: "المعادي، القاهرة", lat: 29.9602, lng: 31.2569 },
  { name: "التجمع الخامس، القاهرة الجديدة", lat: 30.0074, lng: 31.4285 },
  { name: "الشيخ زايد، الجيزة", lat: 30.0543, lng: 30.9829 },
  { name: "مصر الجديدة، القاهرة", lat: 30.0889, lng: 31.3285 },
  { name: "الدقي والمهندسين، الجيزة", lat: 30.0384, lng: 31.2119 },
  { name: "مدينة ٦ أكتوبر، الجيزة", lat: 29.9723, lng: 30.9416 },
  { name: "الزمالك، القاهرة", lat: 30.0609, lng: 31.2198 },
  { name: "مدينة نصر، القاهرة", lat: 30.0566, lng: 31.3431 },
]

const mapContainerStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  minHeight: "380px",
  borderRadius: "0.75rem",
}

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  gestureHandling: "greedy",
}

export interface LocationData {
  lat: number
  lng: number
  address: string
}

export interface LocationPickerProps {
  onLocationSelect?: (location: LocationData) => void
  initialLocation?: { lat: number; lng: number }
  className?: string
  height?: string
}
function FallbackLocationPicker({
  onLocationSelect,
  initialLocation,
  className = "",
}: LocationPickerProps) {
  const [markerPosition, setMarkerPosition] = useState<{
    lat: number
    lng: number
  }>(
    initialLocation ||
      DEFAULT_CENTER,
  )
  const [address, setAddress] = useState<string>("")
  const [isLocating, setIsLocating] = useState<boolean>(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [pinOffset, setPinOffset] = useState<{ x: number; y: number }>({
    x: 50,
    y: 50,
  })
  const detectCurrentLocation = useCallback(() => {
    if (
      typeof window ===
        "undefined" ||
      !navigator.geolocation
    ) {
      setGeoError("خاصية تحديد الموقع الجغرافي غير مدعومة في متصفحك.")
      return
    }

    setIsLocating(true)
    setGeoError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false)
        const userCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setMarkerPosition(userCoords)
        setPinOffset({ x: 50, y: 50 })

        const locLabel = `الموقع الحالي عبر GPS (${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)})`
        setAddress(locLabel)
        onLocationSelect?.({
          lat: userCoords.lat,
          lng: userCoords.lng,
          address: locLabel,
        })
      },
      (error) => {
        setIsLocating(false)
        let msg =
          "تعذر تحديد موقعك الحالي تلقائياً. يرجى اختيار منطقتك من القائمة أدناه."
        if (
          error.code ===
          error.PERMISSION_DENIED
        ) {
          msg =
            "تم رفض إذن الوصول للموقع في المتصفح. يمكنك اختيار منطقتك بسهولة أدناه."
        }
        setGeoError(msg)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }, [onLocationSelect])
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const xPct = Math.max(
      10,
      Math.min(90, ((e.clientX - rect.left) / rect.width) * 100),
    )
    const yPct = Math.max(
      15,
      Math.min(85, ((e.clientY - rect.top) / rect.height) * 100),
    )
    setPinOffset({ x: xPct, y: yPct })
    const dLat = (50 - yPct) * 0.002
    const dLng = (xPct - 50) * 0.002
    const newCoords = {
      lat: Number(
        (
          DEFAULT_CENTER.lat +
          dLat
        ).toFixed(5),
      ),
      lng: Number(
        (
          DEFAULT_CENTER.lng +
          dLng
        ).toFixed(5),
      ),
    }
    setMarkerPosition(newCoords)

    const updatedAddr =
      address ||
      "موقع محدد على الخريطة"
    onLocationSelect?.({
      lat: newCoords.lat,
      lng: newCoords.lng,
      address: updatedAddr,
    })
  }

  return (
    <div
      style={{
        width: "100%",
        background: "var(--white)",
        border: "1.5px solid var(--line)",
        borderRadius: "1rem",
        padding: "1.5rem",
        boxShadow: "var(--shadow-subtle)",
      }}
      className={className}
    >
      {}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
          marginBottom: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <div
            style={{
              width: "2.2rem",
              height: "2.2rem",
              borderRadius: "50%",
              background: "var(--cream)",
              color: "var(--forest)",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <MapPin style={{ width: "1.2rem", height: "1.2rem" }} />
          </div>
          <div>
            <h3
              style={{
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "var(--ink)",
                margin: 0,
              }}
            >
              تحديد عنوان وموقع التوصيل
            </h3>
            <p
              style={{
                fontSize: "0.78rem",
                color: "var(--ink)",
                opacity: 0.7,
                margin: "0.15rem 0 0",
              }}
            >
              اختر منطقتك من القائمة أو حدد موقعك الحالي بالـ GPS
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={detectCurrentLocation}
          disabled={isLocating}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.45rem 0.85rem",
            borderRadius: "0.6rem",
            border: "1.5px solid var(--line-strong)",
            background: "var(--cream-surface)",
            color: "var(--forest)",
            fontSize: "0.78rem",
            fontWeight: 700,
            cursor: isLocating ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
          }}
        >
          {isLocating ? (
            <Loader2
              style={{
                width: "0.95rem",
                height: "0.95rem",
                animation: "spin 1s linear infinite",
              }}
            />
          ) : (
            <Navigation style={{ width: "0.95rem", height: "0.95rem" }} />
          )}
          <span>
            {isLocating ? "جاري التحديد..." : "تحديد موقعي الحالي (GPS)"}
          </span>
        </button>
      </div>

      {}
      {geoError && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "0.65rem 0.85rem",
            borderRadius: "0.65rem",
            border: "1px solid rgba(216, 64, 47, 0.25)",
            background: "rgba(216, 64, 47, 0.05)",
            fontSize: "0.78rem",
            color: "var(--tomato)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <AlertCircle
            style={{ width: "1rem", height: "1rem", flexShrink: 0 }}
          />
          <span>{geoError}</span>
        </div>
      )}

      {}
      <div
        onClick={handleCanvasClick}
        title="اضغط لتغيير موقع التوصيل على الخريطة"
        style={{
          position: "relative",
          width: "100%",
          height: "230px",
          background:
            "linear-gradient(135deg, #eef3ea 0%, #dfeade 50%, #d5e4d3 100%)",
          borderRadius: "0.85rem",
          border: "1.5px solid var(--line)",
          overflow: "hidden",
          cursor: "crosshair",
          marginBottom: "1.25rem",
          userSelect: "none",
        }}
      >
        {}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.25,
            backgroundImage:
              "radial-gradient(#55704a 1.5px, transparent 1.5px), radial-gradient(#55704a 1.5px, #eef3ea 1.5px)",
            backgroundSize: "36px 36px",
            backgroundPosition: "0 0, 18px 18px",
          }}
        />
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0.35,
            pointerEvents: "none",
          }}
        >
          <line
            x1="0"
            y1="30%"
            x2="100%"
            y2="70%"
            stroke="#fff"
            strokeWidth="8"
          />
          <line
            x1="20%"
            y1="0"
            x2="80%"
            y2="100%"
            stroke="#fff"
            strokeWidth="6"
          />
          <circle
            cx="50%"
            cy="50%"
            r="65"
            fill="none"
            stroke="rgba(216, 64, 47, 0.25)"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        </svg>

        {}
        <div
          style={{
            position: "absolute",
            left: `${pinOffset.x}%`,
            top: `${pinOffset.y}%`,
            transform: "translate(-50%, -100%)",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            filter: "drop-shadow(0 6px 12px rgba(47, 59, 39, 0.25))",
            transition: "left 0.3s ease, top 0.3s ease",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: "2.6rem",
              height: "2.6rem",
              borderRadius: "50%",
              background: "var(--tomato)",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 4px 14px rgba(216, 64, 47, 0.4)",
            }}
          >
            <MapPin style={{ width: "1.4rem", height: "1.4rem" }} />
          </div>
          <div
            style={{
              background: "var(--ink)",
              color: "var(--cream)",
              fontSize: "0.72rem",
              fontWeight: 700,
              padding: "0.25rem 0.65rem",
              borderRadius: "2rem",
              marginTop: "0.4rem",
              whiteSpace: "nowrap",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              maxWidth: "220px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {address ||
              "القاهرة، مصر (اضغط لتغيير الموقع)"}
          </div>
        </div>

        {}
        <div
          style={{
            position: "absolute",
            bottom: "8px",
            right: "10px",
            background: "rgba(255,255,255,0.85)",
            padding: "0.2rem 0.5rem",
            borderRadius: "0.4rem",
            fontSize: "0.68rem",
            fontFamily: "monospace",
            color: "var(--ink)",
            backdropFilter: "blur(4px)",
            pointerEvents: "none",
          }}
        >
          {markerPosition.lat.toFixed(4)}, {markerPosition.lng.toFixed(4)}
        </div>
      </div>

      {}
      <div style={{ marginBottom: "1.25rem" }}>
        <span
          style={{
            display: "block",
            fontSize: "0.82rem",
            fontWeight: 700,
            color: "var(--ink)",
            marginBottom: "0.6rem",
          }}
        >
          اختر المنطقة الأقرب لك في القاهرة والجيزة:
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {POPULAR_DISTRICTS.map((d) => {
            const isSelected = address.includes(d.name)
            return (
              <button
                key={d.name}
                type="button"
                onClick={() => {
                  setAddress(d.name)
                  setMarkerPosition({ lat: d.lat, lng: d.lng })
                  setPinOffset({ x: 50, y: 50 })
                  onLocationSelect?.({
                    lat: d.lat,
                    lng: d.lng,
                    address: d.name,
                  })
                }}
                style={{
                  fontSize: "0.78rem",
                  padding: "0.45rem 0.85rem",
                  borderRadius: "0.6rem",
                  border: isSelected
                    ? "1.5px solid var(--forest)"
                    : "1.5px solid var(--line)",
                  background: isSelected
                    ? "var(--forest)"
                    : "var(--cream-surface)",
                  color: isSelected ? "var(--cream)" : "var(--ink)",
                  fontWeight: isSelected ? 700 : 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {d.name}
              </button>
            )
          })}
        </div>
      </div>

      {}
      <div>
        <label
          style={{
            display: "block",
            fontSize: "0.82rem",
            fontWeight: 700,
            color: "var(--ink)",
            marginBottom: "0.45rem",
          }}
        >
          العنوان بالتفصيل (اسم الشارع، رقم العمارة، وأقرب علامة مميزة):
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => {
            const val = e.target.value
            setAddress(val)
            onLocationSelect?.({
              lat: markerPosition.lat,
              lng: markerPosition.lng,
              address: val,
            })
          }}
          placeholder="مثال: شارع ٩، المعادي، بجوار محطة المترو، عمارة ٤..."
          style={{
            width: "100%",
            borderRadius: "0.75rem",
            border: "1.5px solid var(--line-strong)",
            padding: "0.85rem 1rem",
            fontSize: "0.92rem",
            background: "#ffffff",
            color: "var(--ink)",
            outline: "none",
          }}
        />
      </div>

      {}
      {address && (
        <div
          style={{
            marginTop: "1rem",
            borderRadius: "0.75rem",
            border: "1px solid rgba(85, 112, 74, 0.3)",
            background: "rgba(85, 112, 74, 0.08)",
            padding: "0.75rem 1rem",
            fontSize: "0.82rem",
            color: "var(--forest)",
            display: "flex",
            alignItems: "center",
            gap: "0.65rem",
          }}
        >
          <CheckCircle2
            style={{
              width: "1.1rem",
              height: "1.1rem",
              color: "var(--forest)",
              flexShrink: 0,
            }}
          />
          <span>
            العنوان المعتمد للطلب: <strong>{address}</strong>
          </span>
        </div>
      )}
    </div>
  )
}
function LoadedGoogleMap({
  onLocationSelect,
  initialLocation,
  className = "",
  height = "380px",
}: LocationPickerProps) {
  const [center, setCenter] = useState<{ lat: number; lng: number }>(
    initialLocation ||
      DEFAULT_CENTER,
  )
  const [markerPosition, setMarkerPosition] = useState<{
    lat: number
    lng: number
  }>(
    initialLocation ||
      DEFAULT_CENTER,
  )
  const [address, setAddress] = useState<string>("")
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false)
  const [isLocating, setIsLocating] = useState<boolean>(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  const mapRef = useRef<google.maps.Map | null>(null)
  const reverseGeocode = useCallback(
    (coords: { lat: number; lng: number }) => {
      if (
        typeof window ===
          "undefined" ||
        !window.google?.maps?.Geocoder
      ) {
        const fallbackStr = `Lat: ${coords.lat.toFixed(5)}, Lng: ${coords.lng.toFixed(5)}`
        setAddress(fallbackStr)
        onLocationSelect?.({
          lat: coords.lat,
          lng: coords.lng,
          address: fallbackStr,
        })
        return
      }

      setIsGeocoding(true)
      setGeoError(null)

      try {
        const geocoder = new google.maps.Geocoder()
        geocoder.geocode({ location: coords }, (results, status) => {
          setIsGeocoding(false)
          if (
            status ===
              google.maps.GeocoderStatus.OK &&
            results &&
            results[0]
          ) {
            const formattedAddress = results[0].formatted_address
            setAddress(formattedAddress)
            onLocationSelect?.({
              lat: coords.lat,
              lng: coords.lng,
              address: formattedAddress,
            })
          } else {
            const fallbackStr = `Lat: ${coords.lat.toFixed(5)}, Lng: ${coords.lng.toFixed(5)}`
            setAddress(fallbackStr)
            onLocationSelect?.({
              lat: coords.lat,
              lng: coords.lng,
              address: fallbackStr,
            })
          }
        })
      } catch {
        setIsGeocoding(false)
        const fallbackStr = `Lat: ${coords.lat.toFixed(5)}, Lng: ${coords.lng.toFixed(5)}`
        setAddress(fallbackStr)
        onLocationSelect?.({
          lat: coords.lat,
          lng: coords.lng,
          address: fallbackStr,
        })
      }
    },
    [onLocationSelect],
  )
  const detectCurrentLocation = useCallback(() => {
    if (
      typeof window ===
        "undefined" ||
      !navigator.geolocation
    ) {
      setGeoError("خاصية تحديد الموقع الجغرافي غير مدعومة في متصفحك.")
      return
    }

    setIsLocating(true)
    setGeoError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false)
        const userCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }

        setCenter(userCoords)
        setMarkerPosition(userCoords)

        if (mapRef.current) {
          mapRef.current.panTo(userCoords)
          mapRef.current.setZoom(16)
        }

        reverseGeocode(userCoords)
      },
      (error) => {
        setIsLocating(false)
        let msg =
          "تعذر تحديد موقعك الحالي تلقائياً. يرجى تحديد موقعك على الخريطة."
        if (
          error.code ===
          error.PERMISSION_DENIED
        ) {
          msg = "تم رفض إذن الوصول للموقع. يمكنك سحب المؤشر لتحديد موقعك يدوياً."
        }
        setGeoError(msg)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }, [reverseGeocode])
  useEffect(() => {
    if (initialLocation) {
      reverseGeocode(initialLocation)
    } else {
      detectCurrentLocation()
    }
  }, [detectCurrentLocation, initialLocation, reverseGeocode])

  const handleMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return
      const newPos = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      }
      setMarkerPosition(newPos)
      reverseGeocode(newPos)
    },
    [reverseGeocode],
  )

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return
      const newPos = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      }
      setMarkerPosition(newPos)
      reverseGeocode(newPos)
    },
    [reverseGeocode],
  )

  const onMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map
      if (!address) {
        reverseGeocode(center)
      }
    },
    [address, center, reverseGeocode],
  )

  return (
    <div
      style={{
        width: "100%",
        background: "var(--white)",
        border: "1.5px solid var(--line)",
        borderRadius: "1rem",
        padding: "1.25rem",
        boxShadow: "var(--shadow-subtle)",
      }}
      className={className}
    >
      {}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
          marginBottom: "0.85rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div
            style={{
              width: "2.2rem",
              height: "2.2rem",
              borderRadius: "50%",
              background: "var(--cream)",
              color: "var(--forest)",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <MapPin style={{ width: "1.2rem", height: "1.2rem" }} />
          </div>
          <div>
            <h3
              style={{
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "var(--ink)",
                margin: 0,
              }}
            >
              موقع التوصيل على الخريطة
            </h3>
            <p
              style={{
                fontSize: "0.78rem",
                color: "var(--ink)",
                opacity: 0.7,
                margin: "0.15rem 0 0",
              }}
            >
              اسحب المؤشر أو اضغط على الخريطة لتحديد مكانك بدقة
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={detectCurrentLocation}
          disabled={isLocating}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.45rem 0.85rem",
            borderRadius: "0.6rem",
            border: "1.5px solid var(--line-strong)",
            background: "var(--cream-surface)",
            color: "var(--forest)",
            fontSize: "0.78rem",
            fontWeight: 700,
            cursor: isLocating ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
          }}
        >
          {isLocating ? (
            <Loader2
              style={{
                width: "0.95rem",
                height: "0.95rem",
                animation: "spin 1s linear infinite",
              }}
            />
          ) : (
            <Navigation style={{ width: "0.95rem", height: "0.95rem" }} />
          )}
          <span>
            {isLocating ? "جاري التحديد..." : "تحديد موقعي الحالي (GPS)"}
          </span>
        </button>
      </div>

      {}
      {geoError && (
        <div
          style={{
            marginBottom: "0.75rem",
            padding: "0.65rem 0.85rem",
            borderRadius: "0.65rem",
            border: "1px solid rgba(216, 64, 47, 0.25)",
            background: "rgba(216, 64, 47, 0.05)",
            fontSize: "0.78rem",
            color: "var(--tomato)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <AlertCircle
            style={{ width: "1rem", height: "1rem", flexShrink: 0 }}
          />
          <span>{geoError}</span>
        </div>
      )}

      {}
      <div
        style={{
          height,
          position: "relative",
          width: "100%",
          borderRadius: "0.85rem",
          overflow: "hidden",
          border: "1.5px solid var(--line)",
        }}
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={15}
          options={mapOptions}
          onClick={handleMapClick}
          onLoad={onMapLoad}
        >
          <MarkerF
            position={markerPosition}
            draggable={true}
            onDragEnd={handleMarkerDragEnd}
            animation={google.maps.Animation.DROP}
          />
        </GoogleMap>
      </div>

      {}
      <div
        style={{
          marginTop: "0.85rem",
          borderRadius: "0.75rem",
          background: "var(--cream-surface)",
          border: "1px solid var(--line)",
          padding: "0.85rem 1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <div style={{ flexShrink: 0 }}>
          {isGeocoding ? (
            <Loader2
              style={{
                width: "1.1rem",
                height: "1.1rem",
                color: "var(--forest)",
                animation: "spin 1s linear infinite",
              }}
            />
          ) : (
            <CheckCircle2
              style={{
                width: "1.1rem",
                height: "1.1rem",
                color: "var(--forest)",
              }}
            />
          )}
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "var(--forest)",
                letterSpacing: "0.03em",
              }}
            >
              الإحداثيات المحددة
            </span>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "0.72rem",
                color: "var(--ink)",
                opacity: 0.6,
              }}
            >
              ({markerPosition.lat.toFixed(4)}, {markerPosition.lng.toFixed(4)})
            </span>
          </div>

          <p
            style={{
              margin: "0.2rem 0 0",
              fontSize: "0.88rem",
              fontWeight: 600,
              color: "var(--ink)",
            }}
          >
            {isGeocoding ? (
              <span style={{ opacity: 0.7 }}>
                جاري استخراج تفاصيل العنوان...
              </span>
            ) : (
              address ||
              "اضغط على الخريطة أو اسحب المؤشر لتحديد العنوان"
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
function GoogleMapLocationPickerInner({
  apiKey,
  onLocationSelect,
  initialLocation,
  className = "",
  height = "380px",
}: LocationPickerProps & { apiKey: string }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey,
    libraries,
  })
  if (loadError) {
    return (
      <FallbackLocationPicker
        onLocationSelect={onLocationSelect}
        initialLocation={initialLocation}
        className={className}
        height={height}
      />
    )
  }
  if (!isLoaded) {
    return (
      <div
        style={{
          width: "100%",
          borderRadius: "1rem",
          border: "1.5px solid var(--line)",
          background: "var(--white)",
          padding: "1.25rem",
          boxShadow: "var(--shadow-subtle)",
        }}
        className={className}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              width: "160px",
              height: "1.2rem",
              background: "var(--cream)",
              borderRadius: "0.5rem",
            }}
          />
          <div
            style={{
              width: "120px",
              height: "2rem",
              background: "var(--cream)",
              borderRadius: "0.5rem",
            }}
          />
        </div>
        <div
          style={{
            height,
            width: "100%",
            borderRadius: "0.85rem",
            background: "var(--cream-surface)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
          }}
        >
          <Loader2
            style={{
              width: "2rem",
              height: "2rem",
              color: "var(--forest)",
              animation: "spin 1s linear infinite",
            }}
          />
          <span
            style={{
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "var(--forest)",
            }}
          >
            جاري تحميل خريطة جوجل التفاعلية...
          </span>
        </div>
      </div>
    )
  }

  return (
    <LoadedGoogleMap
      onLocationSelect={onLocationSelect}
      initialLocation={initialLocation}
      className={className}
      height={height}
    />
  )
}
export default function LocationPicker(props: LocationPickerProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim()
  if (!apiKey) {
    return <FallbackLocationPicker {...props} />
  }

  return <GoogleMapLocationPickerInner {...props} apiKey={apiKey} />
}
