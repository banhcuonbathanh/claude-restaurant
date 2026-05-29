export function ProductDetailSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Zone A */}
      <div className="w-full aspect-[390/220] bg-muted" />

      {/* Zone B */}
      <div className="px-4 pt-4 pb-4 flex flex-col gap-3">
        <div className="flex items-start gap-2">
          <div className="h-7 bg-muted rounded w-3/4" />
          <div className="h-6 bg-muted rounded-full w-20 flex-shrink-0" />
        </div>
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-5/6" />
          <div className="h-4 bg-muted rounded w-4/6" />
        </div>
      </div>

      {/* Zone C */}
      <div className="px-4 pt-4 flex flex-col gap-3 border-t border-border">
        <div className="h-4 bg-muted rounded w-2/5" />
        <div className="grid grid-cols-2 gap-2">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-muted rounded-xl" />
          ))}
        </div>
      </div>

      {/* Zone D */}
      <div className="px-4 pt-4 pb-32 flex items-center gap-4">
        <div className="h-5 bg-muted rounded w-20" />
        <div className="flex items-center gap-3 ml-auto">
          <div className="w-9 h-9 bg-muted rounded-full" />
          <div className="w-6 h-5 bg-muted rounded" />
          <div className="w-9 h-9 bg-muted rounded-full" />
        </div>
      </div>
    </div>
  )
}
