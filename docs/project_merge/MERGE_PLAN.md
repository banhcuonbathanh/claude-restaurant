---
created: 2026-05-28
type: cross-project methodology merge
projects:
  - claude restaurant  (/Users/monghoaivu/Desktop/code/claude restaurant)
  - lap top thinh vuong (/Users/monghoaivu/Desktop/code/lap top thinh vuong)
---

# Cross-Project Merge Plan
## Applying the `/dev-page` Methodology to Both Projects

---

## 1. Side-by-Side: What Each Project Already Has

| Dimension | Restaurant Project | Laptop Thịnh Vượng |
|-----------|-------------------|---------------------|
| **Type** | Software engineering | Digital marketing |
| **Unit of work** | Page (spec → code) | Task (brief → content / action) |
| **Spec format** | `wireframe_v1.md` — zones, components, TypeScript, ACs | `SUPPORT_<role>.md` + `MASTER_WORKFLOW.md` |
| **Execution skill** | `/dev-page` — 3 phases (Audit → Build → Verify) | Manual — no skill yet |
| **Tracking** | `MASTER_TASK.md` + `CURRENT_TASK.md` | `lesson_learned.md` (post-hoc) |
| **Cross-page concerns** | 3 shared indexes (rendering, components, state) | Domain CLAUDE files (Content, Digital, CRM) |
| **Quality gate** | `/quality-check` skill | Manual review by Trưởng phòng |
| **Knowledge loop** | `LESSONS_LEARNED_v3.md` | `lesson_learned.md` (3 tables) |
| **Workflow** | READ→PLAN→ALIGN→IMPLEMENT→SELF-REVIEW→TEST→DONE | Đọc→Tra cứu→Làm rõ→Lập kế hoạch→Thực thi→Kiểm tra→Lesson Learned |
| **Output format** | `.tsx`, `.ts`, `.go` files | `.md` files (drafts, plans, reports) |

**Key insight:** Both projects use the same mental model — `Spec → Execute → Verify` — but only the restaurant project has it formalized as a skill. The gap in the laptop project is the **execution layer**.

---

## 2. What `/dev-page` Does (stripped to the core pattern)

```
Phase 1 — AUDIT (read-only)
  Read spec → extract what's needed → check what exists → report gaps
  STOP and ask user before writing anything

Phase 2 — GAP FILL (build only what's missing)
  Work in order: foundation first → components → wiring
  Spec-first: if detail not in spec, use simplest correct implementation
  Surgical: touch only what audit identified

Phase 3 — INTEGRATION CHECK
  Walk each AC → does code satisfy it? → flag any NOT COVERED
  Output: summary of built + ACs covered
```

This pattern is **domain-agnostic**. It works for code. It also works for content, campaigns, and CRM tasks.

---

## 3. The Merge: Proposed `/do-task` Skill for Laptop Project

Create `.claude/skills/do-task/SKILL.md` in the laptop project.
It mirrors `/dev-page` exactly — same 3-phase structure, different domain.

### Phase 1 — Audit

```
Read the task brief and relevant SUPPORT file.
Extract:
  1. Task type (content / digital / CRM / strategy)
  2. Required deliverables (list all outputs)
  3. Success criteria / KPIs
  4. Reference docs needed (which framework, which calendar entry, which template)
  5. Constraints (deadline, approval chain, format requirements)

Then for each deliverable:
  - Does a draft/version already exist? → ✅ exists / ❌ missing / ⚠️ partial

Output: AUDIT REPORT
  Deliverables to produce: [N]
  Reference docs needed: [list]
  Constraints: [list]
  → STOP and ask user: "Shall I proceed with Phase 2?"
```

### Phase 2 — Execute

```
Work through deliverables in priority order (P0 → P1 → P2).
For each deliverable:
  Step 1 — Read the spec/brief for that item
  Step 2 — Check SUPPORT file for non-obvious rules (format, length, compliance)
  Step 3 — Read reference docs (framework, persona, calendar) — do NOT assume
  Step 4 — Produce the output
  Step 5 — Self-check: does this match the brief + comply with rules?
```

### Phase 3 — Verify

```
Walk each KPI/AC in the brief:
  - Does the output satisfy it? ✅ / ❌
  - Any gaps → flag and fix

Output: COMPLETION SUMMARY
  Deliverables produced: [list]
  KPIs covered: [N/total]
  → Trigger /hand-off to update lesson_learned.md
```

---

## 4. Proposed Folder Standard for Laptop Campaigns

Apply the same folder-per-unit principle from wireframes to marketing campaigns.

### Folder structure

```
02_content/campaigns/[campaign_name]/
├── brief.md               ← who, what, why, KPIs, deadline (= wireframe_v1.md)
├── execution_plan.md      ← channel plan, timeline, budget split (= tech_description.md)
├── content_list.md        ← all deliverables with status (= component map)
├── conccern.md            ← open questions before execution
└── review/
    ├── mid_review.md      ← mid-campaign check (ROAS, CTR, adjustments)
    └── post_review.md     ← post-campaign lesson learned (= recomment_claude.md)
```

### Why this matches the restaurant pattern

| Restaurant wireframe | Laptop campaign |
|---------------------|-----------------|
| `wireframe_v1.md` | `brief.md` |
| `tech_description.md` | `execution_plan.md` |
| Component Map (Zone → File) | `content_list.md` (deliverable → status) |
| `conccern.md` | `conccern.md` |
| `recomment/recomment_claude.md` | `review/post_review.md` |

---

## 5. Shared Principles (already aligned — just make it explicit)

