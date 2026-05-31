'use client'
import type { JobGuide } from '@/types/training'
import { JobGuideCard } from './JobGuideCard'

interface JobGuideCardGridProps {
  guides: JobGuide[]
  isLoading: boolean
  onViewProgress: (guide: JobGuide) => void
  onEdit: (guide: JobGuide) => void
  onDelete: (id: string) => void
  onNewGuide: () => void
}

export function JobGuideCardGrid({
  guides,
  isLoading,
  onViewProgress,
  onEdit,
  onDelete,
  onNewGuide,
}: JobGuideCardGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white h-72 animate-pulse" />
        ))}
      </div>
    )
  }

  if (guides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="text-5xl mb-4">📚</span>
        <p className="text-gray-500 text-sm mb-4">
          Chưa có hướng dẫn nào. Nhấn &quot;+ New Guide&quot; để bắt đầu.
        </p>
        <button
          className="min-h-[44px] px-4 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors"
          onClick={onNewGuide}
        >
          + New Guide
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {guides.map(guide => (
        <JobGuideCard
          key={guide.id}
          guide={guide}
          onViewProgress={onViewProgress}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
