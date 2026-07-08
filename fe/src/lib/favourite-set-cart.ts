import type { Product } from '@/types/product'
import type { CartItem } from '@/types/cart'
import type { FavouriteItem } from '@/store/favourites'

// Minimal combo shape needed to build a cart line — satisfied by both
// `ComboRaw` (/combos raw) and the enriched `Combo`.
type ComboLike = { id: string; name: string; price: number }

/**
 * Resolve a favourite set's items into cart lines.
 * Single source of truth for "apply a saved set to the cart" — shared by the
 * /sets page (Áp dụng) and the menu FavouritesRail (pinned-set one-tap re-add)
 * so the two paths can never diverge. Items whose product/combo no longer
 * exists are silently dropped.
 */
export function favouriteSetToCartItems(
  items: FavouriteItem[],
  products: Product[],
  combos: ComboLike[],
): CartItem[] {
  return items.flatMap<CartItem>(item => {
    if (item.type === 'product') {
      const p = products.find(x => x.id === item.id)
      if (!p) return []
      const selectedToppings = (p.toppings ?? []).filter(t => item.toppingIds.includes(t.id))
      return [{
        id:         `product_${item.id}_${[...item.toppingIds].sort().join('-')}`,
        type:       'product',
        product_id: item.id,
        name:       p.name,
        quantity:   item.qty,
        price:      p.price + selectedToppings.reduce((s, t) => s + t.price, 0),
        toppings:   selectedToppings.map(t => ({
          id: t.id, name: t.name, price: t.price, is_available: true,
        })),
      }]
    }
    const c = combos.find(x => x.id === item.id)
    if (!c) return []
    return [{
      id:       `combo_${item.id}`,
      type:     'combo',
      combo_id: item.id,
      name:     c.name,
      quantity: item.qty,
      price:    c.price,
      toppings: [],
    }]
  })
}
