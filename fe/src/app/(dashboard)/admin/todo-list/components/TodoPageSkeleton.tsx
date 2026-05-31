export function TodoPageSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-8 w-48 bg-gray-200 rounded" />
      <div className="h-10 bg-gray-200 rounded" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-14 bg-gray-200 rounded" />
      ))}
    </div>
  )
}
