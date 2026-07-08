'use client'

import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import { useAuthStore } from '@/features/auth/auth.store'
import { useCartStore } from '@/store/cart'
import { useChatStore } from '@/store/chat'

// useChatStream — talks to POST /chat (SSE) and POST /chat/confirm.
// SSE events: text · proposal · done · error (see chat-feature/PLAN.md).
// On data_updated after a confirm, invalidates queries so menu/order views refresh.

interface ConfirmResponse {
  status: 'executed' | 'rejected'
  message: string
  order_id?: string
  order_number?: string
  data_updated: boolean
}

function loadSessionId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.CHAT_SESSION)
  } catch {
    return null
  }
}

function saveSessionId(id: string) {
  try {
    localStorage.setItem(STORAGE_KEYS.CHAT_SESSION, id)
  } catch {
    /* storage unavailable — session just won't persist */
  }
}

/** Parse an SSE chunk buffer; returns [events, remainder]. */
function parseSSE(buffer: string): [{ event: string; data: string }[], string] {
  const events: { event: string; data: string }[] = []
  const parts = buffer.split('\n\n')
  const remainder = parts.pop() ?? ''
  for (const part of parts) {
    let event = 'message'
    let data = ''
    for (const line of part.split('\n')) {
      if (line.startsWith('event: ')) event = line.slice(7).trim()
      else if (line.startsWith('data: ')) data += line.slice(6)
    }
    if (data) events.push({ event, data })
  }
  return [events, remainder]
}

export function useChatStream() {
  const queryClient = useQueryClient()
  const chat = useChatStore()

  const send = useCallback(
    async (message: string) => {
      const text = message.trim()
      if (!text || useChatStore.getState().isStreaming) return

      const token = useAuthStore.getState().accessToken
      const { addMessage, appendAssistant, setProposal, setStreaming, setSessionId } =
        useChatStore.getState()

      addMessage('user', text)

      if (!token) {
        addMessage('system', 'Bạn cần quét mã QR trên bàn trước khi dùng trợ lý.')
        return
      }

      setStreaming(true)
      try {
        const { tableId, activeOrderId } = useCartStore.getState()
        const res = await fetch(`${api.defaults.baseURL}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            session_id: loadSessionId() ?? undefined,
            message: text,
            table_id: tableId ?? undefined,
            order_id: activeOrderId ?? undefined,
          }),
        })

        if (!res.ok || !res.body) {
          addMessage('system', 'Trợ lý AI đang gặp sự cố, vui lòng thử lại sau.')
          return
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const [events, remainder] = parseSSE(buffer)
          buffer = remainder

          for (const ev of events) {
            const payload = JSON.parse(ev.data)
            switch (ev.event) {
              case 'text':
                appendAssistant(payload.text)
                break
              case 'proposal':
                setProposal({
                  actionId: payload.action_id,
                  tool: payload.tool,
                  summary: payload.summary,
                })
                break
              case 'done':
                if (payload.session_id) {
                  saveSessionId(payload.session_id)
                  setSessionId(payload.session_id)
                }
                break
              case 'error':
                addMessage('system', payload.message ?? 'Có lỗi xảy ra.')
                break
            }
          }
        }
      } catch {
        useChatStore.getState().addMessage('system', 'Mất kết nối tới trợ lý AI.')
      } finally {
        useChatStore.getState().setStreaming(false)
      }
    },
    [],
  )

  const respondToProposal = useCallback(
    async (approve: boolean) => {
      const { proposal, setProposal, addMessage } = useChatStore.getState()
      const sessionId = loadSessionId()
      if (!proposal || !sessionId) return

      setProposal(null)
      try {
        const { data } = await api.post<ConfirmResponse>('/chat/confirm', {
          session_id: sessionId,
          action_id: proposal.actionId,
          approve,
        })
        addMessage('assistant', data.message)
        if (data.data_updated) {
          if (data.order_id) {
            useCartStore.getState().setActiveOrderId(data.order_id)
          }
          await queryClient.invalidateQueries()
        }
      } catch {
        addMessage('system', 'Không thực hiện được hành động, vui lòng thử lại.')
      }
    },
    [queryClient],
  )

  return {
    messages: chat.messages,
    proposal: chat.proposal,
    isStreaming: chat.isStreaming,
    send,
    confirm: () => respondToProposal(true),
    reject: () => respondToProposal(false),
  }
}
