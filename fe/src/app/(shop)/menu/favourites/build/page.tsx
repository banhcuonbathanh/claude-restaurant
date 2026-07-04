'use client'
import { useRouter } from 'next/navigation'
import { FavouritesTopNav } from '../components/FavouritesTopNav'
import { FavouriteSegmentTabs } from '../components/FavouriteSegmentTabs'

// Placeholder until FAV-2-FE-1 builds the "Tự tạo suất" (custom-combo) builder.
// Exists now so the segmented tab's "Tự tạo suất" link has a valid destination
// (no 404) after FAV-1 removed the old footer nav.
export default function BuildSuatPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <FavouritesTopNav title="Tự tạo suất" showCart onBack={() => router.back()} />
      <FavouriteSegmentTabs />
      <div className="flex flex-col items-center justify-center gap-2 px-6 py-20 text-center">
        <span className="text-4xl">🍽️</span>
        <p className="text-sm font-semibold text-foreground">Tự tạo suất</p>
        <p className="text-xs text-muted-fg">Tính năng đang được xây dựng.</p>
      </div>
    </div>
  )
}
