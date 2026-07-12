---
tags: [concept, domain/auth]
---

# Concept — RBAC

Roles and hierarchy. CLAUDE.md cites `docs/core/MASTER_v1.2.md §3`, but the v1.2 file has no §3 — roles appear in its §4.1 transition table and §6.2 JWT payload → [[Docs - Core Rules]].

## Where it's enforced

- BE: `be/internal/middleware/` guards on routes → [[BE - Auth]]
- FE: `fe/src/components/guards/` route guards + `(dashboard)` layout

## Role-gated surfaces

- Guest (QR customer): [[FE - Customer Menu]] · [[FE - Order Tracking]] · [[FE - Chat Widget]]
- Kitchen: [[FE - KDS]]
- Staff/POS: [[FE - POS]]
- Cashier: [[FE - Cashier Payment]]
- Admin/Owner: [[FE - Admin Overview]] · [[FE - Admin Catalog]] · [[FE - Admin Staff & Training]] · [[FE - Admin Marketing & Analytics]]

## JWT

Config + auth rules: `docs/core/MASTER_v1.2.md §6`. Access token in memory (Zustand), refresh in httpOnly cookie — never localStorage.
