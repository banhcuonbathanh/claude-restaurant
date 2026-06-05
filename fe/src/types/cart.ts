import type { Topping } from './product'

export interface DrinkConfig {
  bowls:    number   // total bowls of broth
  vegBowls: number   // how many of those bowls have vegetables (0–bowls)
}

export interface ComboItemSummary {
  product_id?:  string   // needed to send combo content overrides at checkout
  product_name: string
  quantity:     number
  unit_price?:  number
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
  filling?:          'thit' | 'moc_nhi'
}
