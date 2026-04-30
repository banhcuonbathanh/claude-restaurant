'use client'
import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/features/auth/auth.store'
import { AuthGuard } from '@/components/guards/AuthGuard'
import { RoleGuard } from '@/components/guards/RoleGuard'
import { Role } from '@/types/auth'
import { formatVND } from '@/lib/utils'
import type { Order } from '@/types/order'

type PaymentMethod = 'vnpay' | 'momo' | 'zalopay' | 'cod'

interface Payment {
  id:          string
  order_id:    string
  method:      PaymentMethod
  amount:      number
  status:      'pending' | 'completed' | 'failed'
  qr_code_url: string | null
}

interface WsMsg {
  type:     string
  order_id: string
}

const METHOD_LABELS: Record<PaymentMethod, string> = {
  cod:     'Tiền mặt',
  vnpay:   'VNPay',
  momo:    'MoMo',
  zalopay: 'ZaloPay',
}

export default function PaymentPage() {
  return (
    <AuthGuard>
      <RoleGuard minRole={Role.CASHIER}>
        <PaymentContent />
      </RoleGuard>
    </AuthGuard>
  )
}

function PaymentContent() {
  const params   = useParams<{ id: string }>()
  const orderId  = params.id
  const router   = useRouter()
  const token    = useAuthStore(s => s.accessToken)
  const [method,  setMethod]  = useState<PaymentMethod>('cod')
  const [payment, setPayment] = useState<Payment | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ['order', orderId],
    queryFn:  () => api.get(`/orders/${orderId}`).then(r => r.data?.data ?? r.data),
    enabled:  !!orderId,
  })

  // WS — listen for payment_success once payment is pending (QR methods)
  useEffect(() => {
    if (!token || !payment || payment.status !== 'pending') return

    const paidAmount = payment.amount  // capture for closure — TS can't narrow through async boundary

    const base = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1')
      .replace(/^https/, 'wss')
      .replace(/^http/, 'ws')
    const url = `${base}/ws/orders-live?token=${encodeURIComponent(token)}`

    let stopped  = false
    let attempts = 0
    let retryId: ReturnType<typeof setTimeout>
    let ws: WebSocket

    function connect() {
      ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => { attempts = 0 }

      ws.onmessage = (evt: MessageEvent) => {
        let msg: WsMsg
        try { msg = JSON.parse(evt.data as string) } catch { return }

        if (msg.type === 'payment_success' && msg.order_id === orderId) {
          toast.success(`Thanh toán thành công: ${formatVND(paidAmount)}`)
          window.print()
          router.push('/pos')
        }
      }

      ws.onclose = () => {
        if (stopped) return
        attempts++
        retryId = setTimeout(connect, Math.min(1000 * 2 ** attempts, 30_000))
      }
    }

    connect()
    return () => {
      stopped = true
      clearTimeout(retryId)
      ws?.close()
    }
  }, [token, payment, orderId, router])

  const createPayment = useMutation({
    mutationFn: (selectedMethod: PaymentMethod) =>
      api.post('/payments', { order_id: orderId, method: selectedMethod })
        .then(r => r.data?.data ?? r.data),
    onSuccess: (data: Payment) => {
      setPayment(data)
      if (data.status === 'completed') {
        toast.success('Thanh toán COD thành công!')
        window.print()
        router.push('/pos')
      }
    },
    onError: () => toast.error('Không thể tạo thanh toán'),
  })

  const uploadProof = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData()
      form.append('image', file)
      return api.patch(`/payments/${payment?.id}/proof`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    onSuccess: () => toast.success('Đã lưu ảnh xác nhận'),
    onError:   () => toast.error('Upload thất bại'),
  })

  if (isLoading || !order) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-muted-fg">
        Đang tải...
      </div>
    )
  }

  return (
    <>
      {/* Print stylesheet — inline so no global CSS is polluted */}
      <style>{`@media print { .no-print { display: none !important } }`}</style>

      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <div className="no-print flex items-center gap-3 p-4 border-b border-border">
          <button
            onClick={() => router.back()}
            className="text-muted-fg hover:text-foreground transition-colors text-sm"
          >
            ← Quay lại
          </button>
          <h1 className="text-lg font-semibold">
            Thanh Toán Đơn #{order.order_number}
          </h1>
        </div>

        <div className="max-w-lg mx-auto p-6 space-y-5">
          {/* Receipt — visible on screen + in print */}
          <div className="bg-card rounded-2xl p-5 space-y-3 border border-border">
            <div className="text-center mb-2">
              <p className="font-display font-bold text-foreground text-lg">Bánh Cuốn</p>
              <p className="text-muted-fg text-xs">Hoá đơn thanh toán</p>
            </div>

            <div className="border-t border-border pt-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-fg">Đơn #</span>
                <span className="text-foreground">{order.order_number}</span>
              </div>
              {order.table_id && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-fg">Bàn</span>
                  <span className="text-foreground">{order.table_id}</span>
                </div>
              )}
              {order.customer_name && order.customer_name !== 'Khách tại quán' && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-fg">Khách</span>
                  <span className="text-foreground">{order.customer_name}</span>
                </div>
              )}
            </div>

            <div className="border-t border-border pt-3 space-y-1.5">
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-fg">{item.quantity}× {item.name}</span>
                  <span className="text-foreground">{formatVND(item.unit_price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-3 flex justify-between items-center">
              <span className="text-foreground font-semibold">Tổng cộng</span>
              <span className="text-primary font-bold text-xl">{formatVND(order.total_amount)}</span>
            </div>

            {payment && (
              <div className="border-t border-border pt-3 flex justify-between text-sm">
                <span className="text-muted-fg">Phương thức</span>
                <span className="text-foreground">{METHOD_LABELS[payment.method]}</span>
              </div>
            )}

            <p className="text-center text-muted-fg text-xs pt-2">Cảm ơn quý khách!</p>
          </div>

          {/* Payment controls — hidden when printing */}
          {!payment ? (
            <div className="no-print space-y-4">
              <div className="bg-card rounded-2xl p-5 border border-border">
                <p className="text-foreground font-semibold mb-3">Phương thức thanh toán</p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(METHOD_LABELS) as [PaymentMethod, string][]).map(([m, label]) => (
                    <button
                      key={m}
                      onClick={() => setMethod(m)}
                      className={`py-2.5 px-4 rounded-xl text-sm font-medium border transition-colors ${
                        method === m
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-fg hover:border-foreground hover:text-foreground'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => createPayment.mutate(method)}
                disabled={createPayment.isPending}
                className="w-full bg-primary text-white font-semibold py-3 rounded-full hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {createPayment.isPending
                  ? 'Đang xử lý...'
                  : method === 'cod'
                    ? 'Xác nhận COD'
                    : `Tạo QR ${METHOD_LABELS[method]}`}
              </button>
            </div>
          ) : payment.status === 'pending' && payment.qr_code_url ? (
            <div className="no-print space-y-4">
              <div className="bg-card rounded-2xl p-5 flex flex-col items-center gap-4 border border-border">
                <p className="text-foreground font-semibold">
                  Quét mã — {METHOD_LABELS[payment.method]}
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={payment.qr_code_url}
                  alt="QR thanh toán"
                  className="w-56 h-56 rounded-xl border border-border"
                />
                <p className="text-muted-fg text-sm">⏳ Đang chờ thanh toán...</p>
              </div>

              <div className="bg-card rounded-2xl p-5 border border-border space-y-2">
                <p className="text-muted-fg text-sm font-medium">Upload ảnh xác nhận (tuỳ chọn)</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) uploadProof.mutate(file)
                  }}
                  className="block text-sm text-muted-fg file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-muted file:text-foreground hover:file:bg-muted/80 cursor-pointer"
                />
                {uploadProof.isPending && (
                  <p className="text-muted-fg text-xs">Đang upload...</p>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  )
}
