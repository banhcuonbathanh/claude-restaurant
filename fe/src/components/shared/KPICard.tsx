import { cn } from '@/lib/utils'

interface KPICardProps {
  label: string
  value: string
  badge?: string
  badgeVariant?: 'success' | 'warning' | 'danger' | 'secondary'
  subLabel?: string
}

const badgeClasses: Record<NonNullable<KPICardProps['badgeVariant']>, string> = {
  success:   'bg-green-100 text-green-700',
  warning:   'bg-amber-100 text-amber-700',
  danger:    'bg-red-100 text-red-700',
  secondary: 'bg-purple-100 text-purple-700',
}

export function KPICard({ label, value, badge, badgeVariant = 'secondary', subLabel }: KPICardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs text-muted-fg">{label}</p>
      <p className="mt-1 text-xl font-bold text-foreground leading-tight">{value}</p>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        {badge && (
          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', badgeClasses[badgeVariant])}>
            {badge}
          </span>
        )}
        {subLabel && <span className="text-xs text-muted-fg">{subLabel}</span>}
      </div>
    </div>
  )
}
