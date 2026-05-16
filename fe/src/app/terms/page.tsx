import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Điều Khoản Sử Dụng — Quán Bánh Cuốn',
}

export default function TermsPage() {
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
        Điều Khoản Sử Dụng
      </h1>
      <p className="text-sm text-gray-400 mb-8">Cập nhật lần cuối: 16 tháng 5, 2026</p>

      <section className="space-y-6 text-gray-700 leading-relaxed">
        <div>
          <h2 className="font-semibold text-gray-900 text-lg mb-2">1. Chấp nhận điều khoản</h2>
          <p>
            Khi quét mã QR và sử dụng hệ thống đặt món của Quán Bánh Cuốn, bạn đồng ý với các
            điều khoản sử dụng được nêu dưới đây. Nếu bạn không đồng ý, vui lòng liên hệ nhân
            viên để đặt món trực tiếp.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-gray-900 text-lg mb-2">2. Đặt món và đơn hàng</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Mỗi bàn chỉ có một đơn hàng đang hoạt động tại một thời điểm.</li>
            <li>
              Sau khi đặt món, đơn hàng sẽ được chuyển ngay đến bếp. Bạn có thể thêm món trong
              khi đơn hàng đang ở trạng thái <em>chờ xác nhận</em>, <em>đã xác nhận</em> hoặc{' '}
              <em>đang chuẩn bị</em>.
            </li>
            <li>
              Đơn hàng <strong>không thể hủy</strong> khi tổng giá trị món đã được phục vụ vượt
              quá 30% tổng đơn hàng.
            </li>
            <li>
              Quán có quyền từ chối hoặc điều chỉnh đơn hàng nếu nguyên liệu hết hoặc trong
              trường hợp bất khả kháng.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-gray-900 text-lg mb-2">3. Thanh toán</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Thanh toán chỉ được thực hiện sau khi toàn bộ đơn hàng đã được phục vụ xong.</li>
            <li>
              Chúng tôi chấp nhận: tiền mặt (tại quầy thu ngân), VNPay và MoMo (qua mã QR thanh
              toán). Các giao dịch điện tử được bảo mật theo tiêu chuẩn PCI-DSS bởi nhà cung
              cấp dịch vụ thanh toán.
            </li>
            <li>
              Sau khi xác nhận thanh toán thành công, đơn hàng chuyển sang trạng thái{' '}
              <em>hoàn thành</em> và không thể hoàn tiền trừ trường hợp lỗi hệ thống.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-gray-900 text-lg mb-2">4. Trách nhiệm của khách hàng</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Vui lòng kiểm tra kỹ đơn hàng trước khi xác nhận đặt món.</li>
            <li>
              Thông báo cho nhân viên ngay nếu có dị ứng thực phẩm hoặc yêu cầu đặc biệt không
              thể thể hiện qua hệ thống.
            </li>
            <li>Không sử dụng mã QR của bàn khác để đặt món.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-gray-900 text-lg mb-2">5. Giới hạn trách nhiệm</h2>
          <p>
            Quán Bánh Cuốn không chịu trách nhiệm về sự cố kỹ thuật của cổng thanh toán bên thứ
            ba (VNPay, MoMo). Trong trường hợp thanh toán bị lỗi, vui lòng liên hệ nhân viên để
            được hỗ trợ thanh toán thủ công.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-gray-900 text-lg mb-2">6. Thay đổi điều khoản</h2>
          <p>
            Chúng tôi có thể cập nhật điều khoản này mà không cần thông báo trước. Phiên bản mới
            nhất luôn được hiển thị tại trang này.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-gray-900 text-lg mb-2">7. Liên hệ</h2>
          <p>
            Mọi thắc mắc về điều khoản sử dụng, vui lòng liên hệ trực tiếp với nhân viên hoặc
            quản lý quán.
          </p>
        </div>
      </section>
    </main>
  )
}
