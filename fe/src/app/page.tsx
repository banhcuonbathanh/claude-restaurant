import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShoppingCart, Utensils, Clock, ChefHat, Zap, Star } from "lucide-react"

const menuItems = [
  {
    name: "Bánh Cuốn Nhân Thịt",
    desc: "Bánh cuốn mềm mịn, nhân thịt heo xay, mộc nhĩ thơm ngon",
    price: "45,000đ",
    badge: "Bán Chạy",
    badgeVariant: "default" as const,
    time: "8 phút",
  },
  {
    name: "Bánh Cuốn Chả",
    desc: "Kết hợp với chả lụa thượng hạng, nước chấm pha chuẩn vị",
    price: "50,000đ",
    badge: "Mới",
    badgeVariant: "success" as const,
    time: "10 phút",
  },
  {
    name: "Bánh Cuốn Tôm",
    desc: "Nhân tôm tươi, hành phi giòn, ăn kèm rau sống tươi ngon",
    price: "55,000đ",
    badge: "Đặc Biệt",
    badgeVariant: "warning" as const,
    time: "12 phút",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Utensils className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-lg font-semibold text-foreground">Bánh Cuốn</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">Menu</Button>
            <Button variant="ghost" size="sm">Đơn Hàng</Button>
            <Button size="sm">Đăng Nhập</Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="gradient-hero relative overflow-hidden py-24">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <Badge variant="secondary" className="mb-4">
            <Zap className="h-3 w-3" />
            Hệ thống POS &amp; Đặt Bàn thông minh
          </Badge>
          <h1 className="font-display text-5xl font-bold leading-tight text-foreground md:text-6xl">
            Quán{" "}
            <span className="text-primary">Bánh Cuốn</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-fg">
            Trải nghiệm đặt món tiện lợi qua QR code. Quản lý bếp và thanh toán trong một hệ thống.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" className="gap-2">
              <ShoppingCart className="h-5 w-5" />
              Xem Menu
            </Button>
            <Button variant="outline" size="lg">Quét QR Bàn</Button>
          </div>

          {/* Stats row */}
          <div className="mt-12 flex flex-wrap justify-center gap-6">
            {[
              { icon: <Star className="h-4 w-4 text-warning" />, label: "4.9 Đánh giá" },
              { icon: <Clock className="h-4 w-4 text-success" />, label: "8–15 Phút" },
              { icon: <ChefHat className="h-4 w-4 text-primary" />, label: "3 Đầu Bếp" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground">
                {s.icon}
                {s.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Menu Cards ── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground">Thực Đơn Hôm Nay</h2>
            <p className="mt-1 text-muted-fg">Tươi ngon mỗi ngày, làm từ nguyên liệu chọn lọc</p>
          </div>
          <Button variant="outline" size="sm">Xem tất cả</Button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item) => (
            <Card key={item.name} className="group overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
              {/* Placeholder image area */}
              <div className="h-48 bg-gradient-to-br from-muted to-card flex items-center justify-center border-b border-border">
                <Utensils className="h-12 w-12 text-muted-fg opacity-30" />
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">{item.name}</CardTitle>
                  <Badge variant={item.badgeVariant} className="shrink-0 text-[10px]">{item.badge}</Badge>
                </div>
                <CardDescription>{item.desc}</CardDescription>
              </CardHeader>
              <CardFooter className="flex items-center justify-between pt-0">
                <div>
                  <span className="text-xl font-bold text-primary">{item.price}</span>
                  <div className="flex items-center gap-1 text-xs text-muted-fg mt-0.5">
                    <Clock className="h-3 w-3" />
                    {item.time}
                  </div>
                </div>
                <Button size="sm" className="gap-1.5">
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Thêm
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* ── QR Entry Form ── */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <Card className="mx-auto max-w-md border-primary/20 bg-gradient-to-b from-card to-background">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Quét Bàn Của Bạn</CardTitle>
            <CardDescription>Nhập số bàn để bắt đầu đặt món ngay tại chỗ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="table">Số Bàn</Label>
              <Input id="table" type="number" placeholder="Ví dụ: 5" min={1} max={30} />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" size="lg">Bắt Đầu Đặt Món</Button>
          </CardFooter>
        </Card>
      </section>

      {/* ── Design System Showcase ── */}
      <section className="border-t border-border bg-card/30 px-4 py-16">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold text-foreground">Design System</h2>
            <p className="mt-1 text-sm text-muted-fg">Components dùng trong toàn bộ ứng dụng</p>
          </div>

          {/* Buttons */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Buttons</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="success">Success</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="destructive">Destructive</Button>
              <Button disabled>Disabled</Button>
            </CardContent>
            <CardContent className="flex flex-wrap gap-3 pt-0">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">Extra Large</Button>
              <Button size="icon"><ShoppingCart /></Button>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Badges</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Hoàn Thành</Badge>
              <Badge variant="warning">Đang Chờ</Badge>
              <Badge variant="urgent">Khẩn Cấp</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="muted">Muted</Badge>
            </CardContent>
          </Card>

          {/* Inputs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Form Controls</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="demo-name">Tên Món</Label>
                <Input id="demo-name" placeholder="Nhập tên món ăn..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo-price">Giá Tiền</Label>
                <Input id="demo-price" type="number" placeholder="45000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo-disabled">Disabled</Label>
                <Input id="demo-disabled" placeholder="Không thể nhập..." disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo-search">Tìm Kiếm</Label>
                <Input id="demo-search" type="search" placeholder="Tìm theo tên..." />
              </div>
            </CardContent>
          </Card>

          {/* Order status cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-success/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Bàn 5</CardTitle>
                  <Badge variant="success">Hoàn Thành</Badge>
                </div>
                <CardDescription>Đơn #00123 · 3 món</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-success">135,000đ</p>
              </CardContent>
              <CardFooter className="gap-2">
                <Button variant="success" size="sm" className="flex-1">In Hoá Đơn</Button>
              </CardFooter>
            </Card>

            <Card className="border-warning/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Bàn 12</CardTitle>
                  <Badge variant="warning">Đang Nấu</Badge>
                </div>
                <CardDescription>Đơn #00124 · 2 món</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-warning">90,000đ</p>
              </CardContent>
              <CardFooter>
                <Button variant="warning" size="sm" className="flex-1">Theo Dõi</Button>
              </CardFooter>
            </Card>

            <Card className="border-urgent/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Bàn 3</CardTitle>
                  <Badge variant="urgent">Khẩn Cấp</Badge>
                </div>
                <CardDescription>Đơn #00125 · 5 món · 18 phút</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-urgent">225,000đ</p>
              </CardContent>
              <CardFooter>
                <Button variant="destructive" size="sm" className="flex-1">Xử Lý Ngay</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border px-4 py-8 text-center text-sm text-muted-fg">
        <p>© 2026 Quán Bánh Cuốn · Hệ thống POS &amp; Đặt Bàn</p>
      </footer>
    </div>
  )
}
