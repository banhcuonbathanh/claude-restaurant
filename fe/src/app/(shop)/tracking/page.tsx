import { redirect } from 'next/navigation'

// /tracking was merged into /orders (see /orders page). Kept as a redirect so
// any printed QR / bookmarked link still resolves.
export default function TrackingRedirect() {
  redirect('/orders')
}
