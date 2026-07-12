---
tags: [be, domain/admin]
---

# BE — Analytics

Aggregations powering the admin dashboard (overview, summary, revenue).

## Code chain

`be/internal/handler/analytics_handler.go` → `be/internal/service/analytics_service.go` → `be/internal/repository/analytics_repo.go`

## Consumers

- [[FE - Admin Overview]] (live floor + Kiểm tra what-if preview)
- [[FE - Admin Marketing & Analytics]] (summary page)

## Spec

- `docs/spec/Spec_9_Admin_Dashboard_Pages.md` → [[Docs - Specs]]
- Zone/status routing for Overview: `docs/fe/wireframes/admin_main/admin_overview/Admin_Overview_Status_Routing_Reference.md`
