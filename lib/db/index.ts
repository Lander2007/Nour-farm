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
  localStore.updateSection(id, updates)
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
    return localStore.getOrders(options)
  }

  const enriched = (data || []).map((o: any) => {
    const local = localStore.getOrder(o.id) || localStore.getOrder(o.order_number)
    const subtotal =
      o.subtotal_price ??
      local?.subtotal_price ??
      (o.items || []).reduce((s: number, it: any) => s + (Number(it.line_total) || 0), 0)
    const paymentMethod = o.payment_method || local?.payment_method || o.paymentMethod || local?.paymentMethod || "cod"
    const paymentStatus = o.payment_status || local?.payment_status || o.paymentStatus || local?.paymentStatus || "pending"
    return {
      ...o,
      area: o.area || local?.area,
      delivery_fee: o.delivery_fee !== undefined ? o.delivery_fee : local?.delivery_fee,
      delivery_fee_status:
        o.delivery_fee_status ||
        local?.delivery_fee_status ||
        (o.delivery_fee === 0 ? "free" : o.delivery_fee != null ? "set" : "pending"),
      payment_method: paymentMethod,
      paymentMethod,
      payment_status: paymentStatus,
      paymentStatus,
      subtotal_price: subtotal,
    }
  })
  return enriched as Order[]
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

  if (error || !data) {
    return localStore.getOrder(id) || null
  }

  const local = localStore.getOrder(data.id) || localStore.getOrder(data.order_number)
  const subtotal =
    data.subtotal_price ??
    local?.subtotal_price ??
    (data.items || []).reduce((s: number, it: any) => s + (Number(it.line_total) || 0), 0)
  const paymentMethod = data.payment_method || local?.payment_method || data.paymentMethod || local?.paymentMethod || "cod"
  const paymentStatus = data.payment_status || local?.payment_status || data.paymentStatus || local?.paymentStatus || "pending"

  return {
    ...data,
    area: data.area || local?.area,
    delivery_fee: data.delivery_fee !== undefined ? data.delivery_fee : local?.delivery_fee,
    delivery_fee_status:
      data.delivery_fee_status ||
      local?.delivery_fee_status ||
      (data.delivery_fee === 0 ? "free" : data.delivery_fee != null ? "set" : "pending"),
    payment_method: paymentMethod,
    paymentMethod,
    payment_status: paymentStatus,
    paymentStatus,
    subtotal_price: subtotal,
  } as Order
}

export const getOrderById = getOrder

export async function createOrder(
  order: Omit<Order, "id" | "created_at">
): Promise<Order> {
  const localOrder = localStore.createOrder(order)

  if (!isSupabaseConfigured()) {
    assertDatabaseConfigured()
    return localOrder
  }

  const supabase = getSupabaseServerClient()!
  try {
    const { data, error } = await supabase
      .from("orders")
      .insert(order)
      .select()
      .single()

    if (error) {
      if (error.code === "42703" || error.message?.includes("column")) {
        const { area, delivery_fee, delivery_fee_status, subtotal_price, ...legacyOrder } = order as any
        const { data: legacyData, error: legacyErr } = await supabase
          .from("orders")
          .insert(legacyOrder)
          .select()
          .single()

        if (!legacyErr && legacyData) {
          const finalOrder = { ...legacyData, area, delivery_fee, delivery_fee_status, subtotal_price } as Order
          localStore.saveOrder(finalOrder)
          return finalOrder
        }
      }
      console.warn("Supabase createOrder failed, using localOrder:", error)
      return localOrder
    }
    const finalOrder = data as Order
    localStore.saveOrder(finalOrder)
    return finalOrder
  } catch (err) {
    console.error("Supabase createOrder exception:", err)
    return localOrder
  }
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
  const localUpdated = localStore.updateOrderStatus(id, status)

  if (!isSupabaseConfigured()) {
    assertDatabaseConfigured()
    return localUpdated
  }

  try {
    const supabase = getSupabaseServerClient()!
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    let query = supabase.from("orders").update({ status })
    if (isUuid) {
      query = query.eq("id", id)
    } else {
      query = query.eq("order_number", id)
    }

    const { data, error } = await query.select().single()
    if (error) {
      console.warn("Supabase updateOrderStatus failed, using localStore:", error)
      return localUpdated
    }
    return data as Order
  } catch (err) {
    console.error("Supabase updateOrderStatus exception:", err)
    return localUpdated
  }
}

