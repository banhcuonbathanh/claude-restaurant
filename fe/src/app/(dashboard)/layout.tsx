import { OrdersWSProvider } from '@/context/OrdersWSContext'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <OrdersWSProvider>{children}</OrdersWSProvider>
}
