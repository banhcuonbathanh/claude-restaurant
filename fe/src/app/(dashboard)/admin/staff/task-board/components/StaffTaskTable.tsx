'use client'
import React from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ExpandedTaskList } from './ExpandedTaskList'
import type { StaffTaskStat, Task } from '@/types/task'

const ROLE_LABELS: Record<string, string> = {
  kitchen: 'Bếp',
  cashier: 'Thu ngân',
  server:  'Phục vụ',
  chef:    'Đầu bếp',
  staff:   'Nhân viên',
  manager: 'Quản lý',
  admin:   'Admin',
}

const ROLE_COLORS: Record<string, string> = {
  kitchen: 'bg-orange-100 text-orange-700',
  cashier: 'bg-blue-100 text-blue-700',
  server:  'bg-purple-100 text-purple-700',
  chef:    'bg-red-100 text-red-700',
  staff:   'bg-gray-100 text-gray-700',
  manager: 'bg-green-100 text-green-700',
  admin:   'bg-yellow-100 text-yellow-700',
}

function QualityStars({ score }: { score: number }) {
  const display = score != null ? score.toFixed(1) : null
  if (display === null) {
    return <span className="text-gray-400 text-sm">★ —</span>
  }
  return (
    <span className="text-sm font-medium text-amber-600">
      ★ {display} / 5.0
    </span>
  )
}

interface Props {
  rows: StaffTaskStat[]
  expandedId: string | null
  expandedTasks: Task[]
  isExpandedLoading: boolean
  isExpandedError: boolean
  onToggleExpand: (staffId: string) => void
  onAssign: (staffId: string) => void
}

export function StaffTaskTable({
  rows,
  expandedId,
  expandedTasks,
  isExpandedLoading,
  isExpandedError,
  onToggleExpand,
  onAssign,
}: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wide">
            <th className="px-4 py-3 text-left">Nhân viên</th>
            <th className="px-4 py-3 text-left">Vai trò</th>
            <th className="px-4 py-3 text-center">Được giao</th>
            <th className="px-4 py-3 text-center">Hoàn thành</th>
            <th className="px-4 py-3 text-center">Tỷ lệ %</th>
            <th className="px-4 py-3 text-center">Chất lượng</th>
            <th className="px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map(row => {
            const isExpanded = expandedId === row.staffId
            return (
              <React.Fragment key={row.staffId}>
                <tr
                  className={cn(
                    'transition-colors',
                    row.hasOverdue ? 'bg-orange-50 hover:bg-orange-100' : 'hover:bg-gray-50',
                  )}
                >
                  <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2">
                    <button
                      aria-expanded={isExpanded}
                      onClick={() => onToggleExpand(row.staffId)}
                      className="text-gray-400 hover:text-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      {isExpanded
                        ? <ChevronDown className="h-4 w-4" />
                        : <ChevronRight className="h-4 w-4" />}
                    </button>
                    {row.staffName}
                    {row.hasOverdue && (
                      <span className="ml-1 text-xs font-bold text-orange-600">!</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                      ROLE_COLORS[row.role] ?? 'bg-gray-100 text-gray-700',
                    )}>
                      {ROLE_LABELS[row.role] ?? row.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">{row.assignedCount}</td>
                  <td className="px-4 py-3 text-center text-green-700 font-medium">{row.completedCount}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      'font-medium',
                      row.completionRate >= 80 ? 'text-green-700' :
                      row.completionRate >= 50 ? 'text-amber-600' : 'text-red-600',
                    )}>
                      {row.completionRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <QualityStars score={row.qualityScore} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleExpand(row.staffId)}
                        className="min-h-[36px] text-xs"
                      >
                        {isExpanded ? 'Ẩn' : 'Xem công việc'}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onAssign(row.staffId)}
                        className="min-h-[36px] text-xs bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        Giao việc
                      </Button>
                    </div>
                  </td>
                </tr>
                {isExpanded && (
                  <tr key={`${row.staffId}-expanded`} className="bg-gray-50">
                    <td colSpan={7} className="px-0 py-0">
                      <ExpandedTaskList
                        tasks={expandedTasks}
                        isLoading={isExpandedLoading}
                        isError={isExpandedError}
                      />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
