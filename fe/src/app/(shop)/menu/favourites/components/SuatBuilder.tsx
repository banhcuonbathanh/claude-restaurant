'use client'
import { useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'
import { useCartStore, canhCartId } from '@/store/cart'
import { useFavouritesStore, type SuatLine, type SuatComboLine } from '@/store/favourites'
import { SuatImagePicker } from './SuatImagePicker'
import { formatVND } from '@/lib/utils'
import type { Product, Combo, Topping } from '@/types/product'
import type { CartItem } from '@/types/cart'

interface Props {
  products:     Product[]      // full menu (all available dishes), full shape with toppings
  combos:       Combo[]        // existing combos — pick nhân + qty, added as real combo lines
  canhCoRau:    Product | null
  canhKhongRau: Product | null
}

// Pseudo-ids for the two always-present canh rows (canh is never favourited — it is
// the standard 0đ add-on shown at the bottom of View C).
const CANH_RAU_KEY   = 'canh_rau'
const CANH_PLAIN_KEY = 'canh_plain'

const isSoupName = (name: string) =>
  name.toLowerCase().includes('canh') || name.toLowerCase().includes('nước dùng')

interface Row {
  key:      string
  product:  Product
  isCanh:   boolean
}

interface Group {
  category: string
  rows:     Row[]
}

// "Tự tạo suất" (View C) — assemble a custom suất from the FULL menu: existing combos
// (pick nhân + qty, like the menu ComboCard) plus every available dish grouped by
// category (each with its own nhân + ghi chú), and canh (0đ add-on). Live summary table
// with everything. "Lưu suất này" saves the recipe (món-lẻ + combos) + adds to the cart:
// món-lẻ as product lines, combos as REAL combo lines (owner decision, matches the menu).
export function SuatBuilder({ products, combos, canhCoRau, canhKhongRau }: Props) {
  const [qty,  setQty]  = useState<Record<string, number>>({})
  const [nhan, setNhan] = useState<Record<string, string>>({}) // productId → toppingId
  const [note, setNote] = useState<Record<string, string>>({}) // productId → ghi chú
  const [comboQty,  setComboQty]  = useState<Record<string, number>>({})        // comboId → qty in the suất
  const [comboNhan, setComboNhan] = useState<Record<string, Set<string>>>({})   // comboId → chosen nhân ids
  const [suatName,  setSuatName]  = useState('')                                // client's name for their combo
  const [suatImage, setSuatImage] = useState<string | null>(null)               // chosen cover image (menu url or upload)

  const router     = useRouter()
  const addToCart  = useCartStore(s => s.addItem)
  const setCanhQty = useCartStore(s => s.setCanhQty)
  const cartItems  = useCartStore(s => s.items)
  const addSuat    = useFavouritesStore(s => s.addSuat)

  // Group favourite products by category, preserving the API order (which is already
  // sorted by category + sort_order) — first-appearance decides group order.
  const groups: Group[] = useMemo(() => {
    const byCat = new Map<string, Row[]>()
    for (const p of products) {
      const rows = byCat.get(p.category_name) ?? []
      rows.push({ key: p.id, product: p, isCanh: false })
      byCat.set(p.category_name, rows)
    }
    return Array.from(byCat.entries()).map(([category, rows]) => ({ category, rows }))
  }, [products])

  // Suggested cover images = the restaurant's own menu images (combos first, then
  // dishes) that have a picture — a handful the client can pick as the suất cover.
  const imageSuggestions = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_STORAGE_URL ?? ''
    return [
      ...combos.filter(c => c.image_path).map(c => ({ url: `${base}/${c.image_path}`, label: c.name })),
      ...products.filter(p => p.image_path).map(p => ({ url: `${base}/${p.image_path}`, label: p.name })),
    ].slice(0, 12)
  }, [combos, products])

  // Combo nhân options — derived from the combo's BÁNH sub-items' toppings (dedup by id,
  // canh excluded), same as the menu ComboCard. Default selection = "nhân thịt" only.
  const comboNhanOptions = (combo: Combo): Topping[] =>
    Array.from(
      new Map(
        combo.items
          .filter(it => !isSoupName(it.product_name))
          .flatMap(it => it.toppings ?? [])
          .filter(t => t.is_available)
          .map(t => [t.id, t]),
      ).values(),
    )

  const defaultComboNhan = (combo: Combo): Set<string> => {
    const opts = comboNhanOptions(combo)
    const thit = opts.find(
      t => t.name.toLowerCase().includes('thịt') && !t.name.toLowerCase().includes('mộc'),
    )
    return new Set(thit ? [thit.id] : opts.map(t => t.id))
  }

  const selectedComboNhan = (combo: Combo): Set<string> =>
    comboNhan[combo.id] ?? defaultComboNhan(combo)

  // Multi-select nhân on a combo — can't drop the last remaining one (≥1 required).
  const toggleComboNhan = (combo: Combo, id: string) =>
    setComboNhan(prev => {
      const cur = new Set(prev[combo.id] ?? defaultComboNhan(combo))
      if (!cur.has(id)) cur.add(id)
      else if (cur.size > 1) cur.delete(id)
      return { ...prev, [combo.id]: cur }
    })

  const setComboRowQty = (comboId: string, n: number) =>
    setComboQty(prev => ({ ...prev, [comboId]: Math.max(0, n) }))

  const canhRows: Row[] = [
    canhCoRau    && { key: CANH_RAU_KEY,   product: canhCoRau,    isCanh: true },
    canhKhongRau && { key: CANH_PLAIN_KEY, product: canhKhongRau, isCanh: true },
  ].filter(Boolean) as Row[]

  // Selected nhân (topping) for a product row: chosen id, else first available.
  const selectedNhan = (p: Product) => {
    const options = p.toppings.filter(t => t.is_available)
    return options.find(t => t.id === nhan[p.id]) ?? options[0] ?? null
  }

  // Live totals — canh contributes 0đ; món-lẻ = qty × (base + nhân price); each combo
  // = qty × combo price (nhân on a combo is 0đ, like the menu).
  const { count, total } = useMemo(() => {
    let count = 0
    let total = 0
    const allRows = [...groups.flatMap(g => g.rows), ...canhRows]
    for (const r of allRows) {
      const n = qty[r.key] ?? 0
      count += n
      if (!r.isCanh) total += n * (r.product.price + (selectedNhan(r.product)?.price ?? 0))
    }
    for (const c of combos) {
      const n = comboQty[c.id] ?? 0
      count += n
      total += n * c.price
    }
    return { count, total }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qty, nhan, groups, canhRows, comboQty, combos])

  const setRowQty = (key: string, n: number) =>
    setQty(prev => ({ ...prev, [key]: Math.max(0, n) }))

  // Snapshot the current selection (qty > 0): món-lẻ product lines, whole-combo lines,
  // and canh lines — the single source for the summary, the save recipe and the cart.
  const buildSelection = () => {
    const productLines = groups.flatMap(g => g.rows).flatMap(r => {
      const n = qty[r.key] ?? 0
      if (n <= 0) return []
      return [{ product: r.product, qty: n, nhan: selectedNhan(r.product), note: (note[r.product.id] ?? '').trim() }]
    })
    const comboLines = combos.flatMap(c => {
      const n = comboQty[c.id] ?? 0
      if (n <= 0) return []
      const nhanToppings = comboNhanOptions(c).filter(t => selectedComboNhan(c).has(t.id))
      return [{ combo: c, qty: n, nhan: nhanToppings }]
    })
    const canhLines = canhRows.flatMap(r => {
      const n = qty[r.key] ?? 0
      if (n <= 0) return []
      return [{ product: r.product, kind: (r.key === CANH_RAU_KEY ? 'rau' : 'plain') as 'rau' | 'plain', qty: n }]
    })
    return { productLines, comboLines, canhLines }
  }

  // Detailed rows for the in-page summary table: combos first (name + chosen nhân),
  // then món-lẻ lines (nhân + ghi chú), then canh (0đ add-on). All carry a subtotal.
  const summaryRows = (() => {
    const { productLines, comboLines, canhLines } = buildSelection()
    return [
      ...comboLines.map(l => ({
        key:    `combo_${l.combo.id}`,
        name:   `🍱 ${l.combo.name}`,
        sub:    l.nhan.length > 0 ? l.nhan.map(t => t.name).join(', ') : undefined,
        note:   '',
        qty:    l.qty,
        amount: l.qty * l.combo.price,
      })),
      ...productLines.map(l => ({
        key:    `p_${l.product.id}`,
        name:   l.product.name,
        sub:    l.nhan?.name,
        note:   l.note,
        qty:    l.qty,
        amount: l.qty * (l.product.price + (l.nhan?.price ?? 0)),
      })),
      ...canhLines.map(l => ({
        key:    `c_${l.product.id}`,
        name:   `🥣 ${l.product.name}`,
        sub:    undefined as string | undefined,
        note:   '',
        qty:    l.qty,
        amount: 0,
      })),
    ]
  })()

  const handleConfirm = (name: string) => {
    const { productLines, comboLines, canhLines } = buildSelection()

    // 1. Persist the suất recipe as personal data: món-lẻ + canh lines, plus whole combos.
    const lines: SuatLine[] = [
      ...productLines.map(l => ({ productId: l.product.id, quantity: l.qty, toppingId: l.nhan?.id ?? null, note: l.note })),
      ...canhLines.map(l => ({ productId: l.product.id, quantity: l.qty, toppingId: null, note: '' })),
    ]
    const comboRecipe: SuatComboLine[] = comboLines.map(l => ({
      comboId: l.combo.id, quantity: l.qty, toppingIds: l.nhan.map(t => t.id),
    }))
    addSuat(name, lines, comboRecipe, suatImage ?? undefined)

    // 2. Add món-lẻ lines to the cart (nhân → toppings, ghi chú → note).
    for (const l of productLines) {
      const cartItem: CartItem = {
        id:         `product_${l.product.id}_${l.nhan?.id ?? 'plain'}`,
        type:       'product',
        product_id: l.product.id,
        name:       l.product.name,
        quantity:   l.qty,
        price:      l.product.price + (l.nhan?.price ?? 0),
        toppings:   l.nhan ? [{ id: l.nhan.id, name: l.nhan.name, price: l.nhan.price, is_available: true }] : [],
        ...(l.note ? { note: l.note } : {}),
      }
      addToCart(cartItem)
    }
    // 3. Add whole combos to the cart as real combo lines (mirrors the menu ComboCard).
    for (const l of comboLines) {
      const sortedIds = l.nhan.map(t => t.id).sort()
      const cartItem: CartItem = {
        id:          `combo_${l.combo.id}_${sortedIds.length > 0 ? sortedIds.join('-') : 'plain'}`,
        type:        'combo',
        combo_id:    l.combo.id,
        name:        l.combo.name,
        quantity:    l.qty,
        price:       l.combo.price,
        toppings:    l.nhan.map(t => ({ id: t.id, name: t.name, price: t.price, is_available: true })),
        combo_items: l.combo.items.map(i => ({
          product_id:   i.product_id,
          product_name: i.product_name,
          quantity:     i.quantity,
          unit_price:   i.unit_price,
          toppings:     i.toppings,
        })),
      }
      addToCart(cartItem)
    }
    // Canh is additive (setCanhQty sets an absolute qty) — mirror CanhQuickAdd.
    for (const l of canhLines) {
      const current = cartItems.find(i => i.id === canhCartId(l.product.id, l.kind))?.quantity ?? 0
      setCanhQty(l.product.id, null, l.kind, current + l.qty)
    }

    toast.success('Đã lưu suất & thêm vào giỏ hàng')
    router.push('/menu')
  }

  // Product / canh row — same card look as the menu ProductCard (image · name ·
  // price/qty/nhân on the right). Ghi chú appears below once the món is in the suất.
  const renderRow = (r: Row) => {
    const p        = r.product
    const n        = qty[r.key] ?? 0
    const options  = p.toppings.filter(t => t.is_available)
    const chosen   = selectedNhan(p)
    const rowPrice = r.isCanh ? 0 : p.price + (chosen?.price ?? 0)
    const imageUrl = p.image_path
      ? `${process.env.NEXT_PUBLIC_STORAGE_URL ?? ''}/${p.image_path}`
      : null

    return (
      <div key={r.key}>
        <div className="bg-card rounded-xl flex gap-3 p-3 shadow-sm">
          {/* Image */}
          <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
            {imageUrl ? (
              <Image src={imageUrl} alt={p.name} fill className="object-cover" sizes="80px" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-2xl">
                {r.isCanh ? '🥣' : '🍜'}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <p className="text-foreground text-sm font-semibold leading-snug line-clamp-2">{p.name}</p>
            {p.description && (
              <p className="text-muted-fg text-xs line-clamp-2">{p.description}</p>
            )}
          </div>

          {/* Right column — price · qty control · nhân pills */}
          <div className="flex-shrink-0 w-28 flex flex-col items-stretch gap-2.5">
            <p className="text-primary font-bold text-sm text-center">{formatVND(rowPrice)}</p>

            <div className="flex-1 flex items-center justify-between">
              <button
                onClick={() => setRowQty(r.key, n - 1)}
                disabled={n === 0}
                aria-label="Giảm số lượng"
                className="bg-muted text-foreground w-8 h-8 rounded-full flex items-center justify-center
                           hover:bg-muted/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Minus size={14} />
              </button>
              <span className="text-foreground text-sm font-bold text-center">{n}</span>
              <button
                onClick={() => setRowQty(r.key, n + 1)}
                aria-label="Tăng số lượng"
                className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center
                           hover:bg-primary/90 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>

            {!r.isCanh && options.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {options.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setNhan(prev => ({ ...prev, [p.id]: t.id }))}
                    className={`w-full text-center text-[11px] px-2 py-1 rounded-full border transition-colors ${
                      chosen?.id === t.id
                        ? 'bg-primary text-white border-primary'
                        : 'border-border text-muted-fg hover:border-primary/50'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ghi chú — shown once this món is in the suất (qty > 0) */}
        {!r.isCanh && n > 0 && (
          <div className="mt-1.5 flex items-center gap-2 bg-muted/40 border border-border rounded-lg px-3 py-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wide text-muted-fg flex-shrink-0">
              Ghi chú
            </span>
            <input
              type="text"
              value={note[p.id] ?? ''}
              onChange={e => setNote(prev => ({ ...prev, [p.id]: e.target.value }))}
              placeholder="vd: nhân để ngoài bánh, ít hành..."
              className="flex-1 min-w-0 bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}
      </div>
    )
  }

  const hasProducts = products.length > 0

  return (
    <>
      <div className="px-4 pt-3">
        <p className="text-[12.5px] text-muted-fg leading-relaxed mb-3">
          Chọn combo có sẵn (kèm nhân) hoặc từng món lẻ cho suất của riêng bạn — giá
          cập nhật theo lựa chọn.
        </p>

        {!hasProducts && (
          <EmptyState icon="🍽" message="Chưa có món nào trên menu" />
        )}

        {combos.length > 0 && (
          <section className="mb-4">
            <h2 className="text-muted-fg font-semibold mb-2 mt-2 text-sm uppercase tracking-wide">
              Suất có sẵn — chọn nhân &amp; số lượng
            </h2>
            <div className="flex flex-col gap-3">
              {combos.map(c => {
                const imageUrl = c.image_path
                  ? `${process.env.NEXT_PUBLIC_STORAGE_URL ?? ''}/${c.image_path}`
                  : null
                return (
                  <div key={c.id} className="bg-card rounded-xl flex gap-3 p-3 shadow-sm">
                    {/* Image */}
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                      {imageUrl ? (
                        <Image src={imageUrl} alt={c.name} fill className="object-cover" sizes="80px" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-2xl">🍱</div>
                      )}
                    </div>

                    {/* Content — name + item list */}
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <p className="text-foreground text-sm font-semibold leading-snug">{c.name}</p>
                      <ul className="space-y-0.5 mt-1">
                        {c.items.map(it => (
                          <li key={it.product_id} className="text-muted-fg text-xs flex items-center gap-1.5">
                            <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                              ×{it.quantity}
                            </span>
                            <span className="truncate">{it.product_name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Right column — price · qty · nhân pills (same as the menu ComboCard) */}
                    {(() => {
                      const n           = comboQty[c.id] ?? 0
                      const nhanOptions = comboNhanOptions(c)
                      const selected    = selectedComboNhan(c)
                      return (
                        <div className="flex-shrink-0 w-28 flex flex-col items-stretch gap-2.5">
                          <p className="text-primary font-bold text-sm text-center">{formatVND(c.price)}</p>

                          <div className="flex-1 flex items-center justify-between">
                            <button
                              onClick={() => setComboRowQty(c.id, n - 1)}
                              disabled={n === 0}
                              aria-label="Giảm số lượng suất"
                              className="bg-muted text-foreground w-8 h-8 rounded-full flex items-center justify-center
                                         hover:bg-muted/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-foreground text-sm font-bold text-center">{n}</span>
                            <button
                              onClick={() => setComboRowQty(c.id, n + 1)}
                              aria-label="Tăng số lượng suất"
                              className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center
                                         hover:bg-primary/90 transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          {nhanOptions.length > 0 && (
                            <div className="flex flex-col gap-1.5">
                              {nhanOptions.map(nhan => (
                                <button
                                  key={nhan.id}
                                  onClick={() => toggleComboNhan(c, nhan.id)}
                                  className={`w-full text-center text-[11px] px-2 py-1 rounded-full border transition-colors ${
                                    selected.has(nhan.id)
                                      ? 'bg-primary text-white border-primary'
                                      : 'border-border text-muted-fg hover:border-primary/50'
                                  }`}
                                >
                                  {nhan.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {groups.map(g => (
          <section key={g.category} className="mb-4">
            <h2 className="text-muted-fg font-semibold mb-2 mt-2 text-sm uppercase tracking-wide">
              {g.category}
            </h2>
            <div className="flex flex-col gap-3">{g.rows.map(renderRow)}</div>
          </section>
        ))}

        {canhRows.length > 0 && (
          <section className="mb-4">
            <h2 className="text-muted-fg font-semibold mb-2 mt-2 text-sm uppercase tracking-wide">Canh</h2>
            <div className="flex flex-col gap-3">{canhRows.map(renderRow)}</div>
          </section>
        )}

        {/* Cover image — quán suggestions or upload; sits right above the summary. */}
        <section className="mb-4">
          <h2 className="text-muted-fg font-semibold mb-2 mt-2 text-sm uppercase tracking-wide">
            Ảnh suất
          </h2>
          <div className="rounded-xl bg-card p-3 shadow-sm">
            <SuatImagePicker suggestions={imageSuggestions} value={suatImage} onChange={setSuatImage} />
          </div>
        </section>

        {/* Summary table (incl. canh) + inline save button — no longer floating. */}
        <section className="mb-4">
          <h2 className="text-muted-fg font-semibold mb-2 mt-2 text-sm uppercase tracking-wide">
            Tóm tắt suất
          </h2>
          <div className="rounded-xl bg-card p-3 shadow-sm">
            {summaryRows.length === 0 ? (
              <p className="text-sm text-muted-fg text-center py-4">
                Chưa chọn món nào — thêm món hoặc chọn một suất có sẵn ở trên.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-muted-fg">
                    <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wide">Món</th>
                    <th className="pb-2 text-center text-xs font-semibold uppercase tracking-wide">SL</th>
                    <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wide">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryRows.map(row => (
                    <tr key={row.key} className="border-b border-border/50 align-top">
                      <td className="py-2 pr-2 text-foreground">
                        {row.name}
                        {(row.sub || row.note) && (
                          <span className="block text-xs text-muted-fg">
                            {row.sub}
                            {row.sub && row.note && ' · '}
                            {row.note && <span className="italic">“{row.note}”</span>}
                          </span>
                        )}
                      </td>
                      <td className="py-2 text-center font-bold tabular-nums text-primary">×{row.qty}</td>
                      <td className="py-2 text-right tabular-nums text-primary">{formatVND(row.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border">
                    <td className="pt-2 font-bold text-foreground">Tổng cộng</td>
                    <td className="pt-2 text-center font-bold tabular-nums text-primary">×{count}</td>
                    <td className="pt-2 text-right font-bold tabular-nums text-primary">{formatVND(total)}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>

          {/* Name your combo — inline, right above the save button. */}
          <div className="mt-3">
            <label className="text-xs font-semibold text-foreground block mb-1.5">Tên suất của bạn</label>
            <input
              type="text"
              value={suatName}
              onChange={e => setSuatName(e.target.value)}
              placeholder="vd: Suất sáng của tôi, Suất 2 người..."
              className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-card text-foreground placeholder:text-muted-fg focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <Button
            onClick={() => handleConfirm(suatName.trim())}
            size="lg"
            disabled={count === 0 || suatName.trim().length === 0}
            className="mt-3 w-full"
          >
            Lưu suất này
          </Button>
        </section>

        <p className="text-[11px] text-muted-fg leading-relaxed px-0.5">
          Suất tự tạo sẽ xuất hiện trong <b className="text-foreground">Yêu thích</b> và trên <b className="text-foreground">Menu</b> để thêm nhanh vào giỏ.
        </p>
      </div>
    </>
  )
}
