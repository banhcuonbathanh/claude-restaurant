import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, QrCode } from "lucide-react"
import { IntroHero } from "@/features/introduction/IntroHero"
import { IntroStory } from "@/features/introduction/IntroStory"
import { IntroGallery } from "@/features/introduction/IntroGallery"
import { IntroMap } from "@/features/introduction/IntroMap"
import { IntroContact } from "@/features/introduction/IntroContact"

/**
 * /introduction — dedicated about-the-restaurant page (story · gallery · map · hours · contact).
 * Static Server Component, public (no auth, no BE). Modelled on /welcome.
 * Top-level route (NOT under (shop)) so the shared ClientBottomNav does not render.
 * Wireframe: docs/system/08_pages/customer/customer_introduction/customer_introduction.md
 */
export default function IntroductionPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Top nav ── */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link
            href="/welcome"
            className="flex items-center gap-2 text-sm font-medium text-muted-fg transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Giới Thiệu
          </Link>
          <Button size="sm" className="gap-2" asChild>
            <Link href="/menu">
              <QrCode className="h-4 w-4" />
              Xem Thực Đơn
            </Link>
          </Button>
        </div>
      </nav>

      <IntroHero />
      <IntroStory />
      <IntroGallery />
      <IntroMap />
      <IntroContact />

      {/* ── CTA ── */}
      <section className="gradient-hero border-t border-border py-20">
        <div className="mx-auto max-w-xl px-4 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Sẵn Sàng Thưởng Thức?
          </h2>
          <p className="mt-4 text-lg text-muted-fg">
            Xem thực đơn và đặt món trực tiếp — không cần tải app.
          </p>
          <Button size="xl" className="mt-8 gap-2 glow-primary" asChild>
            <Link href="/menu">
              <QrCode className="h-5 w-5" />
              Xem Thực Đơn & Đặt Món
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
