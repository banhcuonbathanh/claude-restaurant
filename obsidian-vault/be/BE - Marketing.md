---
tags: [be, domain/admin]
---

# BE — Marketing

Marketing spend endpoint (Phase 8). Currently a stub.

## Code chain

`be/internal/handler/marketing_handler.go` — `MarketingHandler struct{}` with **no service or repo**; its only endpoint `GET /api/v1/admin/marketing/spend` returns hard-coded static JSON. Table QR-code generation is NOT here → [[BE - Tables & QR]].

## Consumers

- [[FE - Admin Marketing & Analytics]] — marketing page (`(dashboard)/admin/marketing/`)
- FE components: `fe/src/components/marketing/` · hook: `fe/src/hooks/useMarketingSpend.ts`

## Related

- QR codes for tables → [[BE - Tables & QR]]
- Spec: `docs/spec/Spec_9_Admin_Dashboard_Pages.md` (Marketing section) → [[Docs - Specs]]
