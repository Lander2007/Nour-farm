import fs from "node:fs"
import path from "node:path"
import type {
  Department,
  Section,
  Product,
  Order,
  OrderStatus,
  StoreSettings,
  DeliveryFeeStatus,
  PaymentStatus,
} from "./types"
import { products as oldDemoProducts } from "@/data/products"

interface LocalDatabaseState {
  departments: Department[]
  sections: Section[]
  products: Product[]
  orders: Order[]
  settings: StoreSettings
}

export const DEFAULT_SETTINGS: StoreSettings = {
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

const DB_FILE_PATH = path.join(process.cwd(), "data", "local-db.json")

const DEFAULT_DEPARTMENTS: Department[] = [
  {
    id: "vegetables",
    name_ar: "الخضار",
    accent_word: "طازج",
    sub_headline: "خضار يومي من المزرعة، مغسول ومجهّز",
    sort: 1,
  },
  {
    id: "fruits",
    name_ar: "الفاكهة",
    accent_word: "طازجة",
    sub_headline: "فواكه الموسم الطبيعية، سكرية ومختارة بالواحدة",
    sort: 2,
  },
]

const DEFAULT_SECTIONS: Section[] = [
  {
    id: "fresh-vegetables",
    department_id: "vegetables",
    name_ar: "خضار طازج",
    cover_image: "/noor-farm-images/IMG-20261014-WA0114.jpg",
    sort: 1,
  },
  {
    id: "herbs",
    department_id: "vegetables",
    name_ar: "الخضرة",
    cover_image: "/basil.webp",
    sort: 2,
  },
  {
    id: "ready-vegetables",
    department_id: "vegetables",
    name_ar: "خضار متقطع ومجهّز",
    cover_image: "/scenes/cut.jpg",
    sort: 3,
  },
  {
    id: "salads",
    department_id: "vegetables",
    name_ar: "السلطات",
    cover_image: "/scenes/ready.jpg",
    sort: 4,
  },
  {
    id: "fresh-fruits",
    department_id: "fruits",
    name_ar: "فاكهة طازجة",
    cover_image: "/noor-farm-images/red-plum.jpg",
    sort: 1,
  },
  {
    id: "cut-fruits",
    department_id: "fruits",
    name_ar: "فاكهة متقطعة ومجهّزة",
    cover_image: "/noor-farm-images/cantaloupe.jpg",
    sort: 2,
  },
]

function mapOldSectionToNewId(oldSec: string): string {
  switch (oldSec) {
    case "الخضرة":
      return "herbs"
    case "جاهز للطبخ":
      return "ready-vegetables"
    case "السلطات":
      return "salads"
    case "فواكه طازجة":
      return "fresh-fruits"
    case "خضار طازج":
    default:
      return "fresh-vegetables"
  }
}

function mapOldUnit(unit: string): { unitType: Product["unit_type"]; packLabel: string | null; step: number } {
  if (unit.includes("كيلو") || unit.includes("كجم")) {
    return { unitType: "kg", packLabel: null, step: 0.5 }
  }
  if (unit.includes("حزمة")) {
    return { unitType: "bunch", packLabel: null, step: 1 }
  }
  if (unit.includes("طبق") || unit.includes("علبة")) {
    return { unitType: "pack", packLabel: unit, step: 1 }
  }
  return { unitType: "piece", packLabel: null, step: 1 }
}

function initializeDefaultData(): LocalDatabaseState {
  // Migrate existing demo products as UNPUBLISHED drafts with NO ratings/badges
  const draftProducts: Product[] = oldDemoProducts.map((p, idx) => {
    const { unitType, packLabel, step } = mapOldUnit(p.unit)
    return {
      id: p.id,
      section_id: mapOldSectionToNewId(p.section),
      name_ar: p.name,
      image_url: p.image || null,
      price: p.price ?? null,
      unit_type: unitType,
      pack_label: packLabel,
      step: step,
      published: false, // RULE: all migrated demo items are unpublished drafts
      sort: idx + 1,
      created_at: new Date().toISOString(),
    }
  })

  return {
    departments: DEFAULT_DEPARTMENTS,
    sections: DEFAULT_SECTIONS,
    products: draftProducts,
    orders: [],
    settings: { ...DEFAULT_SETTINGS },
  }
}

let cachedState: LocalDatabaseState | null = null

function readLocalDb(): LocalDatabaseState {
  if (cachedState) return cachedState

  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const content = fs.readFileSync(DB_FILE_PATH, "utf8")
      cachedState = JSON.parse(content)
      if (cachedState && !cachedState.settings) {
        cachedState.settings = { ...DEFAULT_SETTINGS }
        writeLocalDb(cachedState)
      }
      return cachedState!
    }
  } catch (err) {
    console.warn("Could not read local DB file, initializing defaults:", err)
  }

  const initialState = initializeDefaultData()
  writeLocalDb(initialState)
  cachedState = initialState
  return cachedState
}

