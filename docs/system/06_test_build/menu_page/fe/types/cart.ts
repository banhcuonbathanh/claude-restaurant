// P-SYSTEST reference build — mirrors fe/src/types/cart.ts; not imported by the app.
import type { Topping } from './product'

export interface ComboItemSummary {
  product_id?:  string   // needed to send combo content overrides at checkout
  product_name: string
  quantity:     number
  unit_price?:  number
  toppings?:    Topping[]  // available toppings on this sub-item's product (TOP-3 enrichment)
}

export interface CartItem {
  id:           string    // `product_<id>_<toppingId|plain>` · `combo_<id>_<toppingId|plain>` · `canh_<productId>_rau|plain`
  type:         'product' | 'combo'
  product_id?:  string
  combo_id?:    string
  name:         string
  quantity:     number
  price:        number    // UNIT price = product.price + Σ selected toppings (card pre-sums)
  toppings:     Topping[]
  combo_items?: ComboItemSummary[]
}
