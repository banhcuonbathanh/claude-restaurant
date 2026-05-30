import { Camera, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Props {
  name: string
  isMember: boolean
  avatarUrl?: string
}

export function ProfileAvatarHeader({ name, isMember, avatarUrl }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 py-6 px-4">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <User size={40} className="text-muted-fg" />
          )}
        </div>
        {/* Avatar upload stubbed for v1 — badge non-interactive until upload API exists */}
        <div
          className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-muted border-2 border-card flex items-center justify-center opacity-50 cursor-not-allowed"
          aria-label="Đổi ảnh (chưa khả dụng)"
        >
          <Camera size={14} className="text-muted-fg" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <p className="text-base font-semibold text-foreground truncate max-w-[240px]">{name}</p>
        {isMember && (
          <Badge variant="success">✓ Thành viên</Badge>
        )}
      </div>
    </div>
  )
}
