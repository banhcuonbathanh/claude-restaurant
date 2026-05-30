export function ProfilePageSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Zone B skeleton */}
      <div className="flex flex-col items-center gap-3 py-6 px-4">
        <div className="w-24 h-24 rounded-full bg-muted" />
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="h-5 w-24 rounded-full bg-muted" />
      </div>

      {/* Zone C skeleton */}
      <div className="px-4 space-y-4 pb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3.5 w-28 rounded bg-muted" />
            <div className="h-10 w-full rounded-lg bg-muted" />
          </div>
        ))}
      </div>

      {/* Zone D skeleton */}
      <div className="px-4 pb-4">
        <div className="h-3.5 w-24 rounded bg-muted mb-3" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-muted" />
          ))}
        </div>
      </div>

      {/* Zone E skeleton */}
      <div className="px-4 pb-4">
        <div className="h-12 w-full rounded-xl bg-muted" />
      </div>
    </div>
  )
}
