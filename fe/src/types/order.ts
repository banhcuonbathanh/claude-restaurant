export type ItemStatus = 'pending' | 'preparing' | 'done'

export function deriveItemStatus(qty_served: number, quantity: number): ItemStatus {
  if (qty_served === 0) return 'pending'
  if (qty_served >= quantity) return 'done'
  return 'preparing'
}

export interface OrderItem {
  id:               string
  product_id:       string | null
  combo_id:         string | null
  combo_ref_id:     string | null
  name:             string
  quantity:         number
  qty_served:       number
  unit_price:       number
  note:             string | null
  topping_snapshot: object | null
  flagged:          boolean
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'cancelled'

export interface Order {
  id:             string
  order_number:   string
  status:         OrderStatus
  source:         'online' | 'qr' | 'pos'
  table_id:       string | null
  customer_name:  string | null
  customer_phone: string | null
  total_amount:   number
  note:           string | null
  created_at:     string
  items:          OrderItem[]
}
