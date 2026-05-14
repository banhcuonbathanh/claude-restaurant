'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import { useSettingsStore } from '@/store/settings'

export default function CustomerSettingsPage() {
  const router = useRouter()
  const { customerName, tableLabel, setCustomerName, setTableLabel } = useSettingsStore()
  const [name, setName]   = useState(customerName)
  const [table, setTable] = useState(tableLabel)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setCustomerName(name.trim())
    setTableLabel(table.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-1 rounded-full hover:bg-muted transition-colors"
          aria-label="Quay lại"
        >
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <h1 className="font-display text-lg text-foreground font-semibold flex-1">Cài đặt</h1>
      </header>

      <main className="px-4 py-6 flex flex-col gap-6">
        {/* Customer name */}
        <div className="flex flex-col gap-2">
          <label htmlFor="customer-name" className="text-sm font-semibold text-foreground">
            Tên hiển thị
          </label>
          <input
            id="customer-name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ví dụ: Anh Minh"
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-muted-fg">Hiển thị trong giỏ hàng và xác nhận đơn.</p>
        </div>

        {/* Table label */}
        <div className="flex flex-col gap-2">
          <label htmlFor="table-label" className="text-sm font-semibold text-foreground">
            Nhãn bàn
          </label>
          <input
            id="table-label"
            type="text"
            value={table}
            onChange={e => setTable(e.target.value)}
            placeholder="Ví dụ: Bàn 3"
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-muted-fg">Hiển thị trong header menu và giỏ hàng.</p>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          className="flex items-center justify-center gap-2 w-full bg-primary text-primary-fg font-semibold text-sm rounded-xl py-4 active:scale-[.98] transition-transform"
        >
          <Save size={16} />
          {saved ? 'Đã lưu!' : 'Lưu cài đặt'}
        </button>
      </main>
    </div>
  )
}
