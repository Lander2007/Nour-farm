import { isSupabaseConfigured, getSupabaseServerClient } from "./supabase"
import { localStore } from "./local-store"
import type { Department, Section, Product, Order, OrderStatus } from "./types"

export * from "./types"

export function isUsingDevFallback(): boolean {
  return !isSupabaseConfigured() && process.env.NODE_ENV !== "production"
}

export function assertDatabaseConfigured(): void {
  if (!isSupabaseConfigured()) {
    console.warn(
      "[Database] Supabase environment variables are missing. Using fallback store."
    )
  }
}

export async function getDepartments(): Promise<Department[]> {
  if (!isSupabaseConfigured()) {
    return localStore.getDepartments()
  }

  try {
    const supabase = getSupabaseServerClient()!
    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .order("sort", { ascending: true })

    if (error) {
      console.error("Supabase getDepartments error:", error)
      return localStore.getDepartments()
    }
    return data as Department[]
  } catch (err) {
    console.error("Supabase getDepartments exception:", err)
    return localStore.getDepartments()
  }
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
    return localStore.getSections(departmentId)
  }

  try {
    const supabase = getSupabaseServerClient()!
    let query = supabase.from("sections").select("*").order("sort", { ascending: true })
    if (departmentId) {
      query = query.eq("department_id", departmentId)
    }

    const { data, error } = await query
    if (error) {
      console.error("Supabase getSections error:", error)
      return localStore.getSections(departmentId)
    }
    return data as Section[]
  } catch (err) {
    console.error("Supabase getSections exception:", err)
    return localStore.getSections(departmentId)
  }
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

export async function createSection(section: Section): Promise<Section> {
  if (!isSupabaseConfigured()) {
    assertDatabaseConfigured()
    return localStore.createSection(section)
  }

  const supabase = getSupabaseServerClient()!
  const { data, error } = await supabase
    .from("sections")
    .upsert(section, { onConflict: "id" })
    .select()
    .single()

  if (error) {
    console.error("Supabase createSection error:", error)
    if (process.env.NODE_ENV !== "production") return localStore.createSection(section)
    throw error
  }
  return data as Section
}

export async function deleteSection(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    assertDatabaseConfigured()
    return localStore.deleteSection(id)
  }

  const supabase = getSupabaseServerClient()!
  // Delete any products belonging to this section first to prevent foreign key errors
  await supabase.from("products").delete().eq("section_id", id)

  const { error } = await supabase.from("sections").delete().eq("id", id)
  if (error) {
    console.error("Supabase deleteSection error:", error)
    if (process.env.NODE_ENV !== "production") return localStore.deleteSection(id)
    throw error
  }

  localStore.deleteSection(id)
  return true
}

export async function getProducts(options?: {
  sectionId?: string
  publishedOnly?: boolean
}): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return localStore.getProducts(options)
  }

  try {
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
      return localStore.getProducts(options)
    }
    return data as Product[]
  } catch (err) {
    console.error("Supabase getProducts exception:", err)
    return localStore.getProducts(options)
  }
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

export async function deleteAllProducts(): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    assertDatabaseConfigured()
    return localStore.deleteAllProducts()
  }

  const supabase = getSupabaseServerClient()!
  // In Supabase PostgreSQL, deleting without where requires an expression like neq id ''
  const { error } = await supabase.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000")
  if (error) {
    // Fallback if id is text-based
    const { error: error2 } = await supabase.from("products").delete().gte("created_at", "1970-01-01")
    if (error2) throw error2
  }
  // Also clear local store
  localStore.deleteAllProducts()
  return true
}

export async function resequenceProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    assertDatabaseConfigured()
    return localStore.resequenceProducts()
  }

  const supabase = getSupabaseServerClient()!
  const { data: allProds, error } = await supabase.from("products").select("*")
  if (error) throw error

  const sectionOrder: Record<string, number> = {
    "fresh-vegetables": 1,
    "herbs": 2,
    "ready-vegetables": 3,
    "salads": 4,
    "fresh-fruits": 5,
    "cut-fruits": 6,
  }

  const sorted = [...(allProds || [])].sort((a, b) => {
    const secA = sectionOrder[a.section_id] ?? 99
    const secB = sectionOrder[b.section_id] ?? 99
    if (secA !== secB) return secA - secB
    return (Number(a.sort) || 0) - (Number(b.sort) || 0)
  })

  for (let i = 0; i < sorted.length; i++) {
    const newSort = i + 1
    if (sorted[i].sort !== newSort) {
      await supabase.from("products").update({ sort: newSort }).eq("id", sorted[i].id)
      sorted[i].sort = newSort
    }
  }

  localStore.resequenceProducts()
  return sorted
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
