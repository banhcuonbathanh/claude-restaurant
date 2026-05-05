'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { formatVND } from '@/lib/utils'
import { useSummaryStore } from '@/features/admin/summary.store'
import {
  getSummary, getTopDishes, getStaffPerformance, getLowStock, postStockMovement,
} from '@/features/admin/admin.api'
import type { SummaryRange, Ingredient } from '@/features/admin/admin.api'

// ── Range selector ────────────────────────────────────────────────────────────

const RANGE_LABELS: Record<SummaryRange, string> = {
  today: 'Hôm nay',
  week:  'Tuần này',
  month: 'Tháng này',
}

function RangeSelector() {
  const { range, setRange } = useSummaryStore()
  return (
    <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
      {(Object.keys(RANGE_LABELS) as SummaryRange[]).map(r => (
        <button
          key={r}
          onClick={() => setRange(r)}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            range === r
              ? 'bg-orange-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {RANGE_LABELS[r]}
        </button>
      ))}
    </div>
  )
}

// ── KPI cards ────────────────────────────────────────────────────────────────

function KPICard({
  label, value, sub, color,
}: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className={`rounded-xl border-2 ${color} bg-white p-5`}>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-400">{sub}</p>
    </div>
  )
}

function SummaryKPICards() {
  const range = useSummaryStore(s => s.range)
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'summary', range],
    queryFn:  () => getSummary(range),
    staleTime: 60_000,
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <KPICard
        label="Khách hôm nay"
        value={String(data?.customers ?? 0)}
        sub="lượt đặt bàn (không hủy)"
        color="border-blue-300"
      />
      <KPICard
        label="Món đã bán"
        value={String(data?.dishes_sold ?? 0)}
        sub="phần đã giao (delivered)"
        color="border-green-300"
      />
      <KPICard
        label="Doanh thu"
        value={formatVND(data?.revenue ?? 0)}
        sub="thanh toán completed"
        color="border-purple-300"
      />
      <KPICard
        label="Bàn đang phục vụ"
        value={String(data?.active_tables ?? 0)}
        sub="confirmed / preparing / ready"
        color="border-orange-300"
      />
    </div>
  )
}

// ── Top dishes ────────────────────────────────────────────────────────────────

