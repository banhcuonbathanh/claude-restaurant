# Lessons Learned — Documentation Architecture & Claude Workflow Guide
> v3.0 · April 2026 · Applies to all complex projects

---

## Part 0 — Claude Workflow

### 0.1 Core Philosophy: Claude as Senior Coworker

Claude is not a command tool — Claude is a teammate who reads specs, writes code, spots problems, and speaks up when needed. You make final decisions; Claude ensures you have enough information to decide correctly.

| Principle | What it means |
|---|---|
| Read first | Read spec + MASTER + migration before coding — never assume |
| Speak up | Flag bugs, risks, conflicts immediately — never stay silent |
| Be transparent | Explain WHY for every decision |
| Stay on target | Clarify DoD before coding — no "done but wrong direction" |

### 0.2 Standard Session Loop

| Step | You do | Claude does | Output |
|---|---|---|---|
| ① START | Type `/start [feature]` or describe task | Read relevant spec + MASTER, identify scope + gaps | Summary of understanding + clarifying questions |
| ② ALIGN | Answer questions, confirm DoD | Confirm understanding, break into sub-steps if large | Clear plan before code |
| ③ IMPLEMENT | Review sub-steps, approve plan | Code per sqlc-only/no-ECC rules, explain complex logic | Code + list of files to create/edit |
| ④ SELF-REVIEW | (wait) | Mental audit: happy path, error path, race condition, security, duplicate | 🚨 RISK if issue found |
| ⑤ REVIEW | Read code, test, give feedback | Address feedback, explain trade-offs if disagreeing | Finalized code |
| ⑥ HANDOFF | Type `/handoff` | Summarize what was done, update Current Work, list follow-up items | `/handoff` summary |

### 0.3 Prefix System — How Claude Signals Priority

Read the prefix first, then the content.

| Prefix | Level | When Claude uses it | You need to |
|---|---|---|---|
| 💡 SUGGESTION: | Info | Better pattern, optional improvement | Read, decide whether to apply |
| ⚠️ FLAG: | Warning | Doc conflict, ambiguous spec, potential drift | Must resolve before continuing |
| 🚨 RISK: | High | Latent bug, security hole, production risk, data loss potential | Stop, read carefully, decide approach |
| 🔴 STOP: | Critical | Will cause production bug if continued — Claude refuses to proceed | Must resolve immediately |
| ❓ CLARIFY: | Question | Needs more info to proceed, spec not clear enough | Answer to unblock Claude |
| 🔄 REDIRECT: | Change | Going in wrong direction — Claude proposes better direction | Evaluate and confirm new direction |

### 0.4 Common Situations

| Situation | Claude does | Claude does NOT do |
|---|---|---|
| Spec missing edge case | Ask: "Edge case X — how to handle?" before coding | Code then ask later |
| Found bug in old code | Flag 🚨 RISK immediately even if out of current scope | Pretend not to see it |
| Two docs conflict | Report ⚠️ FLAG + ask which is source of truth | Pick one doc silently |
| Task too large for one session | Break down + confirm scope before starting | Do half then stop mid-way |
| Code matches spec but has risk | Implement + flag 🚨 RISK clearly with explanation | Implement silently |
| Doesn't understand requirement | Ask immediately: "Do you mean X or Y?" (max 3 questions) | Guess and code |
| Knows a better way | 💡 SUGGESTION with clear trade-offs, let you decide | Override spec unilaterally |

### 0.5 Tips for Working Effectively with Claude

| ✅ DO (Effective) | ❌ AVOID (Ineffective) |
|---|---|
| Use `/start [feature]` to begin — Claude loads correct context | Paste code and say "fix this" with no context |
| Provide spec + business rules when asking about complex logic | Ask Claude to guess business rules without docs |
| Confirm DoD before Claude codes | Wait until Claude finishes to say "actually I wanted..." |
| When Claude flags ⚠️/🚨 — read carefully before overriding | Override flags without reading the reason |
| Use `/handoff` at end of session | Close session without handoff — next session loses context |
| Clear feedback: "This works but needs X added" | Vague feedback: "Not quite right" |
| Reference specific doc: "per Spec_4_Orders_API.docx..." | Ask vaguely without referencing a source |

