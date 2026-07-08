'use client'

import { useChatStream } from '@/hooks/useChatStream'
import { useChatStore } from '@/store/chat'

import { ChatActionCard } from './ChatActionCard'
import { ChatInput } from './ChatInput'
import { ChatMessageList } from './ChatMessageList'

// Floating AI chat widget, mounted once in the (shop) layout.
// FAB anchors LEFT (the favourites speed-dial owns the right side).
export function ChatWidget() {
  const isOpen = useChatStore((s) => s.isOpen)
  const setOpen = useChatStore((s) => s.setOpen)
  const { messages, proposal, isStreaming, send, confirm, reject } = useChatStream()

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          aria-label="Mở trợ lý AI"
          onClick={() => setOpen(true)}
          className="fixed bottom-[calc(96px+env(safe-area-inset-bottom))] left-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-xl text-white shadow-lg"
        >
          💬
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex h-[70vh] flex-col rounded-t-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">Trợ lý Bánh Cuốn 🤖</p>
              <p className="text-xs text-gray-400">Tư vấn món · đặt món · kiểm tra đơn</p>
            </div>
            <button
              type="button"
              aria-label="Đóng trợ lý"
              onClick={() => setOpen(false)}
              className="rounded-full px-2 py-1 text-gray-400 hover:bg-gray-100"
            >
              ✕
            </button>
          </div>

          <ChatMessageList messages={messages} isStreaming={isStreaming} />

          {proposal && <ChatActionCard proposal={proposal} onConfirm={confirm} onReject={reject} />}

          <ChatInput onSend={send} disabled={isStreaming} />
        </div>
      )}
    </>
  )
}