export async function updateOrderDeliveryFee(
  id: string,
  deliveryFee: number | null,
  deliveryFeeStatus: DeliveryFeeStatus
): Promise<Order | null> {
  const localUpdated = localStore.updateOrderDeliveryFee(id, deliveryFee, deliveryFeeStatus)

  if (!isSupabaseConfigured()) {
    return localUpdated
  }

  try {
    const supabase = getSupabaseServerClient()!
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    let orderQuery = supabase.from("orders").select("*")
    if (isUuid) orderQuery = orderQuery.eq("id", id)
    else orderQuery = orderQuery.eq("order_number", id)

    const { data: existing, error: fetchErr } = await orderQuery.single()
    if (fetchErr || !existing) {
      return localUpdated
    }

    const subtotal = existing.subtotal_price ?? (existing.items || []).reduce(
      (sum: number, it: any) => sum + (Number(it.line_total) || 0),
      0
    )
    const newTotal =
      deliveryFeeStatus === "set" && deliveryFee != null
        ? Number((subtotal + deliveryFee).toFixed(2))
        : Number(subtotal.toFixed(2))

    let updateQuery = supabase
      .from("orders")
      .update({
        subtotal_price: subtotal,
        delivery_fee: deliveryFee,
        delivery_fee_status: deliveryFeeStatus,
        total_price: newTotal,
      })

    if (isUuid) updateQuery = updateQuery.eq("id", id)
    else updateQuery = updateQuery.eq("order_number", id)

    const { data, error } = await updateQuery.select().single()
    if (error) {
      if (error.code === "42703" || error.message?.includes("column")) {
        await supabase
          .from("orders")
          .update({ total_price: newTotal })
          .eq(isUuid ? "id" : "order_number", id)
      }
      return localUpdated
    }

    const finalOrder = data as Order
    localStore.saveOrder(finalOrder)
    return finalOrder
  } catch (err) {
    console.error("Supabase updateOrderDeliveryFee exception:", err)
    return localUpdated
  }
}

export async function updateOrderPaymentStatus(
  id: string,
  paymentStatus: PaymentStatus
): Promise<Order | null> {
  const localUpdated = localStore.updateOrderPaymentStatus(id, paymentStatus)

  if (!isSupabaseConfigured()) {
    return localUpdated
  }

  try {
    const supabase = getSupabaseServerClient()!
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    let query = supabase.from("orders").update({ payment_status: paymentStatus })
    if (isUuid) {
      query = query.eq("id", id)
    } else {
      query = query.eq("order_number", id)
    }

    const { data, error } = await query.select().single()
    if (error) {
      console.warn("Supabase updateOrderPaymentStatus failed, fallback to localStore:", error)
      return localUpdated
    }
    const finalOrder = data as Order
    localStore.saveOrder(finalOrder)
    return finalOrder
  } catch (err) {
    console.error("Supabase updateOrderPaymentStatus exception:", err)
    return localUpdated
  }
}

export async function getSettings(): Promise<StoreSettings> {
  if (!isSupabaseConfigured()) {
    return localStore.getSettings()
  }

  try {
    const supabase = getSupabaseServerClient()!
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("id", "store_settings")
      .single()

    if (error || !data) {
      return localStore.getSettings()
    }

    const localSettings = localStore.getSettings()

    return {
      storeAddress: data.store_address || localSettings.storeAddress,
      serviceAreas: data.service_areas || localSettings.serviceAreas || [],
      whatsappNumber: data.whatsapp_number || localSettings.whatsappNumber,
      freeDeliveryActive: data.free_delivery_active !== undefined ? Boolean(data.free_delivery_active) : localSettings.freeDeliveryActive,
      freeDeliveryText: data.free_delivery_text || localSettings.freeDeliveryText,
      walletNumber: data.wallet_number !== undefined ? data.wallet_number : localSettings.walletNumber || "",
      walletLabel: data.wallet_label !== undefined ? data.wallet_label : localSettings.walletLabel || "",
      instapayAddress: data.instapay_address !== undefined ? data.instapay_address : localSettings.instapayAddress || "",
    }
  } catch (err) {
    console.error("Supabase getSettings exception:", err)
    return localStore.getSettings()
  }
}

export async function getPublicSettings(): Promise<StoreSettings> {
  const settings = await getSettings()
  return {
    ...settings,
    serviceAreas: (settings.serviceAreas || []).filter((a) => a.enabled),
  }
}

export async function updateSettings(
  updates: Partial<StoreSettings>
): Promise<StoreSettings> {
  const localUpdated = localStore.updateSettings(updates)

  if (!isSupabaseConfigured()) {
    return localUpdated
  }

  try {
    const supabase = getSupabaseServerClient()!
    const toUpsert: Record<string, any> = {
      id: "store_settings",
      updated_at: new Date().toISOString(),
    }
    if (updates.storeAddress !== undefined) toUpsert.store_address = updates.storeAddress
    if (updates.serviceAreas !== undefined) toUpsert.service_areas = updates.serviceAreas
    if (updates.whatsappNumber !== undefined) toUpsert.whatsapp_number = updates.whatsappNumber
    if (updates.freeDeliveryActive !== undefined) toUpsert.free_delivery_active = updates.freeDeliveryActive
    if (updates.freeDeliveryText !== undefined) toUpsert.free_delivery_text = updates.freeDeliveryText
    if (updates.walletNumber !== undefined) toUpsert.wallet_number = updates.walletNumber
    if (updates.walletLabel !== undefined) toUpsert.wallet_label = updates.walletLabel
    if (updates.instapayAddress !== undefined) toUpsert.instapay_address = updates.instapayAddress

    const { data, error } = await supabase
      .from("settings")
      .upsert(toUpsert)
      .select()
      .single()

    if (error) {
      console.warn("Supabase updateSettings failed, using localStore:", error)
      return localUpdated
    }

    return {
      storeAddress: data.store_address,
      serviceAreas: data.service_areas || [],
      whatsappNumber: data.whatsapp_number,
      freeDeliveryActive: Boolean(data.free_delivery_active),
      freeDeliveryText: data.free_delivery_text,
      walletNumber: data.wallet_number || "",
      walletLabel: data.wallet_label || "",
      instapayAddress: data.instapay_address || "",
    }
  } catch (err) {
    console.error("Supabase updateSettings exception:", err)
    return localUpdated
  }
}
