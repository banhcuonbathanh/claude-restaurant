interface Props {
  icon?:    string
  message:  string
}

export function EmptyState({ icon = '🍜', message }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <span className="text-4xl">{icon}</span>
      <p className="text-muted-fg text-sm">{message}</p>
    </div>
  )
}
