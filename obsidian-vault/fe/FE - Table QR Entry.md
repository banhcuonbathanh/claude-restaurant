---
tags: [fe, page/customer]
---

# FE — Table QR Entry

Entry point when a customer scans a table QR code.

## Code

- `fe/src/app/table/[tableId]/page.tsx` — binds table context, guest auth
- `fe/src/app/welcome/page.tsx` — welcome/landing
- Static pages: `introduction/` · `privacy-policy/` · `terms/`

## Flow

Scan QR → table page → guest session ([[BE - Auth]]) → [[FE - Customer Menu]] with table context → order via popup confirm (**no /checkout, no name/phone** — staff handles the rest).

## Docs

- `docs/work_flow/CLIENT_QR_FLOW.md` → [[Docs - Workflows]] — must read before touching this flow
- Spec: `docs/spec/Spec_6_QR_POS.md` → [[Docs - Specs]]

## BE

- [[BE - Tables & QR]] · [[BE - Auth]]
