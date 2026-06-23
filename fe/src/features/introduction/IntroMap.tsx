import { Button } from "@/components/ui/button"
import { MapPin, Navigation } from "lucide-react"

/**
 * Zone: Vị Trí — embedded Google Maps (no API key, ?output=embed) + address + directions.
 * FLAG: ADDRESS is the placeholder from customer_introduction.md — swap the real
 * street address/coordinates when confirmed (drives both the iframe and "Chỉ đường").
 */
const ADDRESS = "123 Đường Ẩm Thực, Phường Hàng Bông, Quận Hoàn Kiếm, Hà Nội"
const mapsQuery = encodeURIComponent(ADDRESS)

export function IntroMap() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-20">
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card">
          <MapPin className="h-5 w-5 text-primary" />
        </div>
        <h2 className="font-display text-3xl font-bold md:text-4xl">Vị Trí</h2>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        <iframe
          title="Bản đồ quán Bánh Cuốn Bà Hoa"
          src={`https://www.google.com/maps?q=${mapsQuery}&output=embed`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-72 w-full border-0 md:h-96"
        />
      </div>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-fg leading-relaxed">{ADDRESS}</p>
        <Button className="gap-2 shrink-0" asChild>
          <a
            href={`https://www.google.com/maps?q=${mapsQuery}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Navigation className="h-4 w-4" />
            Chỉ đường
          </a>
        </Button>
      </div>
    </section>
  )
}
