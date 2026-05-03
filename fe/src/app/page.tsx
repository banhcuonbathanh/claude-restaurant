import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Utensils, QrCode, LayoutDashboard, ChefHat, CreditCard, BarChart3,
  ArrowRight, CheckCircle2, Zap, Shield, Clock, Star,
} from "lucide-react"

const features = [
  {
    icon: <QrCode className="h-6 w-6 text-primary" />,
    title: "QR Đặt Bàn",
    desc: "Khách quét QR, xem menu, và đặt món không cần app — trực tiếp trên trình duyệt.",
  },
  {
    icon: <ChefHat className="h-6 w-6 text-success" />,
    title: "KDS Bếp Thời Gian Thực",
    desc: "Màn hình bếp cập nhật tức thì qua WebSocket. Màu sắc cảnh báo theo mức độ khẩn cấp.",
  },
  {
    icon: <CreditCard className="h-6 w-6 text-warning" />,
    title: "POS & Thanh Toán",
    desc: "Thu ngân xử lý đơn, nhận thanh toán tiền mặt hoặc chuyển khoản, in hoá đơn nhanh.",
  },
  {
    icon: <LayoutDashboard className="h-6 w-6 text-primary" />,
    title: "Admin Dashboard",
    desc: "Quản lý sản phẩm, danh mục, topping, nhân viên và bàn — toàn bộ trong một giao diện.",
  },
  {
    icon: <BarChart3 className="h-6 w-6 text-success" />,
    title: "Báo Cáo & Thống Kê",
    desc: "Theo dõi doanh thu, món bán chạy, và hiệu suất ca làm việc theo ngày/tuần/tháng.",
  },
  {
    icon: <Shield className="h-6 w-6 text-warning" />,
    title: "Phân Quyền Vai Trò",
    desc: "Phân quyền rõ ràng: Admin · Manager · Cashier · Chef. Mỗi vai trò chỉ thấy chức năng của mình.",
  },
]

const steps = [
  { num: "01", title: "Tạo Menu", desc: "Thêm danh mục, món ăn, và topping tùy chọn từ Admin Dashboard." },
  { num: "02", title: "In QR Bàn", desc: "Hệ thống tạo QR code cho từng bàn. In ra và dán lên bàn là xong." },
  { num: "03", title: "Khách Tự Đặt", desc: "Khách quét QR → xem menu → đặt món → đơn tự động đẩy lên bếp." },
  { num: "04", title: "Bếp & Thanh Toán", desc: "Bếp nhận đơn trên KDS. Thu ngân thanh toán và đóng bàn trên POS." },
]

