'use client'
import { useEffect, useMemo, useRef } from 'react'
import { ComboSection } from './ComboSection'
import { ProductList } from './ProductList'
import type { Product, Combo, Category } from '@/types/product'

export interface MenuSection { id: string; label: string }

export const ALL_SECTION_ID = 'all'
const COMBO_SECTION_ID = 'sec-combo'

// DOM id for a section anchor — shared by the page so the sticky tabs can
// scrollIntoView() the matching section and the scroll-spy can measure it.
export const sectionDomId = (id: string) => `menu-${id}`

// Ordered list of sections rendered on the menu: combo first (if any), then each
// category that has products, in category sort order. Single source of truth so
// the sticky tabs and the rendered sections stay in lock-step.
export function buildMenuSections(
  products: Product[],
  combos: Combo[],
  categories: Category[],
): MenuSection[] {
  const withProducts = new Set(products.map(p => p.category_id))
  const cats = [...categories]
    .filter(c => withProducts.has(c.id))
    .sort((a, b) => a.sort_order - b.sort_order)
  return [
    ...(combos.length > 0 ? [{ id: COMBO_SECTION_ID, label: 'Suất' }] : []),
    ...cats.map(c => ({ id: `sec-${c.id}`, label: c.name })),
  ]
}

interface Props {
  products:       Product[]
  combos:         Combo[]
  sections:       MenuSection[]
  onActiveChange: (id: string) => void
}

export function MenuSections({ products, combos, sections, onActiveChange }: Props) {
  const grouped = useMemo(() => {
    const map = new Map<string, Product[]>()
    for (const p of products) {
      const arr = map.get(p.category_id)
      if (arr) arr.push(p)
      else map.set(p.category_id, [p])
    }
    return map
  }, [products])

  // Scroll-spy: the active tab follows the section whose top has crossed just
  // below the sticky tabs. Reports up only when the active id actually changes,
  // so a scroll doesn't re-render the card list on every frame.
  const onActiveChangeRef = useRef(onActiveChange)
  onActiveChangeRef.current = onActiveChange
  const lastActive = useRef('')

  useEffect(() => {
    const ids = [ALL_SECTION_ID, ...sections.map(s => s.id)]
    let raf = 0
    const compute = () => {
      raf = 0
      const line = 170 // px from viewport top — just below header + search + tabs
      let active = ALL_SECTION_ID
      for (const id of ids) {
        const el = document.getElementById(sectionDomId(id))
        if (!el) continue
        if (el.getBoundingClientRect().top - line <= 0) active = id
      }
      // At the bottom of the page the last sections can't reach the line — pin the
      // last section so tapping (or scrolling to) it still highlights correctly.
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      if (atBottom && ids.length > 1) active = ids[ids.length - 1]
      if (active !== lastActive.current) {
        lastActive.current = active
        onActiveChangeRef.current(active)
      }
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(compute) }
    compute()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [sections])

  return (
    <div className="flex flex-col gap-3">
      {/* Top anchor for the "Tất cả" tab */}
      <div id={sectionDomId(ALL_SECTION_ID)} className="scroll-mt-[160px]" aria-hidden />

      {sections.map(sec => {
        if (sec.id === COMBO_SECTION_ID) {
          return (
            <div key={sec.id} id={sectionDomId(sec.id)} className="scroll-mt-[160px]">
              <ComboSection combos={combos} visible />
            </div>
          )
        }
        const catId = sec.id.replace('sec-', '')
        const catProducts = grouped.get(catId) ?? []
        if (catProducts.length === 0) return null
        return (
          <div key={sec.id} id={sectionDomId(sec.id)} className="scroll-mt-[160px]">
            <h2 className="text-muted-fg font-semibold mb-2 mt-2 text-sm uppercase tracking-wide">
              {sec.label}
            </h2>
            <ProductList products={catProducts} withComboHeading={false} />
          </div>
        )
      })}
    </div>
  )
}
