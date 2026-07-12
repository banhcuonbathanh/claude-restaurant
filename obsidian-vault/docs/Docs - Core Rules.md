---
tags: [docs]
---

# Docs — Core Rules (`docs/core/MASTER_v1.2.md`)

The single source for cross-cutting rules.

**Physically present in the v1.2 file** (other sections are "giữ nguyên từ v1.1" — unchanged, not reproduced):

| § | Topic | Concept note |
|---|---|---|
| §4 | Business rules (order, payment, cancel) | [[Concept - Order Lifecycle]] |
| §6 | JWT config + auth rules | [[BE - Auth]] |

CLAUDE.md still routes §2 design tokens / §3 RBAC / §5 realtime here, but those sections are not in the v1.2 file — for RBAC see [[Concept - RBAC]] (roles appear in §4.1 transition table + §6.2 JWT payload); for realtime the live source is `docs/contract/API_CONTRACT_v1.2.md §10` → [[BE - Realtime & Jobs]].

Also see the **Critical Rules (Never Forget)** table at the bottom of `docs/tasks/MASTER_TASK.md` — the distilled always-on constraints (HMAC first, idempotent webhooks, soft delete, UUID strings, combo header = 0, …).
