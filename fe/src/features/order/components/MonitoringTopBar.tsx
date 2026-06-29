import { Soup } from 'lucide-react'

interface Props {
  sseConnected: boolean
}

export function MonitoringTopBar({ sseConnected }: Props) {
  return (
    <header
      aria-live="polite"
      className="sticky top-0 z-20 bg-card/95 backdrop-blur-sm border-b border-border flex items-center justify-between px-4 py-3"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="shrink-0 w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
          <Soup size={17} className="text-primary" />
        </span>
        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-foreground leading-tight truncate">
            Theo Dõi Đơn Hàng
          </h1>
          <p className="text-[11px] text-muted-fg leading-tight">Bánh Cuốn</p>
        </div>
      </div>

      <div
        aria-label={sseConnected ? 'Kết nối realtime đang hoạt động' : 'Mất kết nối realtime'}
        className={`flex shrink-0 items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
          sseConnected
            ? 'bg-success/15 text-success'
            : 'bg-muted text-muted-fg'
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            sseConnected ? 'bg-success animate-pulse' : 'bg-muted-fg'
          }`}
        />
        {sseConnected ? 'LIVE' : 'Mất kết nối'}
      </div>
    </header>
  )
}
