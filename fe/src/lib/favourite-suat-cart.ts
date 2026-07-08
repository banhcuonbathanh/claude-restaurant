import type { Product } from '@/types/product'
import type { CartItem } from '@/types/cart'
import type { SuatLine } from '@/store/favourites'

// Canh is stepper-only (có rau / không rau are two distinct real products) — mirrors
// the SuatBuilder + menu OrderSummary sourcing.
const isSoupName = (name: string) =>
  name.toLowerCase().includes('canh') || name.toLowerCase().includes('nước dùng')

export interface SuatCanhOp {
  productId: string
  kind:      'rau' | 'plain'
  qty:       number
}

export interface SuatCartResult {
  productItems: CartItem[]   // món-lẻ lines → addItem
  canhOps:      SuatCanhOp[] // canh lines → setCanhQty (additive)
  missing:      number       // lines dropped because the product no longer exists
}

/**
 * Resolve a saved suất's món-lẻ lines into cart operations.
 * Single source of truth for "re-add a saved suất to the cart" — shared by the
 * favourites page (Suất đã lưu → Thêm vào giỏ) and the menu FavouritesRail
 * (one-tap re-add) so the two paths can never diverge. Faithful to
 * SuatBuilder.handleConfirm: product lines carry nhân + ghi chú, canh lines route
 * through setCanhQty. Lines whose product no longer exists are silently dropped.
 */
export function resolveSuatToCart(lines: SuatLine[], products: Product[]): SuatCartResult {
  const productItems: CartItem[] = []
  const canhOps: SuatCanhOp[] = []
  let missing = 0

  for (const line of lines) {
    const p = products.find(x => x.id === line.productId)
    if (!p) { missing++; continue }

    if (isSoupName(p.name)) {
      const kind = p.name.toLowerCase().includes('không') ? 'plain' : 'rau'
      canhOps.push({ productId: p.id, kind, qty: line.quantity })
      continue
    }

    const nhan = line.toppingId
      ? (p.toppings ?? []).find(t => t.id === line.toppingId) ?? null
      : null
    productItems.push({
      id:         `product_${p.id}_${nhan?.id ?? 'plain'}`,
      type:       'product',
      product_id: p.id,
      name:       p.name,
      quantity:   line.quantity,
      price:      p.price + (nhan?.price ?? 0),
      toppings:   nhan ? [{ id: nhan.id, name: nhan.name, price: nhan.price, is_available: true }] : [],
      ...(line.note ? { note: line.note } : {}),
    })
  }

  return { productItems, canhOps, missing }
}

export interface SuatTotals {
  count: number   // total món (incl. canh)
  total: number   // đ — canh contributes 0đ
}

// Display totals for a saved-suất card: count = every line's qty; total = món-lẻ
// lines only (canh is the standard 0đ add-on). Missing products are skipped.
export function suatTotals(lines: SuatLine[], products: Product[]): SuatTotals {
  let count = 0
  let total = 0
  for (const line of lines) {
    count += line.quantity
    const p = products.find(x => x.id === line.productId)
    if (!p || isSoupName(p.name)) continue
    const nhan = line.toppingId ? (p.toppings ?? []).find(t => t.id === line.toppingId) : null
    total += line.quantity * (p.price + (nhan?.price ?? 0))
  }
  return { count, total }
}

// Resolve line names (for the card món list). Unknown products fall back to a label.
export function suatLineNames(lines: SuatLine[], products: Product[]): Array<{ name: string; qty: number }> {
  return lines.map(line => {
    const p = products.find(x => x.id === line.productId)
    return { name: p?.name ?? 'Món không rõ tên', qty: line.quantity }
  })
}
