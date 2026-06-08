/**
 * buildOrderItemsPayload — CANH-2
 *
 * Verifies the single checkout payload builder mirrors the menu "Tổng số món"
 * preview: combo content overrides + nhân toppings + canh as normal CartItems.
 *
 * After CANH epic: canh items live in items[] with stable cartIds
 *   canh_<productId>_rau   → toppings:[rauTopping]   (có rau)
 *   canh_<productId>_plain → toppings:[]              (không rau)
 * No drink param — canh passes through like any product.
 */

import { describe, expect, it } from 'vitest'
import { buildOrderItemsPayload } from '@/lib/order-payload'
import type { CartItem } from '@/types/cart'

const RAU_TOPPING = { id: 't-rau', name: 'Rau mùi tàu', price: 0, is_available: true }

const combo = (over: Partial<CartItem> = {}): CartItem => ({
  id: 'combo_x_thit',
  type: 'combo',
  combo_id: 'combo-x',
  name: 'Suất Đầy Đủ Trứng Chín',
  quantity: 1,
  price: 30000,
  toppings: [{ id: 't-thit', name: 'Nhân thịt', price: 0, is_available: true }],
  combo_items: [
    { product_id: 'p-bc', product_name: 'Bánh Cuốn', quantity: 3, unit_price: 4000 },
    { product_id: 'p-gio', product_name: 'Giò', quantity: 1, unit_price: 9000 },
    { product_id: 'p-canh', product_name: 'Canh', quantity: 1, unit_price: 0, toppings: [RAU_TOPPING] },
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
  toppings: [{ id: 't-thit', name: 'Nhân thịt', price: 0, is_available: true }],
  ...over,
})

// Canh CartItems — in items[], not a separate counter
const canhRau = (qty: number): CartItem => ({
  id: 'canh_p-canh_rau',
  type: 'product',
  product_id: 'p-canh',
  name: 'Canh (có rau)',
  quantity: qty,
  price: 0,
  toppings: [RAU_TOPPING],
})

const canhPlain = (qty: number): CartItem => ({
  id: 'canh_p-canh_plain',
  type: 'product',
  product_id: 'p-canh',
  name: 'Canh (không rau)',
  quantity: qty,
  price: 0,
  toppings: [],
})

describe('buildOrderItemsPayload', () => {
  it('combo → overrides with topping_ids, canh excluded from combo', () => {
    const rows = buildOrderItemsPayload([combo(), canhRau(3), canhPlain(2)])
    const comboRow = rows.find(r => r.combo_id === 'combo-x')!
    expect(comboRow.combo_items).toEqual([
      { product_id: 'p-bc', quantity: 3, topping_ids: ['t-thit'] },
      { product_id: 'p-gio', quantity: 1, topping_ids: ['t-thit'] },
    ])
    // canh is NOT inside the combo
    expect(comboRow.combo_items!.some(ci => ci.product_id === 'p-canh')).toBe(false)
  })

  it('canh CartItems emit as standalone rows: có rau / không rau', () => {
    const rows = buildOrderItemsPayload([combo(), canhRau(3), canhPlain(2)])
    const canhRows = rows.filter(r => r.product_id === 'p-canh')
    expect(canhRows).toEqual([
      { product_id: 'p-canh', combo_id: null, quantity: 3, topping_ids: ['t-rau'] },
      { product_id: 'p-canh', combo_id: null, quantity: 2, topping_ids: [] },
    ])
  })

  it('standalone product carries topping_ids', () => {
    const rows = buildOrderItemsPayload([standalone()])
    expect(rows).toEqual([
      { product_id: 'p-bc', combo_id: null, quantity: 3, topping_ids: ['t-thit'] },
    ])
  })

  it('no canh rows when no canh items in cart', () => {
    const rows = buildOrderItemsPayload([standalone()])
    expect(rows.some(r => r.product_id === 'p-canh')).toBe(false)
  })

  it('all veg or all non-veg emits a single canh row', () => {
    const allVeg = buildOrderItemsPayload([combo(), canhRau(2)])
      .filter(r => r.product_id === 'p-canh')
    expect(allVeg).toEqual([
      { product_id: 'p-canh', combo_id: null, quantity: 2, topping_ids: ['t-rau'] },
    ])

    const allPlain = buildOrderItemsPayload([combo(), canhPlain(3)])
      .filter(r => r.product_id === 'p-canh')
    expect(allPlain).toEqual([
      { product_id: 'p-canh', combo_id: null, quantity: 3, topping_ids: [] },
    ])
  })
})
