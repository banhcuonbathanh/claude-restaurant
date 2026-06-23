import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"

/**
 * Zone: Hero — full-width restaurant photo + headline.
 * Placeholder image block (flagged: swap real hero photo when assets land).
 */
export function IntroHero() {
  return (
    <section className="gradient-hero relative overflow-hidden">
      {/* Placeholder hero photo */}
      <div className="flex h-72 items-center justify-center border-b border-border bg-muted/30 md:h-96">
        <div className="text-center text-muted-fg">
          <Star className="mx-auto mb-3 h-14 w-14 opacity-25" />
          <p className="text-sm">Ảnh quán toàn cảnh sẽ được thêm vào đây</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-14 text-center">
        <Badge variant="secondary" className="mb-5 gap-1.5">
          <Star className="h-3 w-3" />
          Quán Bánh Cuốn Truyền Thống
        </Badge>
        <h1 className="font-display text-4xl font-bold leading-tight md:text-6xl">
          Bánh Cuốn Bà Hoa
          <br />
          <span className="text-primary">Từ 1995</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-fg">
          Gần 30 năm gìn giữ hương vị bánh cuốn tráng tay đúng vị Hà Nội.
        </p>
      </div>
    </section>
  )
}
