'use client'
import { useState } from 'react'
import type { JobGuide } from '@/types/training'
import { RoleBadge } from './RoleBadge'

interface JobGuideCardProps {
  guide: JobGuide
  onViewProgress: (guide: JobGuide) => void
  onEdit: (guide: JobGuide) => void
  onDelete: (id: string) => void
}

export function JobGuideCard({ guide, onViewProgress, onEdit, onDelete }: JobGuideCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="relative rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
      {/* Cover image */}
      <div className="relative h-36 bg-muted flex-shrink-0">
        {guide.coverImageUrl ? (
          <img
            src={guide.coverImageUrl}
            alt={guide.title}
            className="w-full h-full object-cover"
            onError={e => {
              const t = e.currentTarget
              t.style.display = 'none'
              t.nextElementSibling?.classList.remove('hidden')
            }}
          />
        ) : null}
        <div className={`absolute inset-0 flex items-center justify-center text-4xl ${guide.coverImageUrl ? 'hidden' : ''}`}>
          📚
        </div>

        {/* Draft overlay */}
        {!guide.published && (
          <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center">
            <span className="bg-gray-800 text-white text-xs font-medium px-2 py-1 rounded">
              Nháp
            </span>
          </div>
        )}

        {/* Role badge top-left */}
        <div className="absolute top-2 left-2">
          <RoleBadge role={guide.role} />
        </div>

        {/* 3-dot kebab menu */}
        <div className="absolute top-2 right-2">
          <button
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-gray-600 transition-colors"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Tuỳ chọn"
          >
            ⋮
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 rounded-lg border border-border bg-card shadow-lg z-10">
              <button
                className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                onClick={() => { onEdit(guide); setMenuOpen(false) }}
              >
                Chỉnh sửa
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                onClick={() => { onDelete(guide.id); setMenuOpen(false) }}
              >
                Xoá
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2">
          {guide.title}
        </h3>

        {guide.description && (
          <p className="text-xs text-muted-fg line-clamp-2">{guide.description}</p>
        )}

        {/* YouTube link */}
        {guide.youtubeUrl && (
          <a
            href={guide.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-red-600 hover:underline"
          >
            ▶ Xem video hướng dẫn
          </a>
        )}

        {/* Responsible roles */}
        {guide.responsibleRoles.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {guide.responsibleRoles.map(r => (
              <RoleBadge key={r} role={r} />
            ))}
          </div>
        )}

        {/* KPI chips */}
        <div className="flex flex-col gap-1 text-xs text-muted-fg">
          {guide.qualityKpiTarget && (
            <span className="truncate">📊 {guide.qualityKpiTarget}</span>
          )}
          {guide.quantityKpiTarget && (
            <span className="truncate">🎯 {guide.quantityKpiTarget}</span>
          )}
        </div>

        {/* CTA */}
        <button
          className="mt-auto min-h-[44px] w-full rounded-lg bg-orange-50 text-orange-600 text-sm font-medium hover:bg-orange-100 transition-colors"
          onClick={() => onViewProgress(guide)}
        >
          Xem tiến trình →
        </button>
      </div>
    </div>
  )
}
