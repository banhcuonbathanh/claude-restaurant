'use client'
import { useState, useEffect } from 'react'
import type { TodoTaskFilter, StaffOption } from '@/types/task'

interface Props {
  filters: TodoTaskFilter
  staffList: StaffOption[]
  onChange: (f: TodoTaskFilter) => void
}

export function TodoFilterBar({ filters, staffList, onChange }: Props) {
  const [local, setLocal] = useState<TodoTaskFilter>(filters)
  const [dateError, setDateError] = useState('')

  // Sync local state when parent changes assigned_to (e.g. stats row click)
  useEffect(() => {
    setLocal(f => ({ ...f, assigned_to: filters.assigned_to }))
  }, [filters.assigned_to])

  function handleApply() {
    if (local.start_date && local.end_date) {
      const start = new Date(local.start_date)
      const end = new Date(local.end_date)
      const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      if (diffDays > 90) {
        setDateError('Khoảng thời gian tối đa 90 ngày')
        return
      }
    }
    setDateError('')
    onChange({ ...local, page: 1 })
  }

  function handleReset() {
    const reset: TodoTaskFilter = { status: 'all', page: 1 }
    setLocal(reset)
    setDateError('')
    onChange(reset)
  }

  return (
    <div className="bg-card border border-border rounded-lg p-3 mb-4 space-y-2">
      <div className="flex flex-wrap gap-2 items-end">
        {/* Staff dropdown */}
        <div className="flex flex-col gap-1 min-w-[160px]">
          <label className="text-xs text-muted-fg">Nhân viên</label>
          <select
            value={local.assigned_to ?? ''}
            onChange={e => setLocal(p => ({ ...p, assigned_to: e.target.value || undefined }))}
            className="min-h-[44px] border border-border bg-card text-foreground rounded px-2 text-sm"
          >
            <option value="">Tất cả</option>
            {staffList.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Date range */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-fg">Từ ngày</label>
          <input
            type="date"
            value={local.start_date ?? ''}
            onChange={e => setLocal(p => ({ ...p, start_date: e.target.value || undefined }))}
            className="min-h-[44px] border border-border bg-card text-foreground rounded px-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-fg">Đến ngày</label>
          <input
            type="date"
            value={local.end_date ?? ''}
            onChange={e => setLocal(p => ({ ...p, end_date: e.target.value || undefined }))}
            className="min-h-[44px] border border-border bg-card text-foreground rounded px-2 text-sm"
          />
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-xs text-muted-fg">Trạng thái</label>
          <select
            value={local.status ?? 'all'}
            onChange={e => setLocal(p => ({ ...p, status: e.target.value as TodoTaskFilter['status'] }))}
            className="min-h-[44px] border border-border bg-card text-foreground rounded px-2 text-sm"
          >
            <option value="all">Tất cả</option>
            <option value="pending">Chờ</option>
            <option value="completed">Hoàn thành</option>
            <option value="overdue">Quá hạn</option>
          </select>
        </div>

        <button
          onClick={handleApply}
          className="min-h-[44px] px-4 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition-colors"
        >
          Lọc
        </button>
        <button
          onClick={handleReset}
          className="min-h-[44px] px-3 border border-border text-foreground text-sm rounded hover:bg-muted transition-colors"
        >
          Xóa lọc
        </button>
      </div>
      {dateError && <p className="text-xs text-red-600">{dateError}</p>}
    </div>
  )
}
