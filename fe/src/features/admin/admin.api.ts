import { api } from '@/lib/api-client'
import type { Category, Combo, Product, Topping } from '@/types/product'
import type { Staff, StaffListResponse } from '@/types/staff'

// ── Categories ───────────────────────────────────────────────────────────────

export const listCategories = (): Promise<Category[]> =>
  api.get('/categories').then(r => r.data?.data ?? r.data ?? [])

export const createCategory = (body: { name: string; sort_order: number }): Promise<Category> =>
  api.post('/categories', body).then(r => r.data.data)

export const updateCategory = (id: string, body: { name?: string; sort_order?: number }): Promise<Category> =>
  api.patch(`/categories/${id}`, body).then(r => r.data.data)

export const deleteCategory = (id: string): Promise<void> =>
  api.delete(`/categories/${id}`)

// ── Products ─────────────────────────────────────────────────────────────────

export interface CreateProductInput {
  category_id:  string
  name:         string
  description?: string
  price:        number
  sort_order?:  number
  topping_ids?: string[]
  image_path?:  string
}

export const uploadFile = (file: File): Promise<{ id: string; object_path: string }> => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/files/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data.data)
}

export const listProducts = (): Promise<Product[]> =>
  api.get('/products/all').then(r => r.data?.data ?? r.data ?? [])

export const createProduct = (body: CreateProductInput): Promise<Product> =>
  api.post('/products', body).then(r => r.data.data)

export const updateProduct = (id: string, body: Partial<CreateProductInput>): Promise<Product> =>
  api.patch(`/products/${id}`, body).then(r => r.data.data)

export const deleteProduct = (id: string): Promise<void> =>
  api.delete(`/products/${id}`)

export const toggleAvailability = (id: string, is_available: boolean): Promise<void> =>
  api.patch(`/products/${id}/availability`, { is_available })

// ── Toppings ─────────────────────────────────────────────────────────────────

export const listToppings = (): Promise<Topping[]> =>
  api.get('/toppings').then(r => r.data?.data ?? r.data ?? [])

export const createTopping = (body: { name: string; price: number }): Promise<Topping> =>
  api.post('/toppings', body).then(r => r.data.data)

export const updateTopping = (id: string, body: { name?: string; price?: number }): Promise<Topping> =>
  api.patch(`/toppings/${id}`, body).then(r => r.data.data)

export const deleteTopping = (id: string): Promise<void> =>
  api.delete(`/toppings/${id}`)

// ── Staff ─────────────────────────────────────────────────────────────────────

export interface CreateStaffInput {
  username:  string
  password:  string
  full_name: string
  role:      string
  phone?:    string
  email?:    string
}

export interface UpdateStaffInput {
  full_name?: string
  role?:      string
  phone?:     string
  email?:     string
}

export const listStaff = (): Promise<StaffListResponse> =>
  api.get('/staff?limit=100').then(r => r.data)

export const createStaff = (body: CreateStaffInput): Promise<Staff> =>
  api.post('/staff', body).then(r => r.data.data)

export const updateStaff = (id: string, body: UpdateStaffInput): Promise<Staff> =>
  api.patch(`/staff/${id}`, body).then(r => r.data.data)

export const setStaffStatus = (id: string, is_active: boolean): Promise<void> =>
  api.patch(`/staff/${id}/status`, { is_active })

export const deleteStaff = (id: string): Promise<void> =>
  api.delete(`/staff/${id}`)

// ── Combos ────────────────────────────────────────────────────────────────────

export interface CreateComboInput {
  name:         string
  price:        number
  category_id?: string
  description?: string
  sort_order?:  number
  items:        { product_id: string; quantity: number }[]
}

interface RawComboItem { id: string; product_id: string; quantity: number }
interface RawCombo {
  id: string; name: string; description: string | null; price: number
  image_path: string | null; is_available: boolean; sort_order: number
  category_id: string | null; combo_items: RawComboItem[]
}

