'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'cookie_consent_accepted'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true)
    }
  }, [])

  function accept() {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 text-white px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-lg">
      <p className="text-sm leading-relaxed">
        Chúng tôi dùng cookies và bộ nhớ trình duyệt để lưu giỏ hàng và trạng thái đơn hàng.
        Không có dữ liệu thẻ ngân hàng nào được lưu. Xem{' '}
        <Link href="/privacy-policy" className="underline hover:text-gray-300">
          Chính sách bảo mật
        </Link>
        .
      </p>
      <button
        onClick={accept}
        className="shrink-0 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
      >
        Đồng ý
      </button>
    </div>
  )
}
