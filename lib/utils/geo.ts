// Bounding box for Egypt: Latitude 22.0°N to 31.8°N, Longitude 24.5°E to 37.0°E
export const EGYPT_BOUNDS = {
  minLat: 22.0,
  maxLat: 31.8,
  minLng: 24.5,
  maxLng: 37.0,
} as const

export function isWithinEgypt(lat: number, lng: number): boolean {
  return (
    lat >= EGYPT_BOUNDS.minLat &&
    lat <= EGYPT_BOUNDS.maxLat &&
    lng >= EGYPT_BOUNDS.minLng &&
    lng <= EGYPT_BOUNDS.maxLng
  )
}
