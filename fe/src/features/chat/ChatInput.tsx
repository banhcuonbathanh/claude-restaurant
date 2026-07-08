'use client'

import { useState } from 'react'

export function ChatInput({ onSend, disabled }: { onSend: (text: string) => void; disabled: boolean }) {
  const [value, setValue] = useState('')

  const submit = () => {
    const text = value.trim()
    if (!text || disabled) return
    setValue('')
    onSend(text)
  }

  return (
    <div className="flex items-center gap-2 border-t border-gray-200 p-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit()
        }}
        placeholder="Nhắn cho trợ lý…"
        className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-primary"
      />
      <button
        type="button"
        onClick={submit}
        disabled={disabled || !value.trim()}
        className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
      >
        Gửi
      </button>
    </div>
  )
}
