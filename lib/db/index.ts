import { isSupabaseConfigured, getSupabaseServerClient } from "./supabase"
import { localStore } from "./local-store"
import type { Department, Section, Product, Order, OrderStatus } from "./types"

export * from "./types"

export function isUsingDevFallback(): boolean {
  return !isSupabaseConfigured() && process.env.NODE_ENV !== "production"
}

export function assertDatabaseConfigured(): void {
  if (!isSupabaseConfigured()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "DATABASE_CONFIG_ERROR: Supabase environment variables are missing in production. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
      )
    }
  }
}

export async function getDepartments(): Promise<Department[]> {
  if (!isSupabaseConfigured()) {
    assertDatabaseConfigured()
    return localStore.getDepartments()
  }

  const supabase = getSupabaseServerClient()!
  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .order("sort", { ascending: true })

  if (error) {
    console.error("Supabase getDepartments error:", error)
    if (process.env.NODE_ENV !== "production") return localStore.getDepartments()
    throw error
  }
  return data as Department[]
}

export async function getDepartment(id: string): Promise<Department | null> {
  if (!isSupabaseConfigured()) {
    assertDatabaseConfigured()
    return localStore.getDepartment(id) || null
  }

  const supabase = getSupabaseServerClient()!
  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    if (process.env.NODE_ENV !== "production") return localStore.getDepartment(id) || null
    return null
  }
  return data as Department
}

export async function getSections(departmentId?: string): Promise<Section[]> {
  if (!isSupabaseConfigured()) {
    assertDatabaseConfigured()
    return localStore.getSections(departmentId)
  }

  const supabase = getSupabaseServerClient()!
  let query = supabase.from("sections").select("*").order("sort", { ascending: true })
  if (departmentId) {
    query = query.eq("department_id", departmentId)
  }

  const { data, error } = await query
  if (error) {
    console.error("Supabase getSections error:", error)
    if (process.env.NODE_ENV !== "production") return localStore.getSections(departmentId)
    throw error
  }
  return data as Section[]
}

export async function getSection(id: string): Promise<Section | null> {
  if (!isSupabaseConfigured()) {
    assertDatabaseConfigured()
    return localStore.getSection(id) || null
  }

  const supabase = getSupabaseServerClient()!
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    if (process.env.NODE_ENV !== "production") return localStore.getSection(id) || null
    return null
  }
  return data as Section
}

export async function updateSection(id: string, updates: Partial<Section>): Promise<Section | null> {
  if (!isSupabaseConfigured()) {
    assertDatabaseConfigured()
    return localStore.updateSection(id, updates)
  }

  const supabase = getSupabaseServerClient()!
  const { data, error } = await supabase
    .from("sections")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data as Section
}

export async function getProducts(options?: {
  sectionId?: string
  publishedOnly?: boolean
}): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    assertDatabaseConfigured()
    return localStore.getProducts(options)
  }

  const supabase = getSupabaseServerClient()!
  let query = supabase.from("products").select("*").order("sort", { ascending: true })

  if (options?.publishedOnly) {
    query = query.eq("published", true)
  }
  if (options?.sectionId) {
    query = query.eq("section_id", options.sectionId)
  }

  const { data, error } = await query
  if (error) {
    console.error("Supabase getProducts error:", error)
    if (process.env.NODE_ENV !== "production") return localStore.getProducts(options)
    throw error
  }
  return data as Product[]
}

export async function getProduct(id: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    assertDatabaseConfigured()
    return localStore.getProduct(id) || null
  }

  const supabase = getSupabaseServerClient()!
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    if (process.env.NODE_ENV !== "production") return localStore.getProduct(id) || null
    return null
  }
  return data as Product
}

export async function createProduct(product: Omit<Product, "created_at">): Promise<Product> {
  if (!isSupabaseConfigured()) {
    assertDatabaseConfigured()
    return localStore.createProduct(product)
  }

  const supabase = getSupabaseServerClient()!
  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select()
    .single()

  if (error) throw error
  return data as Product
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    assertDatabaseConfigured()
    return localStore.updateProduct(id, updates)
  }

  const supabase = getSupabaseServerClient()!
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data as Product
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    assertDatabaseConfigured()
    return localStore.deleteProduct(id)
  }

  const supabase = getSupabaseServerClient()!
  const { error } = await supabase.from("products").delete().eq("id", id)
  if (error) throw error
  return true
}

export async function bulkCreateDraftProducts(
  items: { name_ar: string; image_url: string; section_id: string }[]
): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    assertDatabaseConfigured()
    return localStore.bulkCreateDrafts(items)
  }

  const supabase = getSupabaseServerClient()!
  const toInsert = items.map((item, idx) => ({
    section_id: item.section_id,
    name_ar: item.name_ar,
    image_url: item.image_url,
    price: null,
    unit_type: "kg",
    pack_label: null,
    step: 0.5,
    published: false,
    sort: idx + 1,
  }))

  const { data, error } = await supabase.from("products").insert(toInsert).select()
  if (error) throw error
  return data as Product[]
}

export async function getOrders(options?: { status?: OrderStatus }): Promise<Order[]> {
  if (!isSupabaseConfigured()) {
    assertDatabaseConfigured()
    return localStore.getOrders(options)
  }

  const supabase = getSupabaseServerClient()!
  let query = supabase.from("orders").select("*").order("created_at", { ascending: false })
  if (options?.status) {
    query = query.eq("status", options.status)
  }

  const { data, error } = await query
  if (error) {
    console.error("Supabase getOrders error:", error)
    if (process.env.NODE_ENV !== "production") return localStore.getOrders(options)
    throw error
  }
  return data as Order[]
}

export async function getOrder(id: string): Promise<Order | null> {
  if (!isSupabaseConfigured()) {
    assertDatabaseConfigured()
    return localStore.getOrder(id) || null
  }

  const supabase = getSupabaseServerClient()!
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

  let query = supabase.from("orders").select("*")
  if (isUuid) {
    query = query.eq("id", id)
  } else {
    query = query.eq("order_number", id)
  }

  const { data, error } = await query.single()

  if (error) {
    if (process.env.NODE_ENV !== "production") return localStore.getOrder(id) || null
    return null
  }
  return data as Order
}

export const getOrderById = getOrder

export async function createOrder(
  order: Omit<Order, "id" | "created_at">
): Promise<Order> {
  if (!isSupabaseConfigured()) {
    assertDatabaseConfigured()
    return localStore.createOrder(order)
  }

  const supabase = getSupabaseServerClient()!
  const { data, error } = await supabase
    .from("orders")
    .insert(order)
    .select()
    .single()

  if (error) throw error
  return data as Order
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
  if (!isSupabaseConfigured()) {
    assertDatabaseConfigured()
    return localStore.updateOrderStatus(id, status)
  }

  const supabase = getSupabaseServerClient()!
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

  let query = supabase.from("orders").update({ status })
  if (isUuid) {
    query = query.eq("id", id)
  } else {
    query = query.eq("order_number", id)
  }

  const { data, error } = await query.select().single()

  if (error) throw error
  return data as Order
}
