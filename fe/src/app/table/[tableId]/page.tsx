'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/features/auth/auth.store'
import { useCartStore } from '@/store/cart'
import type { User } from '@/types/auth'

export default function TablePage({ params }: { params: { tableId: string } }) {
  const router = useRouter()
  const setAuth   = useAuthStore((s) => s.setAuth)
  const setTableId = useCartStore((s) => s.setTableId)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // params.tableId is the qr_token from the QR code
    api.post('/auth/guest', { qr_token: params.tableId })
      .then((res) => {
        const { access_token, table } = res.data.data
        // Build a minimal guest user shape for the store
        const guestUser: User = {
          id:        '',
          username:  'guest',
          full_name: `Bàn ${table.name}`,
          role:      'customer',
          is_active: true,
        }
        setAuth(guestUser, access_token)   // memory-only, never localStorage
        setTableId(table.id)
        router.replace('/menu')
      })
      .catch((err) => {
        const code = err?.response?.data?.error
        if (code === 'TABLE_HAS_ACTIVE_ORDER') {
          const activeId = err?.response?.data?.details?.active_order_id
          router.replace(activeId ? `/order/${activeId}` : '/menu')
        } else {
          setError('Mã bàn không hợp lệ hoặc đã hết hạn. Vui lòng quét lại QR.')
        }
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.tableId])

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 gap-4">
        <span className="text-4xl">⚠️</span>
        <p className="text-urgent text-center text-sm">{error}</p>
        <button
          onClick={() => router.replace('/menu')}
          className="text-primary text-sm underline"
        >
          Vào menu
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-muted-fg text-sm">Đang tải menu…</p>
    </div>
  )
}