function writeLocalDb(state: LocalDatabaseState): void {
  try {
    const dir = path.dirname(DB_FILE_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(state, null, 2), "utf8")
    cachedState = state
  } catch (err) {
    console.error("Failed to write local database file:", err)
  }
}

export const localStore = {
  getDepartments: (): Department[] => {
    return readLocalDb().departments
  },
  getDepartment: (id: string): Department | undefined => {
    return readLocalDb().departments.find((d) => d.id === id)
  },
  getSections: (departmentId?: string): Section[] => {
    const sections = readLocalDb().sections
    if (!departmentId) return sections
    return sections.filter((s) => s.department_id === departmentId)
  },
  getSection: (id: string): Section | undefined => {
    return readLocalDb().sections.find((s) => s.id === id)
  },
  updateSection: (id: string, updates: Partial<Section>): Section | null => {
    const state = readLocalDb()
    const idx = state.sections.findIndex((s) => s.id === id)
    if (idx === -1) return null
    state.sections[idx] = { ...state.sections[idx], ...updates }
    writeLocalDb(state)
    return state.sections[idx]
  },
  createSection: (section: Section): Section => {
    const state = readLocalDb()
    const exists = state.sections.find((s) => s.id === section.id)
    if (exists) return exists
    state.sections.push(section)
    writeLocalDb(state)
    return section
  },
  deleteSection: (id: string): boolean => {
    const state = readLocalDb()
    const initialLen = state.sections.length
    state.sections = state.sections.filter((s) => s.id !== id)
    state.products = state.products.filter((p) => p.section_id !== id)
    if (state.sections.length !== initialLen) {
      writeLocalDb(state)
      return true
    }
    return false
  },
  getProducts: (options?: { sectionId?: string; publishedOnly?: boolean }): Product[] => {
    let prods = readLocalDb().products
    if (options?.publishedOnly) {
      prods = prods.filter((p) => p.published)
    }
    if (options?.sectionId) {
      prods = prods.filter((p) => p.section_id === options.sectionId)
    }
    return prods.sort((a, b) => a.sort - b.sort)
  },
  getProduct: (id: string): Product | undefined => {
    return readLocalDb().products.find((p) => p.id === id)
  },
  createProduct: (data: Omit<Product, "created_at">): Product => {
    const state = readLocalDb()
    const newProd: Product = {
      ...data,
      created_at: new Date().toISOString(),
    }
    state.products = [newProd, ...state.products.filter((p) => p.id !== newProd.id)]
    writeLocalDb(state)
    return newProd
  },
  updateProduct: (id: string, updates: Partial<Product>): Product | null => {
    const state = readLocalDb()
    const idx = state.products.findIndex((p) => p.id === id)
    if (idx === -1) return null
    state.products[idx] = { ...state.products[idx], ...updates }
    writeLocalDb(state)
    return state.products[idx]
  },
  deleteProduct: (id: string): boolean => {
    const state = readLocalDb()
    const initialLen = state.products.length
    state.products = state.products.filter((p) => p.id !== id)
    if (state.products.length !== initialLen) {
      writeLocalDb(state)
      return true
    }
    return false
  },
  deleteAllProducts: (): boolean => {
    const state = readLocalDb()
    state.products = []
    writeLocalDb(state)
    return true
  },
  resequenceProducts: (): Product[] => {
    const state = readLocalDb()
    const sectionOrder: Record<string, number> = {
      "fresh-vegetables": 1,
      "herbs": 2,
      "ready-vegetables": 3,
      "salads": 4,
      "fresh-fruits": 5,
      "cut-fruits": 6,
    }
    state.products.sort((a, b) => {
      const secA = sectionOrder[a.section_id] ?? 99
      const secB = sectionOrder[b.section_id] ?? 99
      if (secA !== secB) return secA - secB
      return (Number(a.sort) || 0) - (Number(b.sort) || 0)
    })
    state.products.forEach((p, idx) => {
      p.sort = idx + 1
    })
    writeLocalDb(state)
    return state.products
  },
  bulkCreateDrafts: (items: { name_ar: string; image_url: string; section_id: string }[]): Product[] => {
    const state = readLocalDb()
    const newProds: Product[] = items.map((item, i) => ({
      id: `prod-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      section_id: item.section_id,
      name_ar: item.name_ar,
      image_url: item.image_url,
      price: null,
      unit_type: "kg",
      pack_label: null,
      step: 0.5,
      published: false,
      sort: state.products.length + i + 1,
      created_at: new Date().toISOString(),
    }))
    state.products = [...newProds, ...state.products]
    writeLocalDb(state)
    return newProds
  },
  getOrders: (options?: { status?: OrderStatus }): Order[] => {
    let orders = readLocalDb().orders
    if (options?.status) {
      orders = orders.filter((o) => o.status === options.status)
    }
    return orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  },
  getOrder: (id: string): Order | undefined => {
    return readLocalDb().orders.find((o) => o.id === id || o.order_number === id)
  },
  saveOrder: (order: Order): Order => {
    const state = readLocalDb()
    const idx = state.orders.findIndex((o) => o.id === order.id || o.order_number === order.order_number)
    if (idx >= 0) {
      state.orders[idx] = { ...state.orders[idx], ...order }
    } else {
      state.orders = [order, ...state.orders]
    }
    writeLocalDb(state)
    return order
  },
  createOrder: (order: Omit<Order, "id" | "created_at">): Order => {
    const state = readLocalDb()
    const payment_method = order.payment_method || order.paymentMethod || "cod"
    const payment_status = order.payment_status || order.paymentStatus || "pending"
    const newOrder: Order = {
      ...order,
      payment_method,
      paymentMethod: payment_method,
      payment_status,
      paymentStatus: payment_status,
      id: `ord-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      created_at: new Date().toISOString(),
    }
    state.orders = [newOrder, ...state.orders]
    writeLocalDb(state)
    return newOrder
  },
  updateOrderStatus: (id: string, status: OrderStatus): Order | null => {
    const state = readLocalDb()
    const idx = state.orders.findIndex((o) => o.id === id || o.order_number === id)
    if (idx === -1) return null
    state.orders[idx].status = status
    writeLocalDb(state)
    return state.orders[idx]
  },
  updateOrderPaymentStatus: (id: string, paymentStatus: PaymentStatus): Order | null => {
    const state = readLocalDb()
    const idx = state.orders.findIndex((o) => o.id === id || o.order_number === id)
    if (idx === -1) return null
    state.orders[idx].payment_status = paymentStatus
    state.orders[idx].paymentStatus = paymentStatus
    writeLocalDb(state)
    return state.orders[idx]
  },
  updateOrderDeliveryFee: (
    id: string,
    deliveryFee: number | null,
    deliveryFeeStatus: DeliveryFeeStatus
  ): Order | null => {
    const state = readLocalDb()
    const idx = state.orders.findIndex((o) => o.id === id || o.order_number === id)
    if (idx === -1) return null
    const ord = state.orders[idx]
    const subtotal =
      ord.subtotal_price ??
      ord.items.reduce((sum, item) => sum + (item.line_total || 0), 0)

    ord.subtotal_price = subtotal
    ord.delivery_fee = deliveryFee
    ord.delivery_fee_status = deliveryFeeStatus
    ord.total_price =
      deliveryFeeStatus === "set" && deliveryFee != null
        ? Number((subtotal + deliveryFee).toFixed(2))
        : Number(subtotal.toFixed(2))

    writeLocalDb(state)
    return ord
  },
  getSettings: (): StoreSettings => {
    const state = readLocalDb()
    return state.settings || { ...DEFAULT_SETTINGS }
  },
  updateSettings: (updates: Partial<StoreSettings>): StoreSettings => {
    const state = readLocalDb()
    state.settings = { ...(state.settings || DEFAULT_SETTINGS), ...updates }
    writeLocalDb(state)
    return state.settings
  },
  resetDraftCatalog: (): void => {
    const fresh = initializeDefaultData()
    writeLocalDb(fresh)
  },
}
