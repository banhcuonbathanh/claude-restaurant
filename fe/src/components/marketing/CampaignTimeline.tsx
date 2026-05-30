import { cn } from '@/lib/utils'
import type { CampaignMilestone } from '@/types/marketing'

interface CampaignTimelineProps {
  milestones: CampaignMilestone[]
}

export function CampaignTimeline({ milestones }: CampaignTimelineProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-8 text-sm font-semibold text-gray-700">
        Lộ trình chiến dịch — 5 tuần khai trương
      </h3>

      <div className="relative">
        {/* Connector line */}
        <div className="absolute left-0 right-0 top-[10px] h-0.5 bg-gray-200" />

        <div className="relative flex justify-between">
          {milestones.map(m => (
            <div key={m.id} className="flex flex-1 flex-col items-center gap-2">
              {/* Node dot */}
              <div
                className={cn(
                  'relative z-10 rounded-full border-2 border-white shadow-sm ring-2',
                  m.isKeyEvent
                    ? 'h-6 w-6 bg-orange-500 ring-orange-200'
                    : 'h-4 w-4 bg-slate-400 ring-slate-100'
                )}
              />
              {/* Label */}
              <p
                className={cn(
                  'text-center text-xs font-semibold',
                  m.isKeyEvent ? 'text-orange-600' : 'text-gray-600'
                )}
              >
                {m.label}
              </p>
              {/* Activities */}
              <div className="flex flex-col items-center gap-0.5">
                {m.activities.map(a => (
                  <p key={a} className="text-center text-[10px] leading-tight text-gray-400">
                    {a}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