---

## Part 1 — Root Cause: What Went Wrong

**Core problem:** Docs grew per feature, not per architecture. Each new spec re-copied what it needed instead of referencing the source. After 32 files, the same fact existed in 6+ places.

### 1.1 Dangerous Anti-Patterns

| Anti-Pattern | Example | Why Dangerous |
|---|---|---|
| Copy for "full context" | Each spec re-copied Order State Machine, color tokens, JWT config | When a rule changes, must update N places. Easy to miss one → silent inconsistency |
| One doc per layer | `dashboard.docx` (FE) and `Spec_12` (BE) are 2 separate files for same feature | Developer must read 2 files; ROI formula can differ between them |
| CLAUDE.md as dumping ground | CLAUDE.md grew to 300+ lines with both spec detail and business rules | Claude reads all of it every session → wastes tokens, dilutes attention |
| Spec = implementation guide | Spec files contained color hex, JWT expiry, error codes — unrelated to domain | Must cross-check 5 other files to verify consistency |
| Schema everywhere | DB columns declared in spec, CLAUDE_BE, and migration SQL | SQL file is the real DDL — other 2 are always stale after migration changes |

---

## Part 2 — Correct Architecture

### 2.1 Three-Tier File Hierarchy

```
project/
├── CLAUDE.md                  ← TIER 1: Rules + Pointers + Current Work ONLY
│     Max 150 lines. Read every session. NO spec detail, schema, color hex.
├── docs/
│   ├── MASTER.docx           ← TIER 2A: Shared facts (read when needed)
│   ├── API_CONTRACT.docx     ← TIER 2B: Endpoints only (table format, no prose)
│   ├── DB_SCHEMA.docx        ← TIER 2C: Schema overview + Redis keys
│   └── specs/
│       ├── 001_auth.docx     ← TIER 3: Domain specs (read when working on that domain)
│       ├── 002_products.docx     Each spec = BE + FE in one file
│       └── ...                   NO shared facts from MASTER
└── migrations/
    ├── 001_auth.sql          ← SINGLE SOURCE: Actual DDL
    └── ...                       Specs only reference, never repeat DDL
```

### 2.2 "One Fact, One Home" — Where Each Type of Info Lives

| Type of Info | Only Home | Everywhere Else |
|---|---|---|
| DB column definitions (DDL) | `migrations/*.sql` | Reference: "→ see 003_orders.sql" |
| Design tokens (color HEX, spacing) | `MASTER.docx §2` | Reference: "→ MASTER.docx §2" |
| RBAC roles + hierarchy | `MASTER.docx §3` | Reference, never copy |
| Business rules (order, payment) | `MASTER.docx §4` | Reference, never copy |
| WS/SSE reconnect config | `MASTER.docx §5` | Import module, never hardcode |
| JWT expiry, interceptor pattern | `MASTER.docx §6` | Reference, never copy |
| Error codes | `MASTER.docx §7` | Reference, never copy |
| API endpoints (table) | `API_CONTRACT.docx` | Specs reference section number |
| Domain-specific sqlc queries | `docs/specs/NNN_domain.docx` | Not repeated elsewhere |
| Current work / branch | `CLAUDE.md §Current Work` | Updated after every `/handoff` |

---

## Part 3 — Checklist Before Writing Any Doc

### 3.1 Before Creating a New File

| Question | YES → Do this | NO → Do this |
|---|---|---|
| Does this info already exist somewhere? | Write a reference, not the content | Find the correct "home" per the hierarchy |
| Will this file be read frequently? | Frequently → goes into MASTER.docx | One domain only → goes into specs/ |
| Does this file cover both BE and FE for one feature? | Write one file with two sections: ⚙️ BE and ⚛️ FE | OK — but check if it can be merged |
| Does the content change independently across domains? | YES + multiple domains → MASTER.docx | One domain only → into that domain's spec |

### 3.2 Before Adding Content to an Existing File

