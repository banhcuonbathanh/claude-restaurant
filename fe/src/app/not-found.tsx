import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Utensils, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center text-foreground">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card">
        <Utensils className="h-8 w-8 text-primary" />
      </div>

      <p className="font-display text-6xl font-bold text-primary">404</p>

      <h1 className="mt-4 font-display text-2xl font-bold">
        Trang bạn tìm không tồn tại
      </h1>

      <p className="mt-3 max-w-md text-muted-fg">
        Có vẻ bạn đã đi nhầm đường. Đường dẫn này không có trên hệ thống —
        hãy quay lại menu để tiếp tục đặt món nhé.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button size="xl" className="gap-2" asChild>
          <Link href="/menu">
            <Utensils className="h-5 w-5" />
            Quay lại Menu
          </Link>
        </Button>
        <Button variant="outline" size="xl" className="gap-2" asChild>
          <Link href="/">
            <Home className="h-5 w-5" />
            Về Trang Chủ
          </Link>
        </Button>
      </div>
    </div>
  )
}
