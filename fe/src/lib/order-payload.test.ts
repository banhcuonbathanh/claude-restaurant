/**
 * buildOrderItemsPayload — OC-3
 *
 * Verifies the single checkout payload builder mirrors the menu "Tổng số món"
 * preview: combo content overrides + filling + global canh split (có/không rau).
 */

import { describe, expect, it } from 'vitest'
import { buildOrderItemsPayload } from '@/lib/order-payload'
import type { CartItem } from '@/types/cart'

const combo = (over: Partial<CartItem> = {}): CartItem => ({
  id: 'combo_x_thit',
  type: 'combo',
  combo_id: 'combo-x',
  name: 'Suất Đầy Đủ Trứng Chín',
  quantity: 1,
  price: 30000,
  toppings: [],
  filling: 'thit',
  combo_items: [
    { product_id: 'p-bc', product_name: 'Bánh Cuốn', quantity: 3, unit_price: 4000 },
    { product_id: 'p-gio', product_name: 'Giò', quantity: 1, unit_price: 9000 },
    { product_id: 'p-canh', product_name: 'Canh', quantity: 1, unit_price: 0 },
  ],
  ...over,
})

const standalone = (over: Partial<CartItem> = {}): CartItem => ({
  id: 'product_p-bc_thit',
  type: 'product',
  product_id: 'p-bc',
  name: 'Bánh Cuốn',
  quantity: 3,
  price: 4000,
  toppings: [],
  filling: 'thit',
  ...over,
})

describe('buildOrderItemsPayload', () => {
  it('combo → overrides with filling, canh excluded from combo', () => {
    const rows = buildOrderItemsPayload([combo()], { bowls: 5, vegBowls: 3 })
    const comboRow = rows.find(r => r.combo_id === 'combo-x')!
    expect(comboRow.combo_items).toEqual([
      { product_id: 'p-bc', quantity: 3, filling: 'thit' },
      { product_id: 'p-gio', quantity: 1, filling: 'thit' },
    ])
    // canh is NOT inside the combo
    expect(comboRow.combo_items!.some(ci => ci.product_id === 'p-canh')).toBe(false)
  })

  it('canh is global: split into có rau / không rau from drinkConfig', () => {
    const rows = buildOrderItemsPayload([combo()], { bowls: 5, vegBowls: 3 })
    const canhRows = rows.filter(r => r.product_id === 'p-canh')
    expect(canhRows).toEqual([
      { product_id: 'p-canh', combo_id: null, quantity: 3, topping_ids: [], note: 'Có rau' },
      { product_id: 'p-canh', combo_id: null, quantity: 2, topping_ids: [], note: 'Không rau' },
    ])
  })

  it('standalone product carries filling', () => {
    const rows = buildOrderItemsPayload([standalone()], { bowls: 0, vegBowls: 0 })
    expect(rows).toEqual([
      { product_id: 'p-bc', combo_id: null, quantity: 3, topping_ids: [], filling: 'thit' },
    ])
  })

  it('no canh rows when stepper is 0', () => {
    const rows = buildOrderItemsPayload([standalone()], { bowls: 0, vegBowls: 0 })
    expect(rows.some(r => r.note === 'Có rau' || r.note === 'Không rau')).toBe(false)
  })

  it('all veg or all non-veg emits a single canh row', () => {
    const allVeg = buildOrderItemsPayload([combo()], { bowls: 2, vegBowls: 2 })
      .filter(r => r.product_id === 'p-canh')
    expect(allVeg).toEqual([
      { product_id: 'p-canh', combo_id: null, quantity: 2, topping_ids: [], note: 'Có rau' },
    ])
  })
})
