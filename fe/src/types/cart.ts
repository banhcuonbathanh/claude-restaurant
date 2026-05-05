import type { Topping } from './product'

export interface ComboItemSummary {
  product_name: string
  quantity:     number
}

export interface CartItem {
  id:                string    // `product_${product_id}_${toppingIds}` or `combo_${combo_id}`
  type:              'product' | 'combo'
  product_id?:       string
  combo_id?:         string
  name:              string
  quantity:          number
  price:             number    // unit price (product.price + selected toppings)
  toppings:          Topping[]
  combo_items?:      ComboItemSummary[]
}
