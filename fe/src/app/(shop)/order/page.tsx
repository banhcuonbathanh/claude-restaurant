import { redirect } from 'next/navigation'

// /order (order history list) was merged into the active-order-centric /orders
// screen. Kept as a redirect so bookmarked links still resolve.
export default function OrderListRedirect() {
  redirect('/orders')
}
