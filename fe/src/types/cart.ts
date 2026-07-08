import type { Topping } from './product'

export interface ComboItemSummary {
  product_id?:  string   // needed to send combo content overrides at checkout
  product_name: string
  quantity:     number
  unit_price?:  number
  toppings?:    Topping[]  // available toppings on this sub-item's product (TOP-3 enrichment)
}

export interface CartItem {
  id:                string    // `product_${product_id}_${toppingIds}` or `combo_${combo_id}` or `canh_${productId}_rau|plain`
  type:              'product' | 'combo'
  product_id?:       string
  combo_id?:         string
  name:              string
  quantity:          number
  price:             number    // unit price (product.price + selected toppings)
  toppings:          Topping[]
  note?:             string    // free-text ghi chú (e.g. trứng note from "Tự tạo suất") → order item note
  combo_items?:      ComboItemSummary[]
}
