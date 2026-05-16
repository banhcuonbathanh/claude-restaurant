import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Chính Sách Bảo Mật — Quán Bánh Cuốn',
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-10 max-w-2xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại
      </Link>

      <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
        Chính Sách Bảo Mật
      </h1>
      <p className="text-sm text-gray-400 mb-8">Cập nhật lần cuối: 16 tháng 5, 2026</p>

      <section className="space-y-6 text-gray-700 leading-relaxed">
        <div>
          <h2 className="font-semibold text-gray-900 text-lg mb-2">1. Thông tin chúng tôi thu thập</h2>
          <p>
            Khi bạn sử dụng hệ thống đặt món QR của chúng tôi, chúng tôi thu thập các thông tin
            sau để xử lý đơn hàng:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Số bàn được liên kết với mã QR bạn quét</li>
            <li>Danh sách món ăn và topping bạn chọn</li>
            <li>Phương thức thanh toán bạn chọn (tiền mặt, VNPay, MoMo)</li>
            <li>Thời gian đặt món và trạng thái đơn hàng</li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-gray-900 text-lg mb-2">2. Thông tin chúng tôi KHÔNG lưu trữ</h2>
          <p>
            Chúng tôi <strong>không</strong> thu thập, lưu trữ, hoặc xử lý bất kỳ thông tin thẻ
            ngân hàng nào (số thẻ, CVV, ngày hết hạn). Mọi giao dịch thanh toán điện tử được xử
            lý hoàn toàn bởi cổng thanh toán bên thứ ba (VNPay, MoMo) theo tiêu chuẩn PCI-DSS.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-gray-900 text-lg mb-2">3. Mục đích sử dụng thông tin</h2>
          <p>Thông tin thu thập được sử dụng để:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Xử lý và theo dõi đơn hàng của bạn</li>
            <li>Hiển thị trạng thái đơn hàng cho nhân viên bếp và thu ngân</li>
            <li>Tính toán tổng tiền và phát hành biên lai</li>
            <li>Cải thiện dịch vụ dựa trên dữ liệu đơn hàng tổng hợp (không định danh cá nhân)</li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-gray-900 text-lg mb-2">4. Cookie và bộ nhớ trình duyệt</h2>
          <p>
            Chúng tôi sử dụng <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">localStorage</code> của
            trình duyệt để lưu trạng thái giỏ hàng, tên hiển thị và số bàn bạn nhập thủ công.
            Dữ liệu này chỉ tồn tại trên thiết bị của bạn và không được gửi lên máy chủ.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-gray-900 text-lg mb-2">5. Chia sẻ thông tin</h2>
          <p>
            Chúng tôi không bán, cho thuê, hoặc chia sẻ thông tin đơn hàng của bạn với bên thứ
            ba, ngoại trừ cổng thanh toán khi bạn chọn thanh toán điện tử (VNPay, MoMo) và khi
            pháp luật yêu cầu.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-gray-900 text-lg mb-2">6. Thời gian lưu trữ</h2>
          <p>
            Dữ liệu đơn hàng được lưu trữ trong hệ thống nội bộ trong thời gian tối đa 90 ngày
            cho mục đích kế toán và hỗ trợ khách hàng, sau đó được xóa hoặc ẩn danh hóa.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-gray-900 text-lg mb-2">7. Liên hệ</h2>
          <p>
            Nếu bạn có câu hỏi về chính sách bảo mật, vui lòng liên hệ nhân viên quán hoặc
            quản lý trực tiếp tại quầy.
          </p>
        </div>
      </section>
    </main>
  )
}
