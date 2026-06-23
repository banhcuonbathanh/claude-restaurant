import { Card } from "@/components/ui/card"
import { Clock, Phone, MessageCircle } from "lucide-react"

/**
 * Zone: Giờ Mở Cửa + Liên Hệ — static hours table + contact channels.
 * FLAG: PHONE / Zalo / Facebook are placeholders — swap real contact details.
 */
const hours = [
  { day: "Thứ 2 – Thứ 6", time: "06:30 – 21:00" },
  { day: "Thứ 7 – Chủ Nhật", time: "06:00 – 21:30" },
]

const contacts = [
  { label: "Điện thoại", value: "0901 234 567" },
  { label: "Zalo / Facebook", value: "fb.com/banhcuonbahoa" },
]

export function IntroContact() {
  return (
    <section className="border-t border-border bg-card/20 py-20">
      <div className="mx-auto max-w-5xl px-4">
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Hours */}
          <Card className="border-border/60 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Giờ Mở Cửa</h3>
            </div>
            <ul className="space-y-3">
              {hours.map((h) => (
                <li
                  key={h.day}
                  className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0"
                >
                  <span className="text-sm text-muted-fg">{h.day}</span>
                  <span className="font-medium text-sm">{h.time}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Contact */}
          <Card className="border-border/60 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Liên Hệ</h3>
            </div>
            <ul className="space-y-3">
              {contacts.map((c) => (
                <li
                  key={c.label}
                  className="flex items-center justify-between gap-3 border-b border-border/50 pb-3 last:border-0 last:pb-0"
                >
                  <span className="flex items-center gap-2 text-sm text-muted-fg">
                    <MessageCircle className="h-4 w-4 shrink-0" />
                    {c.label}
                  </span>
                  <span className="font-medium text-sm">{c.value}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </section>
  )
}
