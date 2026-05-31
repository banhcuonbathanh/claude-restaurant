'use client'
import { useState, useRef } from 'react'
import type { StaffProgressDetail } from '@/types/training'
import { useUpdateManagerNotes } from '@/hooks/useTrainingQueries'
import { RoleBadge } from './RoleBadge'
import type { StaffRole } from '@/types/training'

interface TrainingProgressModalProps {
  open: boolean
  staffId: string
  staffName: string
  staffRole: StaffRole
  detail: StaffProgressDetail | undefined
  isLoading: boolean
  onClose: () => void
}

function deriveSteps(detail: StaffProgressDetail) {
  const watched = detail.watchedPercent >= 100
  const attempted = detail.quizAttempts.length > 0
  const passed = detail.quizAttempts.some(a => a.passed)

  return [
    {
      label: 'Xem video',
      done: watched,
      note: watched ? 'Đã xem' : 'Chưa xem',
      date: watched ? detail.updatedAt : null,
    },
    {
      label: 'Làm bài kiểm tra',
      done: attempted,
      note: attempted ? 'Đã thử' : 'Chưa thử',
      date: attempted ? detail.quizAttempts[detail.quizAttempts.length - 1]?.date : null,
    },
    {
      label: 'Hoàn thành',
      done: passed,
      note: passed ? 'Đạt' : 'Cần qua quiz',
      date: passed ? detail.quizAttempts.find(a => a.passed)?.date ?? null : null,
    },
  ]
}

export function TrainingProgressModal({
  open,
  staffId,
  staffName,
  staffRole,
  detail,
  isLoading,
  onClose,
}: TrainingProgressModalProps) {
  const [notes, setNotes] = useState(detail?.managerNotes ?? '')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { mutate: saveNotes } = useUpdateManagerNotes()

  const handleNotesChange = (val: string) => {
    setNotes(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (detail) saveNotes({ staffId, guideId: detail.guideId, notes: val })
    }, 800)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-y-auto max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-label="Chi tiết tiến trình đào tạo"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Chi tiết tiến trình</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-700 font-medium">{staffName}</span>
              <RoleBadge role={staffRole} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-400">Đang tải...</div>
        ) : !detail ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Nhân viên này chưa bắt đầu hướng dẫn.
          </div>
        ) : (
          <div className="px-6 py-4 flex flex-col gap-5">
            {/* Guide name */}
            <p className="text-sm text-gray-500">
              Hướng dẫn: <span className="font-medium text-gray-700">{detail.guideName}</span>
            </p>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Tiến trình hoàn thành</span>
                <span className="font-medium text-orange-600">{detail.watchedPercent}%</span>
              </div>
              <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-400 rounded-full transition-all"
                  style={{ width: `${detail.watchedPercent}%` }}
                />
              </div>
            </div>

            {/* Steps */}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                Các bước
              </p>
              <ol className="flex flex-col gap-2">
                {deriveSteps(detail).map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className={`mt-0.5 text-base ${step.done ? 'text-green-500' : 'text-gray-300'}`}>
                      {step.done ? '✓' : '○'}
                    </span>
                    <div className="flex-1">
                      <span className={`text-sm font-medium ${step.done ? 'text-gray-800' : 'text-gray-400'}`}>
                        {step.label}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">— {step.note}</span>
                      {step.date && (
                        <span className="text-xs text-gray-400 ml-1">
                          · {new Date(step.date).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Quiz attempts */}
            {detail.quizAttempts.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Lịch sử thi
                </p>
                <table className="w-full text-sm border border-gray-100 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-500">
                      <th className="px-3 py-2 text-left">Lần</th>
                      <th className="px-3 py-2 text-left">Ngày</th>
                      <th className="px-3 py-2 text-left">Điểm</th>
                      <th className="px-3 py-2 text-left">Kết quả</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {detail.quizAttempts.map(a => (
                      <tr key={a.attemptNumber}>
                        <td className="px-3 py-2 text-gray-600">Lần {a.attemptNumber}</td>
                        <td className="px-3 py-2 text-gray-600">{a.date}</td>
                        <td className="px-3 py-2 font-medium">{a.score}%</td>
                        <td className={`px-3 py-2 font-medium ${a.passed ? 'text-green-600' : 'text-red-500'}`}>
                          {a.passed ? 'Đạt' : 'Không đạt'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-xs text-gray-400 mt-2">
                  Cần ≥ {detail.passThreshold}% để qua ·{' '}
                  {detail.attemptsRemaining > 0
                    ? `${detail.attemptsRemaining} lần thử còn lại`
                    : <span className="text-red-500">Đã hết lượt thi. Liên hệ quản lý để mở lại.</span>
                  }
                </p>
              </div>
            )}

            {/* Manager notes */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Ghi chú quản lý
              </label>
              <textarea
                value={notes}
                onChange={e => handleNotesChange(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                placeholder="Thêm ghi chú huấn luyện cho nhân viên này..."
              />
            </div>
          </div>
        )}

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="min-h-[44px] px-6 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
