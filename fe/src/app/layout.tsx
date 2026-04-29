import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Quán Bánh Cuốn',
  description: 'Hệ thống đặt món & quản lý nhà hàng',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}
