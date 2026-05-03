'use client'
import { useState, useRef, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import QRCode from 'react-qr-code'
import { toast } from 'sonner'
import {
  QrCode, Copy, Check, Printer, ExternalLink, Download,
  Utensils, Tag, Layers, ShoppingBag,
} from 'lucide-react'
import { listProducts, listCategories, listToppings } from '@/features/admin/admin.api'
import type { Product, Category, Topping } from '@/types/product'

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
const TABLE_COUNT = 10

function TableQRCard({ tableNo }: { tableNo: number }) {
  const url = `${BASE_URL}/table/${tableNo}`
  const svgRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  const copyUrl = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success(`Đã copy URL bàn ${tableNo}`)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadSVG = useCallback(() => {
    const svg = svgRef.current?.querySelector('svg')
    if (!svg) return
    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `qr-ban-${tableNo}.svg`
    a.click()
    URL.revokeObjectURL(a.href)
  }, [tableNo])

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-gray-700">Bàn {tableNo}</p>
      <div ref={svgRef} className="rounded-lg bg-white p-2 shadow-inner">
        <QRCode value={url} size={120} />
      </div>
      <p className="max-w-[140px] truncate text-center text-[10px] text-gray-400">{url}</p>
      <div className="flex gap-2">
        <button
          onClick={copyUrl}
          className="flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs text-gray-600 transition hover:bg-gray-50"
        >
          {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
          Copy
        </button>
        <button
          onClick={downloadSVG}
          className="flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs text-gray-600 transition hover:bg-gray-50"
        >
          <Download className="h-3 w-3" />
          SVG
        </button>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
}

export default function MarketingPage() {
  const [printing, setPrinting] = useState(false)
  const [copiedPublic, setCopiedPublic] = useState(false)
  const publicUrl = `${BASE_URL}`

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['admin', 'products'],
    queryFn: listProducts,
  })
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['admin', 'categories'],
    queryFn: listCategories,
  })
  const { data: toppings = [] } = useQuery<Topping[]>({
    queryKey: ['admin', 'toppings'],
    queryFn: listToppings,
  })

  const availableProducts = products.filter(p => p.is_available)
  const topProducts = [...products].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)).slice(0, 5)

  const copyPublicUrl = () => {
    navigator.clipboard.writeText(publicUrl)
    setCopiedPublic(true)
    toast.success('Đã copy link trang công khai')
    setTimeout(() => setCopiedPublic(false), 2000)
  }

  const printQRs = () => {
    setPrinting(true)
    setTimeout(() => {
      window.print()
      setPrinting(false)
    }, 100)
  }

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Marketing</h2>
        <p className="mt-1 text-sm text-gray-500">QR code bàn, link công khai, và tổng quan thực đơn cho marketing.</p>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={<ShoppingBag className="h-5 w-5" />} label="Sản phẩm" value={products.length} />
        <StatCard icon={<Tag className="h-5 w-5" />} label="Đang bán" value={availableProducts.length} />
        <StatCard icon={<Layers className="h-5 w-5" />} label="Danh mục" value={categories.length} />
        <StatCard icon={<Utensils className="h-5 w-5" />} label="Topping" value={toppings.length} />
      </div>

      {/* ── Public link ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-1 text-base font-semibold text-gray-900">Trang Giới Thiệu Công Khai</h3>
        <p className="mb-4 text-sm text-gray-500">Chia sẻ link này để khách hàng tìm hiểu về quán.</p>
        <div className="flex items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
            <QrCode className="h-4 w-4 shrink-0 text-gray-400" />
            <span className="flex-1 truncate text-sm text-gray-700">{publicUrl}</span>
          </div>
          <button
            onClick={copyPublicUrl}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
          >
            {copiedPublic ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            Copy
          </button>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-orange-600"
          >
            <ExternalLink className="h-4 w-4" />
            Mở
          </a>
        </div>
      </div>

      {/* ── QR Codes ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">QR Code Bàn</h3>
            <p className="text-sm text-gray-500">In QR và đặt lên bàn để khách quét đặt món.</p>
          </div>
          <button
            onClick={printQRs}
            disabled={printing}
            className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:opacity-50"
          >
            <Printer className="h-4 w-4" />
            In Tất Cả
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 print:grid-cols-5">
          {Array.from({ length: TABLE_COUNT }, (_, i) => i + 1).map(n => (
            <TableQRCard key={n} tableNo={n} />
          ))}
        </div>
      </div>

      {/* ── Top products ── */}
      {topProducts.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-1 text-base font-semibold text-gray-900">Spotlight Thực Đơn</h3>
          <p className="mb-4 text-sm text-gray-500">Các món hàng đầu có thể dùng làm nội dung marketing.</p>
          <div className="space-y-2">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-4 rounded-lg border border-gray-100 px-4 py-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm font-medium text-gray-800">{p.name}</span>
                {p.description && (
                  <span className="hidden max-w-xs truncate text-xs text-gray-400 sm:block">{p.description}</span>
                )}
                <span className="text-sm font-semibold text-orange-500">
                  {p.price.toLocaleString('vi-VN')}đ
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.is_available ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {p.is_available ? 'Đang bán' : 'Tạm ngưng'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body > *:not([data-print]) { display: none !important; }
          .print\\:grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
        }
      `}</style>
    </div>
  )
}
