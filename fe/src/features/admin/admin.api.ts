import { api } from '@/lib/api-client'
import type { Category, Product, Topping } from '@/types/product'
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
