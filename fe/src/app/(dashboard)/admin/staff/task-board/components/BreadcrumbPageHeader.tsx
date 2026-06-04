'use client'
import { ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  breadcrumbs: string[]
  onAddTask: () => void
}

export function BreadcrumbPageHeader({ breadcrumbs, onAddTask }: Props) {
  return (
    <div className="flex items-center justify-between">
      <nav className="flex items-center gap-1 text-sm text-muted-fg">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
            <span className={i === breadcrumbs.length - 1 ? 'font-medium text-foreground' : ''}>
              {crumb}
            </span>
          </span>
        ))}
      </nav>
      <Button
        onClick={onAddTask}
        className="min-h-[44px] bg-orange-500 hover:bg-orange-600 text-white gap-2"
      >
        <Plus className="h-4 w-4" />
        Thêm công việc
      </Button>
    </div>
  )
}
