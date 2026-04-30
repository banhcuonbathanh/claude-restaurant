'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api-client'
import { useCartStore } from '@/store/cart'
import { formatVND } from '@/lib/utils'

const schema = z.object({
  customer_name:   z.string().min(2, 'Vui lòng nhập tên').max(100),
  customer_phone:  z.string().regex(/^(0|\+84)[0-9]{9}$/, 'Số điện thoại không hợp lệ'),
  note:            z.string().max(500).optional(),
  payment_method:  z.enum(['vnpay', 'momo', 'zalopay', 'cash']),
})

type CheckoutForm = z.infer<typeof schema>

const PAYMENT_OPTIONS = [
  { value: 'vnpay',   label: '💳 VNPay' },
  { value: 'momo',    label: '📱 MoMo' },
  { value: 'zalopay', label: '🏦 ZaloPay' },
  { value: 'cash',    label: '💵 Tiền mặt COD' },
] as const

export default function CheckoutPage() {
  const router = useRouter()
  const cart   = useCartStore()

  useEffect(() => {
    if (cart.itemCount() === 0) router.replace('/menu')
  }, [cart, router])

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>({
    resolver:      zodResolver(schema),
    defaultValues: { payment_method: 'cash' },
  })

  const submitOrder = useMutation({
    mutationFn: async (form: CheckoutForm) => {
      // Store payment method before API call (spec AC-09)
      cart.setPaymentMethod(form.payment_method)

      const payload = {
        customer_name:  form.customer_name,
        customer_phone: form.customer_phone,
        note:           form.note ?? null,
        table_id:       cart.tableId ?? null,
        source:         cart.tableId ? 'qr' : 'online',
        // payment_method intentionally omitted from POST /orders (spec AC-08)
        items: cart.items.map(item => ({
          product_id:       item.product_id ?? null,
          combo_id:         item.combo_id ?? null,
          quantity:         item.quantity,
          unit_price:       item.price,
          topping_snapshot: item.toppings.length > 0 ? item.toppings : null,
        })),
      }

      const { data } = await api.post('/orders', payload)
      return data
    },
    onSuccess: (data) => {
      cart.clearCart()
      router.push(`/order/${data.id}`)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })
        .response?.data?.message
      toast.error(msg ?? 'Đặt hàng thất bại')
    },
  })

  const total = cart.total()

  if (cart.itemCount() === 0) return null

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-muted-fg hover:text-foreground transition-colors"
        >
          ← Quay lại
        </button>
        <h1 className="font-semibold text-foreground">Xác Nhận Đơn Hàng</h1>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">
        {/* Order summary */}
        <section className="bg-card rounded-xl p-4 space-y-3">
          <h2 className="text-xs font-semibold text-muted-fg uppercase tracking-wide">
            Đơn hàng của bạn
          </h2>
          {cart.items.map(item => (
            <div key={item.id} className="flex justify-between text-sm gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {item.quantity}x {item.name}
                </p>
                {item.toppings.length > 0 && (
                  <p className="text-muted-fg text-xs mt-0.5">
                    + {item.toppings.map(t => t.name).join(', ')}
                  </p>
                )}
              </div>
              <p className="text-primary font-medium whitespace-nowrap">
                {formatVND(item.price * item.quantity)}
              </p>
            </div>
          ))}
          <div className="border-t border-border pt-3 flex justify-between font-bold">
            <span>Tổng cộng</span>
            <span className="text-primary text-lg">{formatVND(total)}</span>
          </div>
        </section>

        <form
          id="checkout-form"
          onSubmit={handleSubmit(d => submitOrder.mutate(d))}
          className="space-y-6"
        >
          {/* Contact info */}
          <section className="bg-card rounded-xl p-4 space-y-4">
            <h2 className="text-xs font-semibold text-muted-fg uppercase tracking-wide">
              Thông tin liên hệ
            </h2>

            <div>
              <input
                {...register('customer_name')}
                placeholder="Họ tên *"
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-fg focus:outline-none focus:border-primary transition-colors"
              />
              {errors.customer_name && (
                <p className="text-xs text-urgent mt-1">{errors.customer_name.message}</p>
              )}
            </div>

            <div>
              <input
                {...register('customer_phone')}
                placeholder="Số điện thoại *"
                type="tel"
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-fg focus:outline-none focus:border-primary transition-colors"
              />
              {errors.customer_phone && (
                <p className="text-xs text-urgent mt-1">{errors.customer_phone.message}</p>
              )}
            </div>

            <div>
              <textarea
                {...register('note')}
                placeholder="Ghi chú (tuỳ chọn)"
                rows={2}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-fg focus:outline-none focus:border-primary resize-none transition-colors"
              />
            </div>
          </section>

          {/* Payment method */}
          <section className="bg-card rounded-xl p-4 space-y-3">
            <h2 className="text-xs font-semibold text-muted-fg uppercase tracking-wide">
              Phương thức thanh toán
            </h2>
            {PAYMENT_OPTIONS.map(opt => (
              <label key={opt.value} className="flex items-center gap-3 cursor-pointer py-1">
                <input
                  type="radio"
                  value={opt.value}
                  {...register('payment_method')}
                  className="accent-primary w-4 h-4"
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
            {errors.payment_method && (
              <p className="text-xs text-urgent">{errors.payment_method.message}</p>
            )}
          </section>
        </form>
      </div>

      {/* Fixed submit */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
        <button
          form="checkout-form"
          type="submit"
          disabled={submitOrder.isPending}
          className="w-full bg-primary text-white font-semibold py-3.5 rounded-xl disabled:opacity-60 transition-opacity"
        >
          {submitOrder.isPending
            ? 'Đang đặt hàng...'
            : `Đặt hàng · ${formatVND(total)}`}
        </button>
      </div>
    </div>
  )
}
