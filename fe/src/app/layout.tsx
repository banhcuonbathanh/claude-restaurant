import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Providers } from '@/lib/providers'
import { CookieConsent } from '@/components/shared/CookieConsent'
import './globals.css'

const playfair = localFont({
  src: [
    { path: '../../public/fonts/playfair-display-vietnamese.woff2', weight: '400 700', style: 'normal' },
    { path: '../../public/fonts/playfair-display-latin.woff2', weight: '400 700', style: 'normal' },
  ],
  variable: '--font-display',
  display: 'swap',
})

const beVietnam = localFont({
  src: [
    { path: '../../public/fonts/be-vietnam-pro-300-vietnamese.woff2', weight: '300', style: 'normal' },
    { path: '../../public/fonts/be-vietnam-pro-300-latin.woff2', weight: '300', style: 'normal' },
    { path: '../../public/fonts/be-vietnam-pro-400-vietnamese.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/be-vietnam-pro-400-latin.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/be-vietnam-pro-500-vietnamese.woff2', weight: '500', style: 'normal' },
    { path: '../../public/fonts/be-vietnam-pro-500-latin.woff2', weight: '500', style: 'normal' },
    { path: '../../public/fonts/be-vietnam-pro-600-vietnamese.woff2', weight: '600', style: 'normal' },
    { path: '../../public/fonts/be-vietnam-pro-600-latin.woff2', weight: '600', style: 'normal' },
    { path: '../../public/fonts/be-vietnam-pro-700-vietnamese.woff2', weight: '700', style: 'normal' },
    { path: '../../public/fonts/be-vietnam-pro-700-latin.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-body',
  display: 'swap',
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
