# Phase 3.4 — Next.js 14 Init + fe/src/ Structure
> Do this AFTER Go scaffold (3.3) is complete. Can run in parallel with 3.3.

## Paste These Docs

- [ ] `CLAUDE.md`
- [ ] `MASTER_v1.2.docx` §2 (design tokens)
- [ ] `contract/ERROR_CONTRACT_v1.1.docx`
- [ ] `claude/CLAUDE_FE.docx`

---

## Prompt

```
You are the FE Dev for the BanhCuon system.

I have pasted CLAUDE.md, MASTER §2, ERROR_CONTRACT, and CLAUDE_FE.docx above.

## Task: Initialize Next.js 14 + create fe/src/ folder structure

1. Run this exact command (do not change flags):
   npx create-next-app@14 fe --typescript --tailwind --app --src-dir --import-alias "@/*"

2. Install additional dependencies:
   cd fe
   npm install zustand @tanstack/react-query axios react-hook-form zod @hookform/resolvers
   npm install -D @types/node

3. Configure Tailwind (tailwind.config.ts) — add CSS variables for design tokens:
   Primary: #FF7A1A, Background: #0A0F1E, Card: #1F2937
   Success: #3DB870, Warning: #FCD34D, Urgent: #FC8181
   Text: #F9FAFB, Muted: #9CA3AF

4. Add to next.config.js: output: 'standalone'

5. Create this folder structure with empty index files:
   fe/src/
   ├── app/
   │   ├── (auth)/login/page.tsx     (placeholder: export default function LoginPage)
   │   ├── (shop)/menu/page.tsx      (placeholder)
   │   ├── (shop)/checkout/page.tsx  (placeholder)
   │   ├── (shop)/order/[id]/page.tsx (placeholder)
   │   ├── table/[tableId]/page.tsx  (BLOCKED — add comment: blocked by Issue #7)
   │   └── (dashboard)/
   │       ├── kds/page.tsx          (placeholder)
   │       ├── pos/page.tsx          (placeholder)
   │       └── orders/live/page.tsx  (placeholder)
   ├── components/
   │   ├── ui/            (.gitkeep)
   │   ├── menu/          (.gitkeep)
   │   ├── shared/        (.gitkeep)
   │   └── guards/        (.gitkeep)
   ├── features/
   │   ├── auth/          (.gitkeep)
   │   └── orders/        (.gitkeep)
   ├── hooks/             (.gitkeep)
   ├── store/             (.gitkeep)
   ├── lib/               (.gitkeep)
   └── types/             (.gitkeep)

6. Create fe/.env.local.example:
   NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
   NEXT_PUBLIC_STORAGE_BASE_URL=https://cdn.banhcuon.vn

## Definition of Done
- [ ] npm run build passes with no errors
- [ ] npx tsc --noEmit passes
- [ ] npm run lint passes
- [ ] output: 'standalone' in next.config.js
- [ ] Design tokens defined as CSS variables in globals.css
- [ ] No color hex hardcoded in any component — Tailwind classes only
- [ ] No accessToken anywhere in localStorage (no code touches localStorage yet)
```
