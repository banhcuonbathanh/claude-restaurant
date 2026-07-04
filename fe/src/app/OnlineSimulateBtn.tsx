'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { ShoppingBag, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/features/auth/auth.store'
import { useCartStore } from '@/store/cart'
import type { User } from '@/types/auth'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1'

const NAMES     = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D', 'Hoàng Văn E']
const ADDRESSES = [
  '12 Lê Lợi, Q.1, TP.HCM',
  '88 Nguyễn Huệ, Q.1, TP.HCM',
  '45 Trần Hưng Đạo, Q.5, TP.HCM',
  '210 Cách Mạng Tháng 8, Q.3, TP.HCM',
]

function pick<T>(arr: T[], n: number): T[] {
  const copy = [...arr].sort(() => Math.random() - 0.5)
  return copy.slice(0, Math.min(n, copy.length))
}

/**
 * Demo "buy online" flow. Online orders have no table — we mint an online-guest token
 * (POST /auth/guest/online, no table binding) to authenticate the order POST, then place
 * an order with source=online / table_id=null.
 * The order is tracked by its opaque id on /orders (BE lets guests view table-less orders).
 */
export default function OnlineSimulateBtn() {
  const router       = useRouter()
  const setAuth      = useAuthStore(s => s.setAuth)
  const setActiveId  = useCartStore(s => s.setActiveOrderId)
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [msg, setMsg]       = useState('')

  const simulate = async () => {
    setStatus('loading')
    setMsg('Đang khởi tạo phiên...')
    try {
      // 1 — Mint an online-guest token (no table) to authenticate the order POST
      const guestRes = await axios.post(`${API}/auth/guest/online`)
      const { access_token } = guestRes.data.data
      const headers = { Authorization: `Bearer ${access_token}` }

      setMsg('Đang tải thực đơn...')

      // 2 — Fetch menu in parallel
      const [prodRes, comboRes] = await Promise.all([
        axios.get(`${API}/products`, { params: { is_available: true }, headers }),
        axios.get(`${API}/combos`, { headers }),
      ])

      const products: { id: string }[] = prodRes.data.data ?? []
      const combos: { id: string }[]   = comboRes.data.data ?? []

      if (products.length === 0 && combos.length === 0) {
        setStatus('error'); setMsg('Không có món nào'); return
      }

      setMsg('Đang chọn món ngẫu nhiên...')

      // 3 — Pick 2–4 random products + 0–1 random combo
      const chosenProducts = pick(products, Math.floor(Math.random() * 3) + 2)
      const chosenCombos   = combos.length > 0 && Math.random() > 0.4 ? pick(combos, 1) : []

      const items = [
        ...chosenProducts.map(p => ({
          product_id: p.id,
          combo_id:   null,
          quantity:   Math.floor(Math.random() * 2) + 1,
          topping_ids: [],
        })),
        ...chosenCombos.map(c => ({
          product_id: null,
          combo_id:   c.id,
          quantity:   1,
          topping_ids: [],
        })),
      ]

      setMsg('Đang đặt đơn online...')

      // 4 — Place an ONLINE order (no table). created_by is stored NULL for guests.
      const orderRes = await axios.post(`${API}/orders`, {
        customer_name:    NAMES[Math.floor(Math.random() * NAMES.length)],
        customer_phone:   '0901234567',
        delivery_address: ADDRESSES[Math.floor(Math.random() * ADDRESSES.length)],
        note:             'Đơn demo — giả lập mua đồ online',
        source:           'online',
        items,
      }, { headers })

      const order = orderRes.data.data

      // 5 — Persist auth so the tracking page (/orders) can GET the order + open SSE
      const guestUser: User = {
        id: '', username: 'guest',
        full_name: 'Khách online', role: 'customer', is_active: true,
      }
      setAuth(guestUser, access_token)
      setActiveId(order.id)

      setStatus('done')
      setMsg(`✓ Đặt ${items.length} món — đang chuyển trang...`)
      setTimeout(() => router.push(`/orders?id=${order.id}`), 800)
    } catch (err: unknown) {
      const resp = (err as { response?: { data?: { message?: string } } })?.response
      setStatus('error')
      setMsg(resp?.data?.message ?? 'Giả lập thất bại')
      setTimeout(() => { setStatus('idle'); setMsg('') }, 3000)
    }
  }

  return (
    <button
      onClick={simulate}
      disabled={status === 'loading' || status === 'done'}
      title="Giả lập mua đồ online — tự đặt đơn giao hàng, không cần bàn"
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold border transition-all disabled:opacity-60
        ${status === 'error' ? 'border-urgent/40 bg-urgent/10 text-urgent' :
          status === 'done'  ? 'border-success/40 bg-success/10 text-success' :
          'border-primary/40 bg-primary/10 text-primary hover:bg-primary/15'}`}
    >
      {status === 'loading'
        ? <Loader2 size={15} className="animate-spin shrink-0" />
        : <ShoppingBag size={15} className="shrink-0" />}
      {status === 'idle' ? 'Giả lập mua đồ online' : msg || 'Giả lập mua đồ online'}
    </button>
  )
}