Both projects already share these principles. They should live in a shared reference doc or `~/.claude/CLAUDE_GLOBAL.md`:

### Shared 7-step workflow (unified names)

| Step | Restaurant name | Laptop name | Unified name |
|------|----------------|-------------|--------------|
| 1 | READ | Đọc & Hiểu Task | **Understand** |
| 2 | PLAN | Tra cứu Tài liệu | **Reference** |
| 3 | ALIGN | Làm rõ | **Clarify** |
| 4 | IMPLEMENT | Lập kế hoạch | **Plan** |
| 5 | SELF-REVIEW | Thực thi | **Execute** |
| 6 | TEST | Kiểm tra & Xác nhận | **Verify** |
| 7 | DONE | Lesson Learned | **Learn** |

### Shared proactive flags

Both projects should use the same flag system (restaurant already has it — add to laptop CLAUDE.md):

| Flag | Trigger |
|------|---------|
| `💡 SUGGESTION` | Better approach spotted |
| `⚠️ FLAG` | Risk or inconsistency found |
| `🚨 RISK` | Will break something if we proceed |
| `🔴 STOP` | Cannot continue without clarification |
| `❓ CLARIFY` | Ambiguous requirement |

### Shared "senior co-worker" contract

Both CLAUDEs use the same mental model. The contract is:
- Spot problems the owner hasn't noticed → flag them
- See a better way → suggest BEFORE implementing
- Something unclear → stop and ask, don't guess
- Simplicity first → minimum solution that solves the problem

---

## 6. What's Unique to Each Project (do NOT merge)

| Restaurant keeps | Laptop keeps |
|-----------------|--------------|
| Domain specs (Spec_1–Spec_9) | KPI dashboard (ROAS, CAC, CLV) |
| Shared component indexes | Role-based SUPPORT files |
| Rendering strategy (ISR/RSC/Client) | Lead lifecycle (HOT/WARM/COLD) |
| TypeScript contracts | Approval chain (15h daily submission) |
| BE handler patterns | Crisis management levels (C1/C2/C3) |

Don't collapse these. Each domain has irreducible specifics.

---

## 7. Next Steps (prioritized)

### Immediate (this week)

| # | Task | Project | What to create | Effort |
|---|------|---------|---------------|--------|
| 1 | Create `/do-task` skill | Laptop | `.claude/skills/do-task/SKILL.md` | 1 session |
| 2 | Add campaign folder standard | Laptop | `01_strategy/CAMPAIGN_FOLDER_STANDARD.md` | 1 session |
| 3 | Update laptop `CLAUDE.md` | Laptop | Add flag system + unified 7-step names | 30 min |

### Short-term (next 2 weeks)

| # | Task | Project | What to create | Effort |
|---|------|---------|---------------|--------|
| 4 | Create `CAMPAIGN_STATUS.md` | Laptop | Mirror of `WIREFRAME_PROJECT_STATUS.md` | 1 session |
| 5 | Migrate week21 campaign to folder | Laptop | `02_content/campaigns/week21/` | 1 session |
| 6 | Build `/dev-page client_order_page` | Restaurant | `app/(shop)/order/[id]/` components | 2–3 sessions |
| 7 | Build `<OrderPageSkeleton />` | Restaurant | Blocker for shipping order tracking | 30 min |

### Medium-term (next month)

| # | Task | Project | Notes |
|---|------|---------|-------|
| 8 | P-ARCH-1: `storage-keys.ts` | Restaurant | Fix 6 hardcoded localStorage strings |
| 9 | Apply `/do-task` to active campaigns | Laptop | Real test of the new skill |
| 10 | Phase 7 testing + go-live | Restaurant | E2E tests, VNPay sandbox |

---

## 8. How to Apply `/dev-page` to Restaurant Now

The skill is ready. Run it page by page in this order (highest value first):

```
1. /dev-page client_order_page          ← has skeleton blocker; must ship first
2. /dev-page client_product_detail      ← customer-facing, high traffic
3. /dev-page client_monitoring_servicing_table  ← SSE + skeleton needed
4. /dev-page admin_main/admin_overview  ← OverviewSkeleton blocker
```

For each run:
- Phase 1 output: audit report with gap count
- Confirm before Phase 2
- Phase 3: verify ACs
- Run `/verify` after each page to confirm it works in the browser

---

## 9. The Big Picture

```
                    SHARED META-PATTERN
                    ╔═══════════════════╗
                    ║  Spec → Execute   ║
                    ║     → Verify      ║
                    ╚═══════════════════╝
                           │
           ┌───────────────┴───────────────┐
           ▼                               ▼
  RESTAURANT PROJECT               LAPTOP PROJECT
  ┌─────────────────────┐         ┌─────────────────────┐
  │ wireframe_v1.md     │         │ brief.md            │
  │ + 6 support files   │         │ + 4 support files   │
  └─────────────────────┘         └─────────────────────┘
           │                               │
           ▼                               ▼
  ┌─────────────────────┐         ┌─────────────────────┐
  │ /dev-page           │         │ /do-task  (TBD)     │
  │ Audit → Build →     │         │ Audit → Execute →   │
  │ Verify              │         │ Verify              │
  └─────────────────────┘         └─────────────────────┘
           │                               │
           ▼                               ▼
  React components +               Content drafts +
  Go API handlers                  Campaign plans +
                                   CRM actions
           │                               │
           └───────────────┬───────────────┘
                           ▼
                 lesson_learned.md
                 (both projects)
```

---

*Created: 2026-05-28 — Cross-project analysis session*
*Next review: After `/do-task` skill is built and tested on 1 real campaign*
