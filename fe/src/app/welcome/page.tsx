import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  MapPin, Clock, QrCode, ChefHat, Star, Phone, ArrowRight,
} from "lucide-react"

const dishes = [
  {
    name: "Bánh Cuốn Nhân Thịt",
    desc: "Bánh cuốn mỏng mịn cuộn nhân thịt heo xay trộn mộc nhĩ, ăn kèm chả lụa và nước chấm pha chuẩn vị.",
    tag: "Đặc Biệt",
  },
  {
    name: "Bánh Cuốn Tôm Thịt",
    desc: "Phiên bản cao cấp hơn — nhân tôm tươi kết hợp thịt băm, ăn kèm hành phi giòn thơm.",
    tag: "Bán Chạy",
  },
  {
    name: "Bánh Cuốn Chay",
    desc: "Nhân nấm hương, cà rốt, đậu phụ non — thanh đạm, phù hợp mọi người kể cả người ăn chay.",
    tag: "Chay",
  },
]

const hours = [
  { day: "Thứ 2 – Thứ 6", time: "06:30 – 21:00" },
  { day: "Thứ 7 – Chủ Nhật", time: "06:00 – 21:30" },
]

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <ChefHat className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-lg font-semibold">Bánh Cuốn Bà Hoa</span>
          </div>
          <Button size="sm" className="gap-2" asChild>
            <Link href="/menu">
              <QrCode className="h-4 w-4" />
              Xem Thực Đơn
            </Link>
          </Button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="gradient-hero relative overflow-hidden py-28">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <Badge variant="secondary" className="mb-5 gap-1.5">
            <Star className="h-3 w-3" />
            Quán Bánh Cuốn Truyền Thống Từ 1995
          </Badge>

          <h1 className="font-display text-5xl font-bold leading-tight md:text-7xl">
            Hương Vị{" "}
            <span className="text-primary">Bánh Cuốn</span>
            <br />Đúng Vị Hà Nội
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-fg md:text-xl">
            Bánh cuốn tráng tay mỗi sáng từ bột gạo tươi, nhân thịt thơm,
            nước chấm pha chuẩn — mang trọn ký ức Hà Nội về từng bữa sáng.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button size="xl" className="gap-2 glow-primary" asChild>
              <Link href="/menu">
                <QrCode className="h-5 w-5" />
                Đặt Món Ngay
              </Link>
            </Button>
            <Button variant="outline" size="xl" className="gap-2" asChild>
              <a href="#about">
                Tìm Hiểu Thêm
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="mx-auto max-w-5xl px-4 py-24">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <Badge variant="outline" className="mb-4">Câu Chuyện Của Chúng Tôi</Badge>
            <h2 className="font-display text-4xl font-bold leading-snug">
              Gần 30 Năm<br />
              <span className="text-primary">Trao Truyền Hương Vị</span>
            </h2>
            <p className="mt-5 text-muted-fg leading-relaxed">
              Quán Bánh Cuốn Bà Hoa được bà Nguyễn Thị Hoa mở từ năm 1995 tại Hà Nội.
              Khởi đầu chỉ là chiếc xe đẩy nhỏ trước cổng trường, đến nay quán đã trở thành
              địa chỉ quen thuộc của hàng nghìn thực khách mỗi tuần.
            </p>
            <p className="mt-4 text-muted-fg leading-relaxed">
              Mỗi chiếc bánh vẫn được tráng tay từ bột gạo tươi xay mỗi sáng.
              Nước chấm pha theo công thức gia truyền — không bao giờ thay đổi.
              Chúng tôi tin rằng sự kiên định với hương vị gốc chính là
              lý do khách hàng quay lại mỗi ngày.
            </p>
          </div>

          {/* Placeholder image block */}
          <div className="flex aspect-square items-center justify-center rounded-2xl border border-border bg-card">
            <div className="text-center text-muted-fg">
              <ChefHat className="mx-auto mb-3 h-16 w-16 opacity-30" />
              <p className="text-sm">Ảnh quán sẽ được thêm vào đây</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Signature Dishes ── */}
      <section className="border-y border-border bg-card/20 py-24">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-14 text-center">
            <Badge variant="outline" className="mb-3">Thực Đơn Nổi Bật</Badge>
            <h2 className="font-display text-4xl font-bold">Món Đặc Trưng</h2>
            <p className="mt-3 text-muted-fg">Những món được thực khách yêu thích nhất tại quán.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {dishes.map((d) => (
              <Card
                key={d.name}
                className="group border-border/60 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
              >
                {/* Image placeholder */}
                <div className="flex h-40 items-center justify-center rounded-t-lg border-b border-border bg-muted/30">
                  <ChefHat className="h-12 w-12 text-muted-fg/30" />
                </div>
                <CardContent className="pt-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="font-semibold leading-snug">{d.name}</h3>
                    <Badge variant="secondary" className="shrink-0 text-xs">{d.tag}</Badge>
                  </div>
                  <p className="text-sm text-muted-fg leading-relaxed">{d.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button variant="outline" size="lg" className="gap-2" asChild>
              <Link href="/menu">
                Xem Toàn Bộ Thực Đơn
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Hours & Location ── */}
      <section className="mx-auto max-w-5xl px-4 py-24">
        <div className="mb-14 text-center">
          <Badge variant="outline" className="mb-3">Thông Tin</Badge>
          <h2 className="font-display text-4xl font-bold">Giờ Mở Cửa & Địa Chỉ</h2>
        </div>

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
                <li key={h.day} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                  <span className="text-sm text-muted-fg">{h.day}</span>
                  <span className="font-medium text-sm">{h.time}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Location */}
          <Card className="border-border/60 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Địa Chỉ</h3>
            </div>
            <p className="text-sm text-muted-fg leading-relaxed">
              123 Đường Ẩm Thực, Phường Hàng Bông,<br />
              Quận Hoàn Kiếm, Hà Nội
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-fg">
              <Phone className="h-4 w-4 shrink-0" />
              <span>0901 234 567</span>
            </div>
            {/* Map placeholder */}
            <div className="mt-4 flex h-32 items-center justify-center rounded-xl border border-border bg-muted/30">
              <div className="text-center text-muted-fg">
                <MapPin className="mx-auto mb-1 h-6 w-6 opacity-40" />
                <p className="text-xs">Bản đồ sẽ được nhúng vào đây</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── QR CTA ── */}
      <section className="gradient-hero border-t border-border py-24">
        <div className="mx-auto max-w-xl px-4 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-card/60">
            <QrCode className="h-10 w-10 text-primary" />
          </div>
          <h2 className="font-display text-4xl font-bold md:text-5xl">
            Sẵn Sàng Đặt Món?
          </h2>
          <p className="mt-4 text-lg text-muted-fg">
            Quét mã QR tại bàn hoặc nhấn nút bên dưới để xem thực đơn và đặt món trực tiếp — không cần tải app.
          </p>
          <Button size="xl" className="mt-8 gap-2 glow-primary" asChild>
            <Link href="/menu">
              <QrCode className="h-5 w-5" />
              Xem Thực Đơn & Đặt Món
            </Link>
          </Button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border px-4 py-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 text-sm text-muted-fg">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <ChefHat className="h-3 w-3 text-white" />
            </div>
            <span>Bánh Cuốn Bà Hoa</span>
          </div>
          <p>© 2026 · Hà Nội, Việt Nam</p>
          <div className="flex gap-4">
            <Link href="/menu" className="hover:text-foreground transition-colors">Thực Đơn</Link>
            <Link href="/privacy-policy" className="hover:text-foreground transition-colors">Chính Sách</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Điều Khoản</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
