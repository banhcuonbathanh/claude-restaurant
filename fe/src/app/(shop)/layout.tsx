import { ClientBottomNav } from '@/components/shared/ClientBottomNav'
import { ChatWidget } from '@/features/chat/ChatWidget'

/**
 * Shared customer-facing shell. Renders the global bottom tab bar once for
 * every (shop) page (menu · order · checkout · profile · tracking) and pads the
 * content so nothing hides behind the fixed nav.
 */
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="pb-[calc(72px+env(safe-area-inset-bottom))]">{children}</div>
      <ChatWidget />
      <ClientBottomNav />
    </>
  )
}
