export interface ToppingSnapshotEntry {
  id:    string
  name:  string
  price: number
}

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
  toppings_snapshot: ToppingSnapshotEntry[] | null
  flagged:           boolean
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'cancelled'
  | 'paid'

export interface Order {
  id:             string
  order_number:   string
  status:         OrderStatus
  source:         'online' | 'qr' | 'pos'
  table_id:       string | null
  table_name?:    string | null
  customer_name:  string | null
  customer_phone: string | null
  total_amount:   number
  note:           string | null
  created_at:     string
  updated_at?:    string
  items:          OrderItem[]
}

// ── Monitor page types (SSE-driven order tracking) ────────────────────────────

export interface QueueItem {
  orderId: string
  tableLabel: string
  status: OrderStatus
  itemCount: number
  estimatedMinutes?: number
  orderNumber?: string
  createdAt?: string
  dishes?: OrderItem[]
}

export interface QueueState {
  queue: QueueItem[]
  position: number
  total: number
  estimatedMinutes: number
}

export interface MonitorTableStatus {
  id: string
  status: 'serving' | 'waiting' | 'empty'
  orderCount?: number
}