const stats = [
  { icon: <Zap className="h-4 w-4 text-primary" />, value: "< 1s", label: "Đơn đến bếp" },
  { icon: <Clock className="h-4 w-4 text-success" />, value: "8–15 phút", label: "Thời gian phục vụ" },
  { icon: <Star className="h-4 w-4 text-warning" />, value: "99.9%", label: "Uptime" },
  { icon: <CheckCircle2 className="h-4 w-4 text-success" />, value: "0 app", label: "Cài đặt cho khách" },
]

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Utensils className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-lg font-semibold">Bánh Cuốn POS</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <a href="#features">Tính Năng</a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="#how-it-works">Cách Dùng</a>
            </Button>
            <Button size="sm" asChild>
              <Link href="/admin">Vào Dashboard</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="gradient-hero relative overflow-hidden py-28">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <Badge variant="secondary" className="mb-5 gap-1.5">
            <Zap className="h-3 w-3" />
            Hệ thống POS + QR + KDS cho quán ăn Việt
          </Badge>

          <h1 className="font-display text-5xl font-bold leading-tight md:text-7xl">
            Quản Lý Quán{" "}
            <span className="text-primary">Thông Minh</span>
            <br />Không Cần Cài App
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-fg md:text-xl">
            Khách quét QR → đặt món → bếp nhận ngay → thu ngân thanh toán.
            Toàn bộ luồng trong một hệ thống, thời gian thực.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button size="xl" className="gap-2 glow-primary" asChild>
              <Link href="/admin">
                <LayoutDashboard className="h-5 w-5" />
                Vào Admin Dashboard
              </Link>
            </Button>
            <Button variant="outline" size="xl" className="gap-2" asChild>
              <Link href="/table/1">
                <QrCode className="h-5 w-5" />
                Thử Menu Khách
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 flex flex-wrap justify-center gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-3"
              >
                {s.icon}
                <div className="text-left">
                  <p className="text-base font-bold">{s.value}</p>
                  <p className="text-xs text-muted-fg">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-24">
        <div className="mb-14 text-center">
          <Badge variant="outline" className="mb-3">Tính Năng</Badge>
          <h2 className="font-display text-4xl font-bold">Mọi Thứ Bạn Cần</h2>
          <p className="mt-3 text-muted-fg">Từ bếp đến quầy thu ngân, tất cả kết nối liền mạch.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card
              key={f.title}
              className="group border-border/60 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
            >
              <CardHeader>
                <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card">
                  {f.icon}
                </div>
                <CardTitle className="text-base">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-fg">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="border-y border-border bg-card/20 py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-14 text-center">
            <Badge variant="outline" className="mb-3">Cách Dùng</Badge>
            <h2 className="font-display text-4xl font-bold">Bắt Đầu Trong 4 Bước</h2>
            <p className="mt-3 text-muted-fg">Triển khai nhanh, không cần kiến thức kỹ thuật.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.num} className="relative flex flex-col gap-3">
                {i < steps.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-3 hidden h-5 w-5 text-border lg:block" />
                )}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 font-display text-xl font-bold text-primary">
                  {s.num}
                </div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-fg">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Role Overview ── */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <div className="mb-14 text-center">
          <Badge variant="outline" className="mb-3">Vai Trò</Badge>
          <h2 className="font-display text-4xl font-bold">Đúng Người, Đúng Chức Năng</h2>
          <p className="mt-3 text-muted-fg">Mỗi vai trò có giao diện riêng, phân quyền rõ ràng.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              role: "Admin",
              color: "text-primary border-primary/30 bg-primary/5",
              dot: "bg-primary",
              tasks: ["Quản lý sản phẩm & menu", "Quản lý nhân viên", "Cấu hình hệ thống", "Xem báo cáo tổng"],
            },
            {
              role: "Manager",
              color: "text-success border-success/30 bg-success/5",
              dot: "bg-success",
              tasks: ["Xem báo cáo doanh thu", "Quản lý ca làm", "Xem đơn đang chạy", "Điều phối bàn"],
            },
            {
              role: "Cashier",
              color: "text-warning border-warning/30 bg-warning/5",
              dot: "bg-warning",
              tasks: ["Giao diện POS", "Nhận thanh toán", "In hoá đơn", "Đóng bàn"],
            },
            {
              role: "Chef",
              color: "text-urgent border-urgent/30 bg-urgent/5",
              dot: "bg-urgent",
              tasks: ["Màn hình KDS bếp", "Xác nhận hoàn thành", "Cảnh báo khẩn cấp", "Lịch sử đơn"],
            },
          ].map((r) => (
            <Card key={r.role} className={`border ${r.color}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${r.dot}`} />
                  <CardTitle className="text-base">{r.role}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {r.tasks.map((t) => (
                    <li key={t} className="flex items-start gap-2 text-sm text-muted-fg">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-current opacity-60" />
                      {t}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="gradient-hero border-t border-border py-24">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="font-display text-4xl font-bold md:text-5xl">
            Sẵn Sàng Chạy?
          </h2>
          <p className="mt-4 text-lg text-muted-fg">
            Hệ thống đã được triển khai đầy đủ. Đăng nhập vào dashboard để bắt đầu quản lý quán.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button size="xl" className="gap-2 glow-primary" asChild>
              <Link href="/admin">
                <LayoutDashboard className="h-5 w-5" />
                Vào Admin Dashboard
              </Link>
            </Button>
            <Button variant="outline" size="xl" className="gap-2" asChild>
              <Link href="/table/1">
                <QrCode className="h-5 w-5" />
                Xem Demo Khách
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-sm text-muted-fg">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <Utensils className="h-3 w-3 text-white" />
            </div>
            <span>Bánh Cuốn POS</span>
          </div>
          <p>© 2026 · Hệ thống QR Ordering + POS + KDS</p>
          <div className="flex gap-4">
            <Link href="/admin" className="hover:text-foreground transition-colors">Admin</Link>
            <Link href="/table/1" className="hover:text-foreground transition-colors">Demo Khách</Link>
            <Link href="/auth/login" className="hover:text-foreground transition-colors">Đăng Nhập</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
