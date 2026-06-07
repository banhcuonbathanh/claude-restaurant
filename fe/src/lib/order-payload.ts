import type { CartItem, DrinkConfig } from '@/types/cart'

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
// Three rules mirror OrderSummary's preview:
//   1. Combo contents → combo_items overrides (per-dish quantity + the combo's topping_ids).
//   2. Nhân (thịt/mộc nhĩ) → carried as topping_ids on standalone products and combo sub-items.
//   3. Canh is global: driven by the CANH stepper (drinkConfig), split into
//      có rau / không rau. "Có rau" rows carry the Rau topping via topping_ids (not a note).
//      "Không rau" rows carry topping_ids: []. Emitted as standalone rows — never inside a combo.
export function buildOrderItemsPayload(items: CartItem[], drink: DrinkConfig): OrderItemPayload[] {
  const rows: OrderItemPayload[] = []
  let canhProductId:     string | null = null
  let canhRauToppingId:  string | null = null

  for (const item of items) {
    if (item.type === 'combo') {
      const subs = item.combo_items ?? []
      // Remember the canh product and its Rau topping so the global drinkConfig rows can reference them.
      for (const ci of subs) {
        if (isSoupName(ci.product_name) && ci.product_id) {
          canhProductId = ci.product_id
          canhRauToppingId = (ci.toppings ?? []).find(t => t.is_available)?.id ?? canhRauToppingId
        }
      }
      // Override the combo with its non-canh dishes (canh is handled globally).
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
      // Standalone canh is folded into the global drinkConfig rows below.
      if (isSoupName(item.name)) {
        if (item.product_id) canhProductId = item.product_id
        canhRauToppingId = item.toppings.find(t => t.is_available)?.id ?? canhRauToppingId
        continue
      }
      rows.push({
        product_id:  item.product_id ?? null,
        combo_id:    null,
        quantity:    item.quantity,
        topping_ids: item.toppings.map(t => t.id),
      })
    }
  }

  // Global canh rows from the CANH stepper, split có rau / không rau.
  // "Có rau" rows carry the Rau topping via topping_ids; "Không rau" rows carry topping_ids: [].
  const { bowls, vegBowls } = drink
  const nonVeg = bowls - vegBowls
  if (bowls > 0 && canhProductId) {
    if (vegBowls > 0) rows.push({ product_id: canhProductId, combo_id: null, quantity: vegBowls, topping_ids: canhRauToppingId ? [canhRauToppingId] : [] })
    if (nonVeg   > 0) rows.push({ product_id: canhProductId, combo_id: null, quantity: nonVeg,   topping_ids: [] })
  }

  return rows
}
