import { redirect } from 'next/navigation'

// /order/[id] was merged into /orders. A specific order is now viewed via the
// `?id=` query param on /orders. Kept as a redirect for old deep-links.
export default function OrderDetailRedirect({ params }: { params: { id: string } }) {
  redirect(`/orders?id=${params.id}`)
}
