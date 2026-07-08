import { create } from 'zustand'

// AI chat widget state (CHAT epic — see claude.Chat.md).
// Client state only: messages mirror the BE Redis history for display;
// the durable copy lives server-side (chat:{session_id}).

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  text: string
}

export interface ChatProposal {
  actionId: string
  tool: string
  summary: string
}

interface ChatState {
  isOpen: boolean
  isStreaming: boolean
  sessionId: string | null
  messages: ChatMessage[]
  proposal: ChatProposal | null

  setOpen: (open: boolean) => void
  setStreaming: (streaming: boolean) => void
  setSessionId: (id: string) => void
  addMessage: (role: ChatMessage['role'], text: string) => void
  /** Merge consecutive assistant text events into one bubble while streaming. */
  appendAssistant: (text: string) => void
  setProposal: (p: ChatProposal | null) => void
  reset: () => void
}

let nextId = 0
const msgId = () => `m${++nextId}`

export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  isStreaming: false,
  sessionId: null,
  messages: [],
  proposal: null,

  setOpen: (isOpen) => set({ isOpen }),
  setStreaming: (isStreaming) => set({ isStreaming }),
  setSessionId: (sessionId) => set({ sessionId }),

  addMessage: (role, text) =>
    set((s) => ({ messages: [...s.messages, { id: msgId(), role, text }] })),

  appendAssistant: (text) =>
    set((s) => {
      const last = s.messages[s.messages.length - 1]
      if (last?.role === 'assistant' && s.isStreaming) {
        const merged = { ...last, text: last.text + (last.text ? '\n' : '') + text }
        return { messages: [...s.messages.slice(0, -1), merged] }
      }
      return { messages: [...s.messages, { id: msgId(), role: 'assistant', text }] }
    }),

  setProposal: (proposal) => set({ proposal }),

  reset: () =>
    set({ messages: [], proposal: null, sessionId: null, isStreaming: false }),
}))
