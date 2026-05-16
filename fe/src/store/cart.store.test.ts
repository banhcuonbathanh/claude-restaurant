import { beforeEach, describe, expect, it } from 'vitest'
import { useCartStore } from '@/store/cart'
import type { CartItem } from '@/types/cart'

const RESET: Parameters<typeof useCartStore.setState>[0] = {
  items: [],
  tableId: null,
  activeOrderId: null,
  paymentMethod: null,
}

const item = (overrides: Partial<CartItem> = {}): CartItem => ({
  id: 'product_abc_',
  type: 'product',
  product_id: 'abc',
  name: 'Bánh cuốn',
  quantity: 1,
  price: 30000,
  toppings: [],
  ...overrides,
})

beforeEach(() => useCartStore.setState(RESET))

describe('cart store', () => {
  it('TestAddSameItemIncreasesQty', () => {
    const { addItem } = useCartStore.getState()
    addItem(item({ quantity: 1 }))
    addItem(item({ quantity: 2 }))
    const { items } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(3)
  })

  it('TestRemoveItem', () => {
    const { addItem, removeItem } = useCartStore.getState()
    addItem(item())
    removeItem('product_abc_')
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('TestClearCart', () => {
    const store = useCartStore.getState()
    store.addItem(item())
    store.setTableId('table-1')
    store.setActiveOrderId('order-1')
    store.setPaymentMethod('cash')
    useCartStore.getState().clearCart()
    const s = useCartStore.getState()
    expect(s.items).toHaveLength(0)
    expect(s.tableId).toBeNull()
    expect(s.activeOrderId).toBeNull()
    expect(s.paymentMethod).toBeNull()
  })

  it('TestTotalCalculation', () => {
    const { addItem } = useCartStore.getState()
    addItem(item({ id: 'p1', price: 30000, quantity: 2 }))
    addItem(item({ id: 'p2', price: 15000, quantity: 3 }))
    // 30000×2 + 15000×3 = 60000 + 45000 = 105000
    expect(useCartStore.getState().total()).toBe(105000)
  })
})
