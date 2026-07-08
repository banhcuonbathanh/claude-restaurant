'use client'

import type { ChatProposal } from '@/store/chat'

// The human side of the approval gate: a proposed write action never executes
// until the customer taps "Xác nhận" here (see claude.Chat.md §7).
export function ChatActionCard({
  proposal,
  onConfirm,
  onReject,
}: {
  proposal: ChatProposal
  onConfirm: () => void
  onReject: () => void
}) {
  return (
    <div className="mx-3 mb-2 rounded-xl border border-primary/40 bg-primary/5 p-3">
      <p className="text-xs font-medium text-gray-500">Trợ lý đề xuất:</p>
      <p className="mt-1 text-sm font-semibold text-gray-900">{proposal.summary}</p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-white"
        >
          Xác nhận
        </button>
        <button
          type="button"
          onClick={onReject}
          className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-600"
        >
          Huỷ
        </button>
      </div>
    </div>
  )
}
