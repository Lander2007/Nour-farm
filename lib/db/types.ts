export type DepartmentId = "vegetables" | "fruits"

export type Department = {
  id: DepartmentId
  name_ar: string
  accent_word: string
  sub_headline: string
  sort: number
}

export type Section = {
  id: string
  department_id: DepartmentId
  name_ar: string
  cover_image: string | null
  sort: number
}

export type UnitType = "kg" | "piece" | "bunch" | "pack" | "box"

export type Product = {
  id: string
  section_id: string
  name_ar: string
  image_url: string | null
  price: number | null
  unit_type: UnitType
  pack_label: string | null
  step: number
  published: boolean
  sort: number
  created_at: string
}

export type OrderStatus = "new" | "preparing" | "delivered" | "cancelled"

export type OrderItemSnapshot = {
  id: string
  name_ar: string
  unit: string
  qty: number
  unit_price: number
  line_total: number
}

export type OrderLocation = {
  lat: number
  lng: number
  source: "gps" | "pin"
  address_text?: string
}

export type OrderAddressDetails = {
  street?: string
  building: string
  floor?: string
  apartment: string
  landmark?: string
  notes?: string
}

export type ServiceArea = {
  id: string
  name: string
  enabled: boolean
}

export type PaymentMethod = "cod" | "wallet" | "instapay"
export type PaymentStatus = "pending" | "received"

export type StoreSettings = {
  storeAddress: string
  serviceAreas: ServiceArea[]
  whatsappNumber: string
  freeDeliveryActive: boolean
  freeDeliveryText: string
  walletNumber?: string
  walletLabel?: string
  instapayAddress?: string
}

export type DeliveryFeeStatus = "pending" | "free" | "set"

export type Order = {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  address_details: OrderAddressDetails
  location: OrderLocation
  items: OrderItemSnapshot[]
  total_price: number
  subtotal_price?: number
  area?: string
  delivery_fee?: number | null
  delivery_fee_status?: DeliveryFeeStatus
  payment_method?: PaymentMethod
  paymentMethod?: PaymentMethod
  payment_status?: PaymentStatus
  paymentStatus?: PaymentStatus
  status: OrderStatus
  created_at: string
}
