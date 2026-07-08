'use client'

import { useEffect, useRef } from 'react'

import type { ChatMessage } from '@/store/chat'

// Message bubbles: user right, assistant left, system centered muted.
export function ChatMessageList({ messages, isStreaming }: { messages: ChatMessage[]; isStreaming: boolean }) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  return (
    <div className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
      {messages.length === 0 && (
        <p className="pt-8 text-center text-sm text-gray-400">
          Xin chào! Mình có thể tư vấn món và đặt món giúp bạn 🍽️
        </p>
      )}
      {messages.map((m) => {
        if (m.role === 'system') {
          return (
            <p key={m.id} className="text-center text-xs text-gray-400">
              {m.text}
            </p>
          )
        }
        const isUser = m.role === 'user'
        return (
          <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                isUser ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'
              }`}
            >
              {m.text}
            </div>
          </div>
        )
      })}
      {isStreaming && (
        <div className="flex justify-start">
          <div className="rounded-2xl bg-gray-100 px-3 py-2 text-sm text-gray-400">Đang trả lời…</div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
