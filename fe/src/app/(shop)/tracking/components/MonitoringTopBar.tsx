interface Props {
  sseConnected: boolean
}

export function MonitoringTopBar({ sseConnected }: Props) {
  return (
    <header
      aria-live="polite"
      className="sticky top-0 z-20 bg-card border-b border-border flex items-center justify-between px-4 py-3"
    >
      <h1 className="text-sm font-semibold text-foreground">
        Theo Dõi Đơn Hàng — Bánh Cuốn
      </h1>
      <div
        aria-label={sseConnected ? 'Kết nối realtime đang hoạt động' : 'Mất kết nối realtime'}
        className={`flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
          sseConnected
            ? 'bg-green-900/30 text-success'
            : 'bg-gray-700/40 text-muted-fg'
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
