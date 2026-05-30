import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  isLoading: boolean
  disabled: boolean
  formId: string
  isNewProfile?: boolean
}

export function SaveCTABar({ isLoading, disabled, formId, isNewProfile }: Props) {
  return (
    <div className="px-4 pb-4 pt-2">
      <Button
        type="submit"
        form={formId}
        variant="default"
        size="lg"
        disabled={disabled || isLoading}
        className="w-full min-h-[48px]"
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Đang lưu…
          </>
        ) : (
          <>
            <Save size={18} />
            {isNewProfile ? 'Tạo hồ sơ' : '💾 Lưu Thông Tin'}
          </>
        )}
      </Button>
    </div>
  )
}