export const listCombos = (): Promise<Combo[]> =>
  api.get('/combos').then(r => {
    const raw: RawCombo[] = r.data?.data ?? r.data ?? []
    return raw.map(c => ({
      id:           c.id,
      name:         c.name,
      description:  c.description ?? null,
      price:        c.price,
      image_path:   c.image_path ?? null,
      is_available: c.is_available,
      sort_order:   c.sort_order,
      category_id:  c.category_id ?? null,
      items: (c.combo_items ?? []).map(i => ({
        product_id:   i.product_id,
        product_name: '',
        quantity:     i.quantity,
      })),
    }))
  })

export const createCombo = (body: CreateComboInput): Promise<{ id: string }> =>
  api.post('/combos', body).then(r => r.data.data)

export const deleteCombo = (id: string): Promise<void> =>
  api.delete(`/combos/${id}`)

// ── Tables ────────────────────────────────────────────────────────────────────

export interface Table {
  id:        string
  name:      string
  capacity:  number
  status:    'available' | 'occupied' | 'reserved'
  qr_token?: string
}

export const listTables = (): Promise<Table[]> =>
  api.get('/tables').then(r => r.data?.data ?? r.data ?? [])

// ── Orders Live ───────────────────────────────────────────────────────────────

export const listLiveOrders = (): Promise<import('@/types/order').Order[]> =>
  api.get('/orders/live').then(r => r.data?.data ?? r.data ?? [])

export const updateOrderStatus = (id: string, status: string): Promise<void> =>
  api.patch(`/orders/${id}/status`, { status })

// ── Analytics ────────────────────────────────────────────────────────────────

export type SummaryRange = 'today' | 'week' | 'month'

export interface SummaryData {
  customers:     number
  dishes_sold:   number
  revenue:       number
  active_tables: number
}

export interface TopDishRow {
  name:    string
  qty:     number
  revenue: number
  pct:     number
}

export interface StaffPerfRow {
  staff_id:       string
  full_name:      string
  role:           string
  orders_handled: number
  revenue?:       number
}

export const getSummary = (range: SummaryRange): Promise<SummaryData> =>
  api.get(`/admin/summary?range=${range}`).then(r => r.data.data)

export const getTopDishes = (range: SummaryRange, limit = 5): Promise<TopDishRow[]> =>
  api.get(`/admin/top-dishes?range=${range}&limit=${limit}`).then(r => r.data?.data ?? [])

export const getStaffPerformance = (range: SummaryRange): Promise<StaffPerfRow[]> =>
  api.get(`/admin/staff-performance?range=${range}`).then(r => r.data?.data ?? [])

// ── Ingredients ───────────────────────────────────────────────────────────────

export interface Ingredient {
  id:            string
  name:          string
  unit:          string
  current_stock: number
  min_stock:     number
  cost_per_unit: number
  created_at:    string
  updated_at:    string
}

export interface CreateIngredientInput {
  name:          string
  unit:          string
  current_stock: number
  min_stock:     number
  cost_per_unit: number
}

export interface StockMovementInput {
  ingredient_id: string
  type:          'in' | 'out' | 'adjustment'
  quantity:      number
  note?:         string
}

export const listIngredients = (): Promise<Ingredient[]> =>
  api.get('/admin/ingredients').then(r => r.data?.data ?? [])

export const getLowStock = (): Promise<Ingredient[]> =>
  api.get('/admin/ingredients/low-stock').then(r => r.data?.data ?? [])

export const createIngredient = (body: CreateIngredientInput): Promise<Ingredient> =>
  api.post('/admin/ingredients', body).then(r => r.data.data)

export const updateIngredient = (id: string, body: Partial<Omit<CreateIngredientInput, 'current_stock'>>): Promise<Ingredient> =>
  api.patch(`/admin/ingredients/${id}`, body).then(r => r.data.data)

export const deleteIngredient = (id: string): Promise<void> =>
  api.delete(`/admin/ingredients/${id}`)

export const postStockMovement = (body: StockMovementInput): Promise<void> =>
  api.post('/admin/stock-movements', body).then(r => r.data.data)
