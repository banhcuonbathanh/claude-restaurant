---
tags: [fe, page/admin]
---

# FE — Admin Overview

Live floor view: zones B/C/D/E (WaitingSection, PrepPanel, TableList), Kiểm tra what-if preview, aggregated online-orders row.

## Code

- Page: `fe/src/app/(dashboard)/admin/overview/page.tsx`
- Components: `fe/src/features/admin/components/` (WaitingSection.tsx · PrepPanel.tsx · TableList.tsx); `fe/src/components/admin/` holds only `training/`
- Live data: `fe/src/hooks/useOverviewWS.ts` + `useAdminSSE.ts` → [[BE - Realtime & Jobs]]

## MUST READ before touching

`docs/fe/wireframes/admin_main/admin_overview/Admin_Overview_Status_Routing_Reference.md` — canonical status → zone routing table.

## Behaviour

- `toppingLabel` reads real `filling` + `note` (OC-4) → [[Concept - Combo & Filling Model]]
- Online orders aggregate into one "Danh sách bàn" row (ONLINE-4)
- Kiểm tra what-if preview (Phase OV-KIEMTRA)

## BE

- [[BE - Orders]] · [[BE - Analytics]] · [[BE - Tables & QR]]

## Spec

- `docs/spec/Spec_9_Admin_Dashboard_Pages.md` → [[Docs - Specs]]