| Question | If YES → Action |
|---|---|
| Is this already in MASTER.docx? | Delete it — write a reference instead |
| Is this DDL (CREATE TABLE, column definition)? | Delete — keep only in migration SQL |
| Is this a design token (HEX color, spacing)? | Delete from spec — reference MASTER.docx §2 |
| Is this a business rule affecting multiple domains? | Move to MASTER.docx §4 |
| Does this file exceed 8 sections? | Split or review for duplicates |
| Does CLAUDE.md exceed 150 lines? | Extract content to MASTER.docx or relevant spec |

---

## Part 4 — Day 0 Setup Order for New Projects

> Spend 1 day on steps 1–3 before writing any code.

| Step | Action | Output | Time |
|---|---|---|---|
| 1 | Identify tech stack, roles, core business rules | Rough draft (notes/whiteboard) | 2–3h |
| 2 | Write MASTER.docx — 9 sections, complete from day 1 | MASTER.docx | 3–4h |
| 3 | Write lean CLAUDE.md (<150 lines) — pointers + rules + Current Work only | CLAUDE.md v1 | 30min |
| 4 | Write API_CONTRACT.docx — list all expected endpoints | API_CONTRACT.docx draft | 2–3h |
| 5 | Write migrations SQL (001–N) — this IS the DB design | migrations/*.sql | 2–4h |
| 6 | Write DB_SCHEMA.docx — overview + key design decisions | DB_SCHEMA.docx | 1h |

---

## Part 5 — Three Golden Rules

### Rule 1 — "One Fact, One Home"

```
❌ WRONG (Duplicate)
MASTER.docx:     "Cancel only when progress < 30%"
spec_004:        "Cancel only when progress < 30%"  ← DUPLICATE
API_CONTRACT:    "Cancel only when progress < 30%"  ← DUPLICATE

✅ RIGHT (Single Source)
MASTER.docx:     "Cancel only when progress < 30%"  ← SOURCE
spec_004:        "→ Cancel rule: MASTER.docx §4"     ← REFERENCE
API_CONTRACT:    "→ Business rules: MASTER.docx §4"  ← REFERENCE
```

### Rule 2 — "CLAUDE.md Is a Map, Not a Territory"

```
❌ WRONG (CLAUDE.md bloated)
## Business Rules
- Cancel order only when progress < 30%
- Payment only when status = ready
- Inventory deduct when item done
... 20 more lines ...

✅ RIGHT (CLAUDE.md lean)
## Business Rules
→ MASTER.docx §4 — always read before coding order/payment/inventory

Test: if CLAUDE.md > 150 lines → extract!
```

### Rule 3 — "Spec Owns What Is Unique"

```
❌ WRONG (spec contains shared facts)
# Spec 4 — Orders
## Design Tokens      ← already in MASTER
Primary: #FF7A1A
## RBAC               ← already in MASTER
## DB Schema          ← already in migration SQL

✅ RIGHT (spec contains only unique content)
# Spec 4 — Orders
> Shared facts → MASTER.docx. DDL → 003_orders.sql.
## Combo Expand Logic    ← UNIQUE to Orders
## sqlc Queries          ← UNIQUE to Orders
## State Transitions     ← UNIQUE to Orders
```

---

## Part 6 — Before vs After

| Aspect | Before (32-file mess) | After (structured) |
|---|---|---|
| Times one rule appears | 6–8 times across files | 1 time (MASTER.docx) + N references |
| Changing a business rule | Update 6+ files, easy to miss one | Update 1 place (MASTER.docx §4) |
| CLAUDE.md size | 300+ lines with spec content | <150 lines, pointers only |
| 1 feature = how many files | 2 files (FE spec + BE spec) | 1 file (BE+FE merged spec) |
| DB schema source | 3 sources: spec, CLAUDE_BE, migration SQL | 1 source: migration SQL |
| New developer onboarding | Must read 10+ files | Read MASTER.docx + domain spec |
| Token usage (Claude) | Claude reads lots of duplicate content | Claude reads only needed content |
| Maintenance overhead | High — small change needs updates in many files | Low — 1 fact, 1 update |
| Enforcement | Relies on discipline — breaks under deadline pressure | Automatic via `/audit` + pre-commit + PR checklist |
