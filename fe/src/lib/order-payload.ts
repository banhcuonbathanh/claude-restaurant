import type { CartItem } from '@/types/cart'

// One item in a POST /orders (or POST /orders/:id/items) request body.
export interface OrderItemPayload {
  product_id:   string | null
  combo_id:     string | null
  quantity:     number
  topping_ids:  string[]
  note?:        string
  combo_items?: { product_id: string; quantity: number; note?: string; topping_ids?: string[] }[]
}

const isSoupName = (name: string) =>
  name.toLowerCase().includes('canh') || name.toLowerCase().includes('nước dùng')

// buildOrderItemsPayload is the SINGLE source for turning the cart into the order
// API payload. Every checkout path (table confirm, online checkout, add-to-order)
// must use it so the saved order matches the menu's "Tổng số món" preview exactly.
//
// Two rules mirror OrderSummary's preview:
//   1. Combo contents → combo_items overrides (per-dish quantity + the combo's topping_ids).
//      Canh sub-items are stripped from combos — canh lives as standalone CartItems.
//   2. Nhân (thịt/mộc nhĩ) → carried as topping_ids on standalone products and combo sub-items.
//   3. Canh: each canh CartItem (cartId canh_<id>_rau / canh_<id>_plain) passes through as a
//      normal product row. "Có rau" carries the Rau topping via topping_ids (already on the item).
//      "Không rau" carries topping_ids: []. Never inside a combo.
export function buildOrderItemsPayload(items: CartItem[]): OrderItemPayload[] {
  const rows: OrderItemPayload[] = []

  for (const item of items) {
    if (item.type === 'combo') {
      const subs = item.combo_items ?? []
      // Override the combo with its non-canh dishes (canh is a standalone CartItem).
      const overrides = subs
        .filter(ci => !isSoupName(ci.product_name) && ci.product_id)
        .map(ci => ({ product_id: ci.product_id!, quantity: ci.quantity, topping_ids: item.toppings.map(t => t.id) }))

      const row: OrderItemPayload = {
        product_id:  null,
        combo_id:    item.combo_id ?? null,
        quantity:    item.quantity,
        topping_ids: [],
      }
      if (overrides.length > 0) row.combo_items = overrides
      rows.push(row)
    } else {
      // Standalone products (including canh items) pass through directly.
      rows.push({
        product_id:  item.product_id ?? null,
        combo_id:    null,
        quantity:    item.quantity,
        topping_ids: item.toppings.map(t => t.id),
      })
    }
  }

  return rows
}
