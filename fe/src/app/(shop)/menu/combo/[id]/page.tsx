'use client'
import { useState, useMemo, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Heart, Check } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { formatVND } from '@/lib/utils'
import { useCartStore, canhCartId } from '@/store/cart'
import { useFavouritesStore } from '@/store/favourites'
import { QuantityStepper } from '@/components/shared/QuantityStepper'
import type { ComboRaw, Combo, Product, Topping } from '@/types/product'

// Canh (có rau / không rau) are two distinct 0đ products — rau is NOT a topping.
const isSoupName = (name: string) =>
  name.toLowerCase().includes('canh') || name.toLowerCase().includes('nước dùng')

export default function ComboDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()
  const addItem = useCartStore(s => s.addItem)

  // Subscribe to the items array (not the stable isFavourite fn) so every heart
  // re-renders the instant a favourite is toggled.
  const favItems  = useFavouritesStore(s => s.items)
  const toggleFav = useFavouritesStore(s => s.toggleFav)
  const isFav     = (fid: string, type: 'product' | 'combo') =>
    favItems.some(i => i.id === fid && i.type === type)
  const faved     = isFav(id, 'combo')

  // Local builder state (nothing hits the cart until "Thêm vào giỏ")
  const [comboQty, setComboQty]     = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [canhQty, setCanhQty]       = useState<{ rau: number; plain: number }>({ rau: 0, plain: 0 })
  const [note, setNote]             = useState('')

  const { data: rawCombos = [], isLoading, isError } = useQuery<ComboRaw[]>({
    queryKey: ['combos'],
    queryFn: () => api.get('/combos').then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  })

  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ['products-all'],
    queryFn: () => api.get('/products').then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  })

  const productMap = useMemo(
    () => new Map(allProducts.map(p => [p.id, p])),
    [allProducts],
  )

  const combo = useMemo<Combo | undefined>(() => {
    const raw = rawCombos.find(c => c.id === id)
    if (!raw) return undefined
    return {
      id:           raw.id,
      category_id:  raw.category_id,
      name:         raw.name,
      description:  raw.description,
      price:        raw.price,
      image_path:   raw.image_path,
      sort_order:   raw.sort_order,
      is_available: raw.is_available,
      items: (raw.combo_items ?? []).map(ci => ({
        product_id:   ci.product_id,
        product_name: productMap.get(ci.product_id)?.name ?? ci.product_id,
        unit_price:   productMap.get(ci.product_id)?.price,
        quantity:     ci.quantity,
        toppings:     productMap.get(ci.product_id)?.toppings ?? [],
      })),
    }
  }, [rawCombos, productMap, id])

  // Nhân options = available toppings of the combo's non-canh dishes, deduped by id.
  // Matches the shipped ComboCard pattern (canh's rau topping is excluded — it is
  // driven by the canh stepper, not the nhân picker).
  const nhanOptions = useMemo<Topping[]>(() => {
    if (!combo) return []
    return Array.from(
      new Map(
        combo.items
          .filter(ci => !isSoupName(ci.product_name))
          .flatMap(ci => ci.toppings ?? [])
          .filter(t => t.is_available)
          .map(t => [t.id, t]),
      ).values(),
    )
  }, [combo])

  // Default nhân = "thịt" (not mộc nhĩ); fall back to all options so a combo always
  // starts with ≥1 nhân selected. Runs once when options first load.
  useEffect(() => {
    if (nhanOptions.length === 0 || selectedIds.size > 0) return
    const thit = nhanOptions.find(
      t => t.name.toLowerCase().includes('thịt') && !t.name.toLowerCase().includes('mộc'),
    )
    setSelectedIds(new Set(thit ? [thit.id] : nhanOptions.map(t => t.id)))
  }, [nhanOptions, selectedIds])

  // Toggle a nhân; the last remaining selection cannot be removed (≥1 required).
  function toggleNhan(tid: string) {
    setSelectedIds(prev => {
      if (!prev.has(tid)) return new Set(prev).add(tid)
      if (prev.size <= 1) return prev
      const next = new Set(prev)
      next.delete(tid)
      return next
    })
  }

  // Canh products (có rau / không rau) resolved from the catalogue.
  const { canhCoRau, canhKhongRau } = useMemo(() => {
    const soups = allProducts.filter(p => p.is_available && isSoupName(p.name))
    const khong = soups.find(p => p.name.toLowerCase().includes('không')) ?? null
    const co    = soups.find(p => p !== khong) ?? null
    return { canhCoRau: co, canhKhongRau: khong }
  }, [allProducts])

  const imageUrl = combo?.image_path
    ? `${process.env.NEXT_PUBLIC_STORAGE_URL ?? ''}/${combo.image_path}`
    : null

  const selectedToppings = nhanOptions.filter(t => selectedIds.has(t.id))
  const nhanPrice        = selectedToppings.reduce((s, t) => s + t.price, 0)
  const nhanKey          = Array.from(selectedIds).sort().join('-') || 'plain'

  const comboLineTotal = (combo ? (combo.price + nhanPrice) * comboQty : 0)
  const total          = comboLineTotal

  const canhCount     = canhQty.rau + canhQty.plain
  const totalPortions = comboQty + canhCount

  // Commit the current selection (combo + nhân + note + canh) to the cart. No navigation.
  function commitToCart() {
    if (!combo) return

    // 1. Combo line — chosen nhân rides along as topping_ids (same shape as ComboCard,
    //    so a combo+nhân added here merges with the same combo+nhân from the menu card).
    addItem({
      id:          `combo_${combo.id}_${nhanKey}`,
      type:        'combo',
      combo_id:    combo.id,
      name:        combo.name,
      quantity:    comboQty,
      price:       combo.price + nhanPrice,
      toppings:    selectedToppings,
      note:        note.trim() || undefined,
      combo_items: combo.items.map(i => ({
        product_id: i.product_id, product_name: i.product_name, quantity: i.quantity, unit_price: i.unit_price, toppings: i.toppings,
      })),
    })

    // 2. Canh — standalone 0đ lines (có rau / không rau are distinct products).
    if (canhCoRau && canhQty.rau > 0) {
      addItem({
        id: canhCartId(canhCoRau.id, 'rau'), type: 'product', product_id: canhCoRau.id,
        name: 'Canh (có rau)', quantity: canhQty.rau, price: 0, toppings: [],
      })
    }
    if (canhKhongRau && canhQty.plain > 0) {
      addItem({
        id: canhCartId(canhKhongRau.id, 'plain'), type: 'product', product_id: canhKhongRau.id,
        name: 'Canh (không rau)', quantity: canhQty.plain, price: 0, toppings: [],
      })
    }
  }

  // "Thanh toán" — add then go straight to checkout with the updated cart.
  function handleCheckout() {
    commitToCart()
    router.push('/checkout')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-sm rounded-full p-2 shadow"
        aria-label="Quay lại"
      >
        <ArrowLeft size={20} className="text-foreground" />
      </button>

      {isLoading && <ComboDetailSkeleton />}

      {(isError || (!isLoading && !combo)) && (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6">
          <p className="text-muted-fg text-center">Không tìm thấy combo.</p>
          <button onClick={() => router.back()} className="text-primary text-sm underline">
            Quay lại menu
          </button>
        </div>
      )}

      {combo && (
        <>
          {/* Zone A — Hero image */}
          <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted rounded-b-3xl">
            {imageUrl ? (
              <Image src={imageUrl} alt={combo.name} fill className="object-cover" sizes="100vw" priority />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-6xl bg-muted">🍱</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
            <span className="absolute bottom-3 left-4 bg-primary text-primary-fg text-xs font-bold px-3 py-1 rounded-full shadow">
              Combo tiết kiệm
            </span>
          </div>

          {/* Zone B — Name, availability, price, description */}
          <div className="px-4 pt-4 pb-4 flex flex-col gap-3">
            <div className="flex items-start gap-2">
              <h1 className="text-xl font-bold text-foreground flex-1 leading-snug">{combo.name}</h1>
              {!combo.is_available && (
                <span className="flex-shrink-0 text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-600">
                  Hết hàng
                </span>
              )}
            </div>

            <p className="text-2xl font-bold text-primary">{formatVND(combo.price)}</p>

            <button
              onClick={() => toggleFav(combo.id, 'combo')}
              className={[
                'self-start flex items-center gap-1.5 text-sm font-medium rounded-full border px-3 py-1.5 transition-colors active:scale-95',
                faved ? 'border-red-500 text-red-500 bg-red-500/5' : 'border-border text-muted-fg hover:border-red-400',
              ].join(' ')}
              aria-label={faved ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
              aria-pressed={faved}
            >
              <Heart size={16} className={faved ? 'text-red-500' : ''} fill={faved ? 'currentColor' : 'none'} />
              {faved ? 'Đã yêu thích' : 'Yêu thích'}
            </button>
          </div>

          {/* Zone C — Items list */}
          {combo.items.length > 0 && (
            <div className="px-4 pt-4 pb-4 flex flex-col gap-3 border-t border-border">
              <h2 className="text-sm font-semibold text-foreground">Gồm có</h2>
              <ul className="flex flex-col gap-2">
                {combo.items.map(item => (
                  <li key={item.product_id} className="flex items-center gap-3">
                    <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                      ×{item.quantity}
                    </span>
                    <span className="text-sm text-foreground">{item.product_name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Zone D — Chọn nhân */}
          {nhanOptions.length > 0 && (
            <div className="px-4 pt-4 pb-4 flex flex-col gap-3 border-t border-border">
              <h2 className="text-sm font-semibold text-foreground">
                Chọn nhân <span className="font-normal text-muted-fg">(chọn ít nhất 1 · có thể chọn cả 2)</span>
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {nhanOptions.map(t => {
                  const active = selectedIds.has(t.id)
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleNhan(t.id)}
                      className={[
                        'flex items-center justify-between gap-2 p-3 rounded-xl border text-left transition-colors min-h-[44px]',
                        active ? 'border-primary bg-primary text-white' : 'border-border bg-card text-foreground hover:border-primary/40',
                      ].join(' ')}
                    >
                      <span className="text-xs font-medium leading-snug">{t.name}</span>
                      <span className="flex items-center gap-1">
                        {t.price > 0 && (
                          <span className={`text-xs font-semibold ${active ? 'text-white' : 'text-primary'}`}>+{formatVND(t.price)}</span>
                        )}
                        {active && <Check size={14} className="text-white" />}
                      </span>
                    </button>
                  )
                })}
              </div>
              {selectedIds.size >= 2 && (
                <p className="text-xs text-muted-fg">
                  Quán sẽ làm ½ nhân thịt · ½ nhân mộc nhĩ cho mỗi suất.
                </p>
              )}
            </div>
          )}

          {/* Zone E — Chọn canh */}
          {(canhCoRau || canhKhongRau) && (
            <div className="px-4 pt-4 pb-4 flex flex-col gap-3 border-t border-border">
              <h2 className="text-sm font-semibold text-foreground">
                Chọn canh <span className="font-normal text-muted-fg">(miễn phí)</span>
              </h2>
              <div className="space-y-2">
                {[
                  { kind: 'rau'   as const, emoji: '🥣', label: 'Canh có rau',    present: !!canhCoRau },
                  { kind: 'plain' as const, emoji: '🍲', label: 'Canh không rau', present: !!canhKhongRau },
                ].filter(r => r.present).map(r => (
                  <div key={r.kind} className="flex items-center justify-between bg-card rounded-xl px-3 py-2 border border-border">
                    <span className="text-sm text-foreground">
                      {r.emoji} {r.label} · <span className="text-muted-fg">{formatVND(0)}</span>
                    </span>
                    <QuantityStepper
                      value={canhQty[r.kind]}
                      min={0}
                      size="sm"
                      onChange={v => setCanhQty(prev => ({ ...prev, [r.kind]: v }))}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Zone F — Ghi chú */}
          <div className="px-4 pt-4 pb-4 flex flex-col gap-2 border-t border-border">
            <h2 className="text-sm font-semibold text-foreground">
              Ghi chú <span className="font-normal text-muted-fg">(tuỳ chọn)</span>
            </h2>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              maxLength={200}
              placeholder="vd: ít hành, nhân để riêng, không rau mùi..."
              className="w-full resize-none rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-fg px-3 py-2 focus:outline-none focus:border-primary/60"
            />
          </div>

          {/* Zone G — Combo QtyStepper + CTA (in normal flow, not floating).
              pb clears the global bottom nav (z-20). */}
          <div className="px-4 pt-4 pb-28 flex flex-col gap-4 border-t border-border">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-foreground">Số lượng combo</span>
              <div className="ml-auto">
                <QuantityStepper value={comboQty} min={1} onChange={setComboQty} accentPlus />
              </div>
            </div>

            {combo.is_available ? (
              <button
                onClick={handleCheckout}
                className="w-full bg-primary text-primary-fg font-semibold text-sm rounded-xl py-4 flex flex-col items-center justify-center leading-tight active:scale-[.98] transition-transform"
              >
                <span>Thanh toán · {totalPortions} món</span>
                <span className="text-base font-bold">{formatVND(total)}</span>
              </button>
            ) : (
              <button
                disabled
                className="w-full bg-primary text-primary-fg font-semibold text-sm rounded-xl py-4 opacity-50 cursor-not-allowed"
              >
                Combo tạm hết
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function ComboDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="w-full aspect-[4/3] bg-muted rounded-b-3xl" />
      <div className="px-4 pt-4 pb-4 flex flex-col gap-3">
        <div className="h-7 bg-muted rounded w-3/4" />
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-5/6" />
        </div>
      </div>
      <div className="px-4 pt-4 pb-32 flex flex-col gap-3 border-t border-border">
        <div className="h-4 bg-muted rounded w-1/4" />
        {[0, 1, 2].map(i => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-5 bg-muted rounded-full" />
            <div className="flex-1 h-4 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
