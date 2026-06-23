import { Badge } from "@/components/ui/badge"
import { ImageIcon } from "lucide-react"

/**
 * Zone: Hình Ảnh — photo gallery.
 * 6 placeholder tiles (flagged: swap real photos when assets land).
 * Lightbox is phase-2 per customer_introduction.md — not built here.
 */
const PLACEHOLDER_COUNT = 6

export function IntroGallery() {
  return (
    <section className="border-y border-border bg-card/20 py-20">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-12 text-center">
          <Badge variant="outline" className="mb-3">
            Hình Ảnh
          </Badge>
          <h2 className="font-display text-3xl font-bold md:text-4xl">Không Gian Quán</h2>
          <p className="mt-3 text-muted-fg">
            Một vài khoảnh khắc tại quán — ảnh thật sẽ được cập nhật.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: PLACEHOLDER_COUNT }).map((_, i) => (
            <div
              key={i}
              className="flex aspect-[4/3] items-center justify-center rounded-xl border border-border bg-muted/30"
            >
              <ImageIcon className="h-8 w-8 text-muted-fg/30" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
