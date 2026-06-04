'use client'
import { useState } from 'react'
import type { JobGuide, StaffProgressRow } from '@/types/training'
import { useGuideProgress } from '@/hooks/useTrainingQueries'

function statusIcon(row: StaffProgressRow): string {
  if (row.quizPassed) return '✅'
  if (row.watchedPercent > 0 || row.quizPassed === false) return '🟡'
  return '⬜'
}

function statusLabel(row: StaffProgressRow): string {
  if (row.quizPassed) return 'Hoàn thành'
  if (row.quizPassed === false) return 'Chưa qua quiz'
  if (row.watchedPercent > 0) return 'Đang học'
  return 'Chưa bắt đầu'
}

interface CompletionTrackingTableProps {
  guides: JobGuide[]
  onViewStaffProgress: (staffId: string, guideId: string) => void
}

export function CompletionTrackingTable({ guides, onViewStaffProgress }: CompletionTrackingTableProps) {
  const [selectedGuideId, setSelectedGuideId] = useState(guides[0]?.id ?? '')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const { data, isLoading, isError } = useGuideProgress(selectedGuideId, page, pageSize)

  const rows: StaffProgressRow[] = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const selectedGuide = guides.find(g => g.id === selectedGuideId)

  if (guides.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-fg">
        Chưa có hướng dẫn nào để theo dõi tiến trình.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header + guide selector */}
      <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border">
        <h2 className="font-semibold text-foreground text-sm">
          Completion Tracking
          {selectedGuide && (
            <span className="font-normal text-muted-fg ml-2">— {selectedGuide.title}</span>
          )}
        </h2>
        <select
          value={selectedGuideId}
          onChange={e => { setSelectedGuideId(e.target.value); setPage(1) }}
          className="min-h-[44px] rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          {guides.map(g => (
            <option key={g.id} value={g.id}>{g.title}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="p-8 text-center text-sm text-muted-fg">Đang tải...</div>
      ) : isError ? (
        <div className="p-8 text-center text-sm text-red-500">
          Kết nối mạng yếu. Nhấn thử lại.
        </div>
      ) : rows.length === 0 ? (
        <div className="p-8 text-center text-sm text-muted-fg">
          Chưa có nhân viên nào được giao hướng dẫn này.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted text-xs text-muted-fg">
                <th className="px-4 py-3 text-left font-medium">Nhân viên</th>
                <th className="px-4 py-3 text-left font-medium">Vai trò</th>
                <th className="px-4 py-3 text-left font-medium">Đã xem</th>
                <th className="px-4 py-3 text-left font-medium">Quiz</th>
                <th className="px-4 py-3 text-left font-medium">Cập nhật</th>
                <th className="px-4 py-3 text-left font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map(row => (
                <tr
                  key={row.id}
                  className="hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => onViewStaffProgress(row.staffId, row.guideId)}
                >
                  <td className="px-4 py-3 font-medium text-foreground">{row.staffName}</td>
                  <td className="px-4 py-3 text-muted-fg capitalize">{row.staffRole}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-400 rounded-full"
                          style={{ width: `${row.watchedPercent}%` }}
                        />
                      </div>
                      <span className="text-muted-fg">{row.watchedPercent}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {row.quizPassed === null
                      ? <span className="text-muted-fg">— N/A</span>
                      : row.quizPassed
                      ? <span className="text-green-600">✓ Passed</span>
                      : <span className="text-red-500">✗ Failed</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-muted-fg">
                    {row.lastActivity
                      ? new Date(row.lastActivity).toLocaleDateString('vi-VN')
                      : '—'
                    }
                  </td>
                  <td className="px-4 py-3">
                    <span title={statusLabel(row)}>{statusIcon(row)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer: count + pagination */}
      {!isLoading && !isError && rows.length > 0 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-border text-xs text-muted-fg">
          <span>
            Hiển thị {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} trong {total} nhân viên
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded hover:bg-muted disabled:opacity-40"
            >
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded text-xs ${
                  p === page ? 'bg-orange-500 text-white' : 'hover:bg-muted'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded hover:bg-muted disabled:opacity-40"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
