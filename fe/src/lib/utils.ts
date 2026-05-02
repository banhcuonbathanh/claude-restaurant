import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDateTime(date: string): string {
  const d = new Date(date)
  const hh = d.getHours().toString().padStart(2, '0')
  const mm = d.getMinutes().toString().padStart(2, '0')
  return `${hh}:${mm} · ${d.toLocaleDateString('vi-VN')}`
}

export function formatPercent(n: number): string {
  return `${n.toFixed(1).replace('.', ',')}%`
}

export function getImageUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1'
  const base = apiUrl.replace(/\/api\/v1\/?$/, '')
  return `${base}/${path}`
}