function TopDishesList() {
  const range = useSummaryStore(s => s.range)
  const { data = [], isLoading } = useQuery({
    queryKey: ['admin', 'top-dishes', range],
    queryFn:  () => getTopDishes(range, 5),
    staleTime: 60_000,
  })

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="mb-4 text-base font-semibold text-gray-800">Món bán chạy</h2>
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-8 animate-pulse rounded bg-gray-100" />)}
        </div>
      ) : data.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">Chưa có dữ liệu trong kỳ này</p>
      ) : (
        <ol className="space-y-3">
          {data.map((row, i) => (
            <li key={row.name} className="flex items-center gap-3">
              <span className="w-5 text-right text-sm font-bold text-gray-400">#{i + 1}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-800">{row.name}</span>
                  <span className="text-gray-500">×{row.qty} · {row.pct.toFixed(1)}%</span>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-orange-400"
                    style={{ width: `${Math.min(row.pct, 100)}%` }}
                  />
                </div>
              </div>
              <span className="w-28 text-right text-xs text-gray-500">{formatVND(row.revenue)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

// ── Staff performance ─────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  chef:     'Bếp',
  cashier:  'Thu ngân',
  staff:    'Nhân viên',
  manager:  'Quản lý',
  admin:    'Admin',
}

function StaffPerfTable() {
  const range = useSummaryStore(s => s.range)
  const { data = [], isLoading } = useQuery({
    queryKey: ['admin', 'staff-performance', range],
    queryFn:  () => getStaffPerformance(range),
    staleTime: 60_000,
  })

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="mb-4 text-base font-semibold text-gray-800">Hiệu suất nhân viên</h2>
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-8 animate-pulse rounded bg-gray-100" />)}
        </div>
      ) : data.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">Chưa có dữ liệu</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-gray-500">
              <th className="pb-2 font-medium">Tên nhân viên</th>
              <th className="pb-2 font-medium">Vai trò</th>
              <th className="pb-2 text-right font-medium">Đơn xử lý</th>
              <th className="pb-2 text-right font-medium">Doanh thu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map(row => (
              <tr key={row.staff_id} className="py-2">
                <td className="py-2 font-medium text-gray-800">{row.full_name}</td>
                <td className="py-2 text-gray-500">{ROLE_LABELS[row.role] ?? row.role}</td>
                <td className="py-2 text-right text-gray-800">{row.orders_handled}</td>
                <td className="py-2 text-right text-gray-500">
                  {row.role === 'chef' ? '—' : formatVND(row.revenue ?? 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

// ── Stock alerts ──────────────────────────────────────────────────────────────

const stockSchema = z.object({
  quantity: z.coerce.number().positive('Phải lớn hơn 0'),
  note:     z.string().max(200).optional(),
})
type StockForm = z.infer<typeof stockSchema>

function StockInModal({ ingredient, onClose }: { ingredient: Ingredient; onClose: () => void }) {
  const qc = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm<StockForm>({
    resolver: zodResolver(stockSchema),
  })

  const mut = useMutation({
    mutationFn: (vals: StockForm) => postStockMovement({
      ingredient_id: ingredient.id,
      type: 'in',
      quantity: vals.quantity,
      note: vals.note,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'low-stock'] })
      qc.invalidateQueries({ queryKey: ['admin', 'ingredients'] })
      toast.success(`Đã nhập hàng: ${ingredient.name}`)
      onClose()
    },
    onError: () => toast.error('Có lỗi xảy ra khi nhập hàng'),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="font-semibold text-gray-900">Nhập hàng — {ingredient.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <form onSubmit={handleSubmit(v => mut.mutate(v))} className="space-y-4 p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nguyên liệu</label>
            <input
              value={ingredient.name}
              readOnly
              className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Số lượng nhập ({ingredient.unit})
            </label>
            <input
              type="number"
              step="0.001"
              {...register('quantity')}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="0"
            />
            {errors.quantity && <p className="mt-1 text-xs text-red-500">{errors.quantity.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
            <input
              {...register('note')}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Tùy chọn"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={mut.isPending}
              className="rounded-lg bg-orange-500 px-5 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {mut.isPending ? 'Đang lưu...' : '✓ Xác nhận nhập'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function StockAlertList() {
  const [modalIng, setModalIng] = useState<Ingredient | null>(null)
  const { data = [], isLoading } = useQuery({
    queryKey: ['admin', 'low-stock'],
    queryFn:  getLowStock,
    staleTime: 120_000,
  })

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">Cảnh báo tồn kho</h2>
        <a href="/admin/ingredients" className="text-xs text-blue-500 hover:underline">
          Xem toàn bộ kho →
        </a>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />)}
        </div>
      ) : data.length === 0 ? (
        <p className="py-6 text-center text-sm text-green-600">✅ Tất cả nguyên liệu đủ hàng</p>
      ) : (
        <ul className="space-y-2">
          {data.map(ing => {
            const isCritical = ing.current_stock < ing.min_stock
            const pct = ing.min_stock > 0 ? Math.min((ing.current_stock / ing.min_stock) * 100, 100) : 100
            return (
              <li
                key={ing.id}
                className={`flex items-center gap-4 rounded-lg px-4 py-3 ${
                  isCritical ? 'bg-red-50' : 'bg-yellow-50'
                }`}
              >
                <span className="text-lg">{isCritical ? '🔴' : '🟡'}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-800">{ing.name}</span>
                    <span className={`text-xs font-medium ${isCritical ? 'text-red-600' : 'text-yellow-700'}`}>
                      còn {ing.current_stock} {ing.unit} / min {ing.min_stock} {ing.unit}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-gray-200">
                    <div
                      className={`h-1.5 rounded-full ${isCritical ? 'bg-red-400' : 'bg-yellow-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => setModalIng(ing)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                    isCritical
                      ? 'border border-red-300 text-red-600 hover:bg-red-100'
                      : 'border border-yellow-300 text-yellow-700 hover:bg-yellow-100'
                  }`}
                >
                  + Nhập hàng
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {modalIng && <StockInModal ingredient={modalIng} onClose={() => setModalIng(null)} />}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SummaryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Tổng kết nhà hàng</h1>
        <RangeSelector />
      </div>

      <SummaryKPICards />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TopDishesList />
        <StaffPerfTable />
      </div>

      <StockAlertList />
    </div>
  )
}
