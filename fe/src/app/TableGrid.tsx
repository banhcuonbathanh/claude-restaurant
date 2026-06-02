'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import { QrCode, Shuffle, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/features/auth/auth.store'
import { useCartStore } from '@/store/cart'
import type { User } from '@/types/auth'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1'

const NAMES = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D', 'Hoàng Văn E']

interface Table { label: string; href: string }

function pick<T>(arr: T[], n: number): T[] {
  const copy = [...arr].sort(() => Math.random() - 0.5)
  return copy.slice(0, Math.min(n, copy.length))
}

function SimulateBtn({ table }: { table: Table }) {
  const router     = useRouter()
  const setAuth    = useAuthStore(s => s.setAuth)
  const setTableId   = useCartStore(s => s.setTableId)
  const setTableName = useCartStore(s => s.setTableName)
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [msg, setMsg]       = useState('')

  const qrToken = table.href.split('/table/')[1]

  const simulate = async () => {
    setStatus('loading')
    setMsg('Đang quét QR...')
    try {
      // 1 — Guest auth (simulate QR scan)
      const guestRes = await axios.post(`${API}/auth/guest`, { qr_token: qrToken })
      const { access_token, table: tableInfo } = guestRes.data.data
      const headers = { Authorization: `Bearer ${access_token}` }

      setMsg('Đang tải thực đơn...')

      // 2 — Fetch menu in parallel
      const [prodRes, comboRes] = await Promise.all([
        axios.get(`${API}/products`, { params: { is_available: true }, headers }),
        axios.get(`${API}/combos`, { headers }),
      ])

      const products: { id: string; price: number; name: string }[] = prodRes.data.data ?? []
      const combos: { id: string; price: number; name: string }[]   = comboRes.data.data ?? []

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

      setMsg('Đang đặt hàng...')

      // 4 — Place the order
      const orderRes = await axios.post(`${API}/orders`, {
        customer_name:  NAMES[Math.floor(Math.random() * NAMES.length)],
        customer_phone: '',
        note:           'Đơn demo — giả lập khách hàng',
        table_id:       tableInfo.id,
        source:         'qr',
        items,
      }, { headers })

      const order = orderRes.data.data

      // 5 — Set auth so order-tracking page works
      const guestUser: User = {
        id: '', username: 'guest',
        full_name: `Bàn ${tableInfo.name}`,
        role: 'customer', is_active: true,
      }
      setAuth(guestUser, access_token)
      setTableId(tableInfo.id)
      setTableName(tableInfo.name)

      setStatus('done')
      setMsg(`✓ Đặt ${items.length} món — đang chuyển trang...`)
      setTimeout(() => router.push(`/order/${order.id}`), 800)
    } catch (err: unknown) {
      const resp = (err as { response?: { data?: { error?: string; message?: string; details?: { active_order_id?: string } } } })?.response
      // Table already has an active order — go to it
      if (resp?.data?.error === 'TABLE_HAS_ACTIVE_ORDER') {
        const activeId = resp?.data?.details?.active_order_id
        setStatus('done')
        setMsg('Bàn đang có đơn — đang chuyển trang...')
        setTimeout(() => router.push(activeId ? `/order/${activeId}` : '/menu'), 800)
        return
      }
      setStatus('error')
      setMsg(resp?.data?.message ?? 'Giả lập thất bại')
      setTimeout(() => { setStatus('idle'); setMsg('') }, 3000)
    }
  }

  return (
    <button
      onClick={simulate}
      disabled={status === 'loading' || status === 'done'}
      title="Giả lập khách hàng — tự động chọn món và đặt hàng"
      className={`w-full flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-all disabled:opacity-60
        ${status === 'error'   ? 'border-urgent/40 bg-urgent/10 text-urgent' :
          status === 'done'    ? 'border-success/40 bg-success/10 text-success' :
          'border-border bg-muted/60 text-muted-fg hover:border-primary/40 hover:text-primary hover:bg-primary/5'}`}
    >
      {status === 'loading'
        ? <Loader2 size={11} className="animate-spin shrink-0" />
        : <Shuffle size={11} className="shrink-0" />}
      {status === 'idle' ? 'Giả lập khách' : msg || 'Giả lập khách'}
    </button>
  )
}

export default function TableGrid({ tables }: { tables: Table[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {tables.map(t => (
        <div key={t.href} className="flex flex-col gap-1.5 w-[140px]">
          <Link
            href={t.href}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary hover:shadow-sm"
          >
            <QrCode size={14} className="shrink-0 opacity-60" />
            <span className="truncate">{t.label}</span>
          </Link>
          <SimulateBtn table={t} />
        </div>
      ))}
    </div>
  )
}
