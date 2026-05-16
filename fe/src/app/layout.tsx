import type { Metadata } from 'next'
import { Playfair_Display, Be_Vietnam_Pro } from 'next/font/google'
import { Providers } from '@/lib/providers'
import { CookieConsent } from '@/components/shared/CookieConsent'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '600', '700'],
})

const beVietnam = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600', '700'],
})

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
    <html lang="vi" className={`${playfair.variable} ${beVietnam.variable}`}>
      <body className="font-body">
          <Providers>{children}</Providers>
          <CookieConsent />
        </body>
    </html>
  )
}
