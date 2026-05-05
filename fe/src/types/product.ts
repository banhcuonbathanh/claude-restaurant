export interface Category {
  id:         string
  name:       string
  sort_order: number
}

export interface Topping {
  id:           string
  name:         string
  price:        number
  is_available: boolean
}

export interface Product {
  id:            string
  category_id:   string
  category_name: string
  name:          string
  description:   string | null
  price:         number
  image_path:    string | null
  is_available:  boolean
  sort_order:    number
  toppings:      Topping[]
}

export interface ComboItem {
  product_id:   string
  product_name: string
  quantity:     number
}

// Raw shape from the API (/combos endpoint)
export interface ComboRaw {
  id:           string
  category_id:  string | null
  name:         string
  description:  string | null
  price:        number
  image_path:   string | null
  sort_order:   number
  is_available: boolean
  combo_items:  { id: string; product_id: string; quantity: number }[]
}

// Enriched shape used by components (product names resolved)
export interface Combo {
  id:           string
  category_id:  string | null
  name:         string
  description:  string | null
  price:        number
  image_path:   string | null
  sort_order:   number
  is_available: boolean
  items:        ComboItem[]
}
