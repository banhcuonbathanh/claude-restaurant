'use client'
import { useRef, useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { ImagePlus, X, Check } from 'lucide-react'

interface Suggestion {
  url:   string        // full image URL (menu product/combo image)
  label: string        // món/combo name (for alt text)
}

// Self-contained default "quán" covers (gradient + food emoji) as tiny SVG data URLs —
// always offered so the client has something to pick even when menu items have no photo.
const svgThumb = (emoji: string, c1: string, c2: string) =>
  'data:image/svg+xml;utf8,' + encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>` +
    `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>` +
    `<stop offset='0' stop-color='${c1}'/><stop offset='1' stop-color='${c2}'/>` +
    `</linearGradient></defs>` +
    `<rect width='160' height='160' fill='url(#g)'/>` +
    `<text x='80' y='80' font-size='78' text-anchor='middle' dominant-baseline='central'>${emoji}</text>` +
    `</svg>`,
  )

const DEFAULT_SUGGESTIONS: Suggestion[] = [
  { url: svgThumb('🍜', '#FDE68A', '#F59E0B'), label: 'Ảnh mặc định — bánh cuốn' },
  { url: svgThumb('🍱', '#FBCFE8', '#EC4899'), label: 'Ảnh mặc định — suất combo' },
  { url: svgThumb('🥟', '#BBF7D0', '#16A34A'), label: 'Ảnh mặc định — món hấp' },
  { url: svgThumb('🍲', '#BFDBFE', '#3B82F6'), label: 'Ảnh mặc định — canh' },
]

interface Props {
  suggestions: Suggestion[]      // "ảnh của quán" — a handful of menu images to pick from
  value:       string | null     // currently selected image (url or data URL), null = 🍽️ default
  onChange:    (v: string | null) => void
}

// Downscale + compress an uploaded photo to a small JPEG data URL so it doesn't
// bloat localStorage (raw phone photos are 2–5 MB; this keeps it well under ~60 KB).
const MAX_EDGE = 400
const compressToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new window.Image()
      img.onload = () => {
        const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height))
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('no-canvas'))
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.onerror = () => reject(new Error('bad-image'))
      img.src = reader.result as string
    }
    reader.onerror = () => reject(new Error('read-fail'))
    reader.readAsDataURL(file)
  })

// "Ảnh suất" picker: choose one of the restaurant's menu images, or upload one from
// the device. Personal data only — the chosen image is stored on the CustomSuat.
export function SuatImagePicker({ suggestions, value, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  // Quán defaults first, then the live menu images (deduped by url).
  const allSuggestions = [
    ...DEFAULT_SUGGESTIONS,
    ...suggestions.filter(s => !DEFAULT_SUGGESTIONS.some(d => d.url === s.url)),
  ]

  // The selected image is an upload when it isn't one of the offered suggestions.
  const isUpload = !!value && !allSuggestions.some(s => s.url === value)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-picking the same file
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp ảnh')
      return
    }
    setBusy(true)
    try {
      onChange(await compressToDataUrl(file))
    } catch {
      toast.error('Không đọc được ảnh, thử ảnh khác')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-muted-fg">Chọn ảnh của quán hoặc tải từ máy (tuỳ chọn)</span>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-[11px] text-muted-fg hover:text-red-500 transition-colors flex items-center gap-0.5"
          >
            <X size={11} /> Bỏ ảnh
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-0.5 px-0.5">
        {/* Upload from device */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          aria-label="Tải ảnh từ máy"
          className={`relative w-16 h-16 flex-shrink-0 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-0.5 transition-colors disabled:opacity-50 ${
            isUpload ? 'border-primary bg-primary/5' : 'border-border text-muted-fg hover:border-primary/50'
          }`}
        >
          {isUpload ? (
            <>
              <Image src={value} alt="Ảnh đã tải" fill className="object-cover rounded-md" unoptimized sizes="64px" />
              <span className="absolute -top-1 -right-1 bg-primary text-white rounded-full p-0.5">
                <Check size={11} />
              </span>
            </>
          ) : (
            <>
              <ImagePlus size={18} />
              <span className="text-[9px] font-semibold leading-none">Từ máy</span>
            </>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />

        {/* Quán default covers + live menu images */}
        {allSuggestions.map(s => {
          const selected = value === s.url
          return (
            <button
              key={s.url}
              type="button"
              onClick={() => onChange(selected ? null : s.url)}
              aria-label={`Chọn ảnh ${s.label}`}
              className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                selected ? 'border-primary' : 'border-transparent hover:border-primary/40'
              }`}
            >
              <Image src={s.url} alt={s.label} fill className="object-cover" sizes="64px" unoptimized={s.url.startsWith('data:')} />
              {selected && (
                <span className="absolute -top-1 -right-1 bg-primary text-white rounded-full p-0.5">
                  <Check size={11} />
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
