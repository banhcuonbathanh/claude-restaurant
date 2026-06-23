import { Badge } from "@/components/ui/badge"
import { ChefHat } from "lucide-react"

/**
 * Zone: Câu Chuyện — long-form story text with founder photo placeholder.
 */
export function IntroStory() {
  return (
    <section id="story" className="mx-auto max-w-5xl px-4 py-20">
      <div className="grid gap-12 md:grid-cols-2 md:items-center">
        <div>
          <Badge variant="outline" className="mb-4">
            Câu Chuyện
          </Badge>
          <h2 className="font-display text-3xl font-bold leading-snug md:text-4xl">
            Gần 30 Năm
            <br />
            <span className="text-primary">Trao Truyền Hương Vị</span>
          </h2>
          <p className="mt-5 text-muted-fg leading-relaxed">
            Quán Bánh Cuốn Bà Hoa được bà Nguyễn Thị Hoa mở từ năm 1995 tại Hà Nội.
            Khởi đầu chỉ là chiếc xe đẩy nhỏ trước cổng trường, đến nay quán đã trở
            thành địa chỉ quen thuộc của hàng nghìn thực khách mỗi tuần.
          </p>
          <p className="mt-4 text-muted-fg leading-relaxed">
            Mỗi chiếc bánh vẫn được tráng tay từ bột gạo tươi xay mỗi sáng. Nước
            chấm pha theo công thức gia truyền — không bao giờ thay đổi.
          </p>
          <p className="mt-4 text-muted-fg leading-relaxed">
            Chúng tôi tin rằng sự kiên định với hương vị gốc chính là lý do khách
            hàng quay lại mỗi ngày — và là điều chúng tôi tự hào nhất sau gần ba
            thập kỷ.
          </p>
        </div>

        {/* Founder photo placeholder */}
        <div className="flex aspect-square items-center justify-center rounded-2xl border border-border bg-card">
          <div className="text-center text-muted-fg">
            <ChefHat className="mx-auto mb-3 h-16 w-16 opacity-30" />
            <p className="text-sm">Ảnh người sáng lập sẽ được thêm vào đây</p>
          </div>
        </div>
      </div>
    </section>
  )
}
