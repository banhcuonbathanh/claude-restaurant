'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AuthGuard } from '@/components/guards/AuthGuard'
import { RoleGuard } from '@/components/guards/RoleGuard'
import { Role } from '@/types/auth'

const tabs = [
  { href: '/admin/overview',   label: 'Tổng quan' },
  { href: '/admin/products',   label: 'Sản phẩm' },
  { href: '/admin/combos',     label: 'Combo' },
  { href: '/admin/categories', label: 'Danh mục' },
  { href: '/admin/toppings',   label: 'Topping' },
  { href: '/admin/staff',      label: 'Nhân viên' },
  { href: '/admin/marketing',  label: 'Marketing' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <AuthGuard>
      <RoleGuard minRole={Role.MANAGER}>
        <div className="min-h-screen bg-gray-50">
          <div className="bg-white border-b px-6 py-4 shadow-sm">
            <h1 className="text-xl font-bold text-gray-900">Quản trị hệ thống</h1>
            <nav className="mt-3 flex gap-6">
              {tabs.map(tab => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                    pathname === tab.href
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </RoleGuard>
    </AuthGuard>
  )
}
