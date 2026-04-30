| 📚  HỆ THỐNG QUẢN LÝ QUÁN BÁNH CUỐN
LESSONS LEARNED — Documentation Architecture & Claude Workflow Guide
Áp dụng cho mọi dự án phức tạp tương tự  ·  v3.0  ·  Tháng 4/2026 |
| --- |

# 🤝  Phần 0 — WORKFLOW: Claude Làm Việc Với Bạn Như Thế Nào
| Phần này là MỚI trong v3.0 — mô tả đầy đủ cách Claude hoạt động trong dự án BanhCuon để bạn không bị bất ngờ và có thể làm việc hiệu quả nhất với Claude. |
| --- |

## 🧠  0.1 — Triết Lý Cốt Lõi: Claude Là Senior Coworker
| Claude không phải công cụ gõ lệnh — Claude là đồng đội đọc spec, viết code, phát hiện vấn đề, và lên tiếng khi cần. Bạn quyết định cuối cùng, Claude đảm bảo bạn có đủ thông tin để quyết định đúng. |
| --- |

| 🔍  ĐỌC KỸ
Đọc spec + MASTER + migration trước khi code — không giả định | 🚨  LÊN TIẾNG
Flag bug, risk, conflict ngay lập tức — không im lặng làm | 🤝  MINH BẠCH
Giải thích why cho mọi quyết định — bạn luôn biết Claude đang làm gì | 🎯  ĐÚNG HƯỚNG
Clarify DoD trước khi code — không 'xong nhưng sai hướng' |
| --- | --- | --- | --- |

## 🔄  0.2 — Vòng Lặp Làm Việc Chuẩn (Standard Session Loop)
| Bước | Bạn Làm | Claude Làm | Output |
| --- | --- | --- | --- |
| ① START | Gõ /start [feature] hoặc mô tả task | Đọc spec + MASTER liên quan, xác định scope, phát hiện gap | Tóm tắt understanding + câu hỏi clarify (nếu có) |
| ② ALIGN | Trả lời câu hỏi clarify, confirm DoD | Confirm understanding, break task thành sub-steps nếu lớn | Plan rõ ràng trước khi code |
| ③ IMPLEMENT | Review sub-steps, approve plan | Code theo sqlc-only/no-ECC, kèm comment giải thích logic phức tạp | Code + file list cần tạo/sửa |
| ④ SELF-REVIEW | (chờ) | Mental audit: happy path, error path, race condition, security, duplicate | 🚨 RISK nếu phát hiện vấn đề |
| ⑤ REVIEW | Đọc code, test, feedback | Address feedback, giải thích trade-off nếu không đồng ý | Code hoàn thiện |
| ⑥ HANDOFF | Gõ /handoff | Tóm tắt đã làm, update Current Work, list follow-up items | /handoff summary + Section 7 updated |

## 📣  0.3 — Hệ Thống Prefix: Claude Báo Bạn Như Thế Nào
| Claude dùng prefix chuẩn hóa để bạn biết ngay mức độ quan trọng. Đọc prefix trước — rồi đọc nội dung. |
| --- |

| Prefix | Mức Độ | Claude Dùng Khi Nào | Bạn Cần Làm |
| --- | --- | --- | --- |
| 💡 SUGGESTION: | Info | Thấy cách tốt hơn, pattern hay hơn, optional improvement | Đọc, quyết định có apply không |
| ⚠️ FLAG: | Warning | Doc conflict, ambiguous spec, potential drift, cần attention | Phải xử lý trước khi tiếp tục |
| 🚨 RISK: | High | Bug tiềm ẩn, security hole, production risk, data loss potential | Dừng, đọc kỹ, quyết định approach |
| 🔴 STOP: | Critical | Sẽ gây bug production nếu tiếp tục — Claude từ chối làm tiếp | Phải giải quyết ngay mới tiếp tục |
| ❓ CLARIFY: | Question | Cần thêm thông tin để proceed, spec không đủ rõ | Trả lời để Claude unblock |
| 🔄 REDIRECT: | Change | Đang đi sai hướng — Claude đề xuất hướng khác tốt hơn | Evaluate và confirm hướng mới |

## 📋  0.4 — Các Tình Huống Thường Gặp & Cách Claude Xử Lý
| Tình Huống | Claude Làm | Claude KHÔNG Làm |
| --- | --- | --- |
| Spec thiếu edge case | Hỏi: 'Edge case X thì handle thế nào?' trước khi code | Code rồi mới hỏi sau |
| Tìm thấy bug trong code cũ | Flag 🚨 RISK ngay dù không trong scope task hiện tại | Giả vờ không thấy, làm tiếp |
| 2 docs mâu thuẫn nhau | Báo ⚠️ FLAG + hỏi doc nào là source of truth | Tự chọn 1 doc để follow |
| Task quá lớn cho 1 session | Break down + confirm scope trước khi bắt đầu | Làm một nửa rồi stop giữa chừng |
| Code đúng spec nhưng có risk | Implement + flag 🚨 RISK rõ ràng, giải thích why | Im lặng implement |
| Không hiểu requirement | Hỏi ngay: 'Ý bạn là X hay Y?' (max 3 câu) | Đoán mò rồi code |
| Biết cách tốt hơn | 💡 SUGGESTION với trade-off rõ ràng, để bạn quyết | Tự ý làm khác với spec |
| Review code của bạn | Honest feedback — không chỉ khen, chỉ rõ risk + suggest fix | Rubber stamp mọi thứ |
| Deadline gấp | Prioritize, flag ⚠️ những gì bỏ qua để fix sau | Cut corners im lặng |

## ⚠️  0.6 — Known Weaknesses in This System (Added 2026-04-30)

These are structural gaps identified after a full audit of the workflow. Each has a mitigation.

### Weakness 1 — Duplicate Phase State
**Problem:** Phase status lives in both `CLAUDE.md` and `docs/TASKS.md`. They will drift.
**Mitigation:** `TASKS.md` is the single source of truth. `CLAUDE.md` Phase Status table is a quick-glance summary only — always update `TASKS.md` first. When the two disagree, `TASKS.md` wins.

### Weakness 2 — No Automated Enforcement
**Problem:** Every rule (no business logic in handlers, no localStorage, HMAC first, soft-delete filters) is a text instruction to Claude. If Claude misses something in the Step 5 self-review, nothing catches it automatically.
**Mitigation (short term):** The self-review checklist in Step 5 is the only backstop — treat it as mandatory, not optional. Flag any checklist miss as 🚨 RISK.
**Mitigation (long term):** Add linters/CI checks for the highest-risk rules when Phase 4 starts:
  - `grep -r "localStorage" fe/src/` → fail if found
  - `go vet ./...` + a custom linter rule for gin imports in service layer
  - pre-commit hook: `wc -l CLAUDE.md` → fail if > 150 lines

### Weakness 3 — Document Staleness with No Signal
**Problem:** Layer 2 and Layer 3 docs have no "last verified" date. Claude reads them as authoritative even if they predate significant code changes.
**Mitigation:** Add a `> Last verified: YYYY-MM-DD` line at the top of each Layer 2 and Layer 3 document. At the end of each phase, run a reconciliation pass:
  - Open each spec → confirm it still matches the API contract and schema
  - If it does not → update the spec OR raise ⚠️ FLAG before starting work in that domain

### Weakness 4 — Uneven Task Granularity
**Problem:** TASKS.md mixes 20-minute tasks (pubsub.go wrappers) with 3-hour tasks (full auth service). This makes session planning unreliable and increases the chance of leaving a task half-done.
**Mitigation:** When a task in TASKS.md looks like it will take more than 90 minutes in a single session, break it into sub-tasks before starting. The signal: any task with 3+ distinct files to create, or any task that crosses two service layers. Flag with ❓ CLARIFY to confirm the breakdown before coding.

### Weakness 5 — Navigation-only index files cause multi-file context switching
**Problem:** BE_DOC_INDEX.md and FE_DOC_INDEX.md pointed to the right files but contained no actual content. Every session required opening 4–6 different files just to get context before writing a single line of code. This increased the chance of missing a critical rule.
**Resolution (2026-04-30):** Created `docs/be/BE_SYSTEM_GUIDE.md` and `docs/fe/FE_SYSTEM_GUIDE.md` — comprehensive system guides that consolidate: epic breakdown · all critical rules · code patterns · DI skeleton · error codes · per-domain reading list. Each guide is the single entry point for its side. Spec files are still the source of domain-specific detail, but the guide tells you exactly which spec to read and when.

---

## 💡  0.5 — Tips Để Làm Việc Hiệu Quả Nhất Với Claude
|  | ✅  LÀM THẾ NÀY (Hiệu Quả) | ❌  TRÁNH (Kém Hiệu Quả) |
| --- | --- | --- |
| 1 | Dùng /start [feature] khi bắt đầu task mới — Claude đọc đúng context | Paste code và hỏi 'fix cái này đi' không có context |
| 2 | Cung cấp spec + business rule khi hỏi về logic phức tạp | Hỏi Claude đoán business rule không có tài liệu |
| 3 | Confirm DoD (Definition of Done) trước khi Claude code | Đợi Claude code xong mới nói 'thực ra tôi muốn...' |
| 4 | Khi Claude flag ⚠️/🚨 — đọc kỹ trước khi override | Override flag mà không đọc reason |
| 5 | Dùng /handoff cuối session — đừng để context bị mất | Đóng session mà không handoff — session sau mất context |
| 6 | Feedback rõ ràng: 'Code này chạy được nhưng cần thêm X' | Feedback mơ hồ: 'Không đúng lắm' |
| 7 | Reference spec/doc cụ thể khi hỏi: 'theo spec NNN_orders.docx...' | Hỏi chung chung không reference nguồn |

# 🔴  Phần 1 — Những Gì Đã Xảy Ra (Root Cause)
| Vấn đề cốt lõi: Tài liệu phát triển theo feature, không theo kiến trúc. Mỗi spec mới copy những gì nó cần thay vì reference source gốc. Sau 32 files, cùng 1 fact tồn tại ở 6+ nơi khác nhau. |
| --- |

## 📅  1.1 — Timeline Của Vấn Đề
| Giai Đoạn | Quyết Định | Hậu Quả |
| --- | --- | --- |
| Khởi đầu dự án | Tạo CLAUDE.md với đầy đủ tech stack, roles, business rules, design tokens | OK lúc đầu — 1 file, dễ quản lý |
| Viết spec 1–5 | Mỗi spec tự khai báo lại DB schema, roles, error codes để 'đầy đủ context' | Bắt đầu drift — spec 3 và spec 5 có khác nhau nhỏ về role hierarchy |
| Thêm Phase 2 vào CLAUDE_BE | Copy business rules từ CLAUDE.md vào CLAUDE_BE 'để tiện' | Giờ có 2 sources — khi update 1 chỗ, chỗ kia stale |
| Tạo docs/specs/ riêng | inventory.docx, dashboard.docx, staff.docx viết lại schema + rules + API | 3 layers cho cùng 1 domain: CLAUDE_BE + API_CONTRACT + spec file |
| Phase 2 specs (17, 18) | FE spec và BE spec viết riêng, cả 2 lại có ROI formula, DB schema, color tokens | 32 files, ~60% nội dung là duplicate của nhau |
| Refactor session | Phát hiện vấn đề, tạo MASTER.docx + restructure toàn bộ | Mất nhiều thời gian hơn nếu làm đúng từ đầu |

## ⚠️  1.2 — Pattern Nguy Hiểm Đã Lặp Lại
| Anti-Pattern | Ví Dụ Cụ Thể | Tại Sao Nguy Hiểm |
| --- | --- | --- |
| Copy để đầy đủ context | Mỗi spec copy lại Order State Machine, color tokens, JWT config | Khi rule thay đổi, phải update N chỗ. Dễ quên 1 chỗ → silent inconsistency |
| 1 doc per layer | dashboard.docx (FE) và Spec_12 (BE) là 2 file riêng cho cùng 1 feature | Developer phải đọc 2 file, ROI formula khác nhau giữa 2 file |
| CLAUDE.md là nơi chứa mọi thứ | CLAUDE.md phình lên 300+ dòng với cả spec detail lẫn business rules | Claude đọc toàn bộ mỗi session → tốn token, attention bị loãng |
| Spec = implementation guide | Spec files chứa cả color hex, JWT expiry, error codes — không liên quan domain | Spec phải đọc thêm 5 files khác để verify consistency |
| Schema ở khắp nơi | DB table columns khai báo trong spec, trong CLAUDE_BE, trong migration SQL | SQL file là DDL thật — 2 chỗ còn lại luôn lỗi thời sau migration thay đổi |

# ✅  Phần 2 — Kiến Trúc Đúng Từ Đầu
| Nếu được làm lại từ đầu, đây là cấu trúc file tối ưu. Mỗi loại thông tin có đúng 1 nhà — không ở đâu khác. |
| --- |

## 🏗️  2.1 — File Hierarchy (3 Tầng Rõ Ràng)
| project/
├── CLAUDE.md                  ← TẦNG 1: Rules + Pointers + Current Work ONLY
│     Max 150 dòng. Claude đọc mỗi session. KHÔNG chứa: spec, schema, color hex
├── docs/
│   ├── MASTER.docx           ← TẦNG 2A: Shared facts (đọc khi cần)
│   ├── API_CONTRACT.docx     ← TẦNG 2B: Endpoints only (bảng, không prose)
│   ├── DB_SCHEMA.docx        ← TẦNG 2C: Schema overview + Redis keys
│   └── specs/
│       ├── 001_auth.docx     ← TẦNG 3: Domain specs (đọc khi làm domain đó)
│       ├── 002_products.docx     Mỗi spec = BE + FE trong 1 file
│       └── ...                   KHÔNG chứa: shared facts từ MASTER
└── migrations/
    ├── 001_auth.sql          ← SINGLE SOURCE: DDL thực tế
    └── ...                       Specs chỉ reference, không repeat DDL |
| --- |

## 🏠  2.2 — Quy Tắc "Nhà Của Từng Loại Thông Tin"
| Loại Thông Tin | Nhà Duy Nhất | Mọi Nơi Khác |
| --- | --- | --- |
| DB column definitions (DDL) | migrations/*.sql | Reference: '→ xem 003_orders.sql' |
| Design tokens (màu HEX, spacing) | MASTER.docx §2 | Reference: '→ MASTER.docx §2' |
| RBAC roles, hierarchy | MASTER.docx §3 | Reference không copy |
| Business rules (order, payment) | MASTER.docx §4 | Reference không copy |
| WS/SSE reconnect config | MASTER.docx §5 + src/config/realtime.ts | Import module, không hardcode |
| JWT expiry, interceptor pattern | MASTER.docx §6 | Reference không copy |
| Error codes | MASTER.docx §7 | Reference không copy |
| API endpoints (bảng) | API_CONTRACT.docx | Specs reference section số |
| Domain-specific sqlc queries | docs/specs/NNN_domain.docx | Không repeat ở nơi khác |
| BE implementation guide (epics · patterns · rules) | docs/be/BE_SYSTEM_GUIDE.md | Reference từ CLAUDE.md — không copy content |
| FE implementation guide (epics · patterns · rules) | docs/fe/FE_SYSTEM_GUIDE.md | Reference từ CLAUDE.md — không copy content |
| Current work / branch | CLAUDE.md §Current Work | Update sau mỗi /handoff |

# ✅  Phần 3 — Checklist Trước Khi Viết Bất Kỳ Doc Nào
| ⚠️  Dùng checklist này mỗi khi sắp tạo file mới hoặc thêm nội dung vào file hiện có. |
| --- |

## 📝  3.1 — Trước Khi Tạo File Mới
| Câu Hỏi | YES → Làm Gì | NO → Làm Gì |
| --- | --- | --- |
| Thông tin này đã tồn tại ở đâu đó chưa? | Viết reference, không viết lại nội dung | Tìm đúng 'nhà' cho nó theo hierarchy |
| File này sẽ được đọc thường xuyên? | Thường xuyên → vào MASTER.docx | Chỉ 1 domain → vào specs/ |
| File này có cả BE lẫn FE cho 1 feature? | Viết 1 file với 2 sections: ⚙️ BE và ⚛️ FE | OK — nhưng check có thể merge không |
| Nội dung thay đổi độc lập với domain? | YES + nhiều domain → vào MASTER.docx | Chỉ 1 domain → vào spec của domain đó |

## 📝  3.2 — Trước Khi Thêm Nội Dung Vào File
| Câu Hỏi | Nếu YES → Làm |
| --- | --- |
| Nội dung này đã có trong MASTER.docx không? | Xóa — viết reference thay |
| Đây có phải là DDL (CREATE TABLE, column def)? | Xóa — chỉ để trong migration SQL |
| Đây có phải design token (HEX color, spacing)? | Xóa khỏi spec — reference MASTER.docx §2 |
| Đây có phải business rule ảnh hưởng nhiều domain? | Move sang MASTER.docx §4 |
| File này đang vượt quá 8 sections? | Split hoặc review xem có duplicate không |
| CLAUDE.md đang vượt quá 150 dòng? | Extract content sang MASTER.docx hoặc spec tương ứng |

## ⚙️  3.3 — Enforcement: Ai Đảm Bảo Rules Được Tuân Thủ?
| Checkpoint | Tool / Command |
| --- | --- |
| /audit command | Check: sec.sh patterns, go build, .env tracking + duplicate scan |
| CLAUDE.md line count check | scripts/audit.sh: wc -l CLAUDE.md → FAIL nếu > 150 dòng |
| Duplicate scan tự động | scripts/audit.sh: script detect content xuất hiện > 1 lần |
| Pre-commit hook | git hook kiểm tra CLAUDE.md size trước mỗi commit |
| PR checklist | Khi tạo PR: 'Có nội dung xuất hiện ở > 1 file không? → duplicate, cần refactor' |

# 🚀  Phần 4 — Workflow Khởi Động Dự Án Mới
| Thứ tự này tránh được phần lớn vấn đề duplicate. Dành 1 ngày cho bước 1–3 trước khi viết bất kỳ dòng code nào. |
| --- |

## 📅  4.1 — Day 0: Setup Architecture Docs
| Bước | Làm Gì | Output | Thời Gian |
| --- | --- | --- | --- |
| 1 | Xác định tech stack, roles, business rules cốt lõi | Nháp tay hoặc Notion | 2–3 giờ |
| 2 | Viết MASTER.docx từ nháp — 9 sections, đầy đủ ngay từ đầu | MASTER.docx hoàn chỉnh | 3–4 giờ |
| 3 | Viết CLAUDE.md lean (<150 dòng) — chỉ pointers + rules + Current Work | CLAUDE.md v1 | 30 phút |
| 4 | Viết API_CONTRACT.docx — list tất cả endpoints dự kiến | API_CONTRACT.docx draft | 2–3 giờ |
| 5 | Viết migrations SQL (001–N) — đây là design DB thực sự | migrations/*.sql | 2–4 giờ |
| 6 | Viết DB_SCHEMA.docx — overview + key design decisions | DB_SCHEMA.docx | 1 giờ |

## 🔍  4.2 — Sau Mỗi Major Refactor hoặc Phase Kết Thúc
| Action | Tool / Command | Mục Đích |
| --- | --- | --- |
| Chạy duplicate scan | /audit (với checks mới từ §3.3) | Tìm content xuất hiện > 1 lần |
| Kiểm tra CLAUDE.md size | wc -l CLAUDE.md → phải < 150 | Đảm bảo không phình |
| Verify MASTER.docx coverage | Đọc 1 spec → check mọi shared fact đều có reference | Không có orphan facts |
| Update API_CONTRACT.docx | Mỗi endpoint mới phải thêm vào ngay | Contract luôn sync với code |
| Tag migration với feature name | goose: 003_orders_add_combo_ref.sql | Dễ trace schema change |

# 🏆  Phần 5 — Quy Tắc Vàng (3 Rules Để Nhớ)
| Nếu chỉ nhớ được 3 thứ từ tài liệu này, nhớ 3 điều này. |
| --- |

## 1️⃣  Rule 1 — "One Fact, One Home"
| ❌  WRONG (Duplicate)
MASTER.docx: 'Cancel chỉ khi progress < 30%'
spec_004:    'Cancel chỉ khi progress < 30%' ← DUPLICATE
API_CONTRACT: 'Cancel chỉ khi progress < 30%' ← DUPLICATE | ✅  RIGHT (Single Source)
MASTER.docx: 'Cancel chỉ khi progress < 30%' ← SOURCE
spec_004:    '→ Cancel rule: MASTER.docx §4' ← REFERENCE
API_CONTRACT: '→ Business rules: MASTER.docx §4' ← REF |
| --- | --- |

## 2️⃣  Rule 2 — "CLAUDE.md Is a Map, Not a Territory"
| ❌  WRONG (CLAUDE.md phình)
## Business Rules
- Cancel order chỉ khi progress < 30%
- Payment chỉ tạo khi status = ready
- Inventory deduct khi item done
... 20 dòng nữa ... | ✅  RIGHT (CLAUDE.md gọn)
## Business Rules
→ MASTER.docx §4 — LUÔN đọc trước khi code
order/payment/inventory

Test: nếu CLAUDE.md > 150 dòng → extract! |
| --- | --- |

## 3️⃣  Rule 3 — "Spec Owns What Is Unique"
| ❌  WRONG (spec chứa shared facts)
# Spec 4 — Orders
## Design Tokens  ← đã có trong MASTER
Primary: #FF7A1A
## RBAC  ← đã có trong MASTER
## DB Schema  ← đã có trong migration SQL | ✅  RIGHT (spec chứa unique content)
# Spec 4 — Orders
> Shared facts → MASTER.docx. DDL → 003_orders.sql.
## Combo Expand Logic  ← UNIQUE to Orders
## sqlc Queries        ← UNIQUE to Orders
## State Transitions   ← UNIQUE to Orders |
| --- | --- |

# 📊  Phần 6 — Summary: Before vs After
| Aspect | Before (32 files mess) | After (structured) |
| --- | --- | --- |
| Số lần 1 rule xuất hiện | 6–8 lần (CLAUDE_BE, API, spec, FE, BE, overview…) | 1 lần (MASTER.docx) + N references |
| Khi thay đổi business rule | Update 6+ files, dễ quên 1 chỗ | Update 1 chỗ (MASTER.docx §4) |
| CLAUDE.md size | 300+ dòng với spec content | <150 dòng, pointers only |
| 1 feature = mấy files | 2 files (FE spec + BE spec) + sections trong CLAUDE_BE | 1 file (BE+FE merged spec) |
| DB schema source | 3 sources: spec, CLAUDE_BE, migration SQL | 1 source: migration SQL (spec references) |
| New developer onboarding | Phải đọc 10+ files để hiểu system | Đọc MASTER.docx + spec của domain cần làm |
| Token usage (Claude) | Claude đọc nhiều duplicate content mỗi session | Claude đọc đúng content cần thiết |
| Maintenance overhead | Cao — mỗi thay đổi nhỏ cần update nhiều files | Thấp — 1 fact, 1 update |
| Enforcement | Chỉ dựa vào ý thức — dễ bị phá vỡ khi deadline | Tự động qua /audit + pre-commit + PR checklist |
| Claude workflow clarity | Không rõ Claude làm gì mỗi bước | Prefix hệ thống + Standard Session Loop rõ ràng |

| 🍜  BanhCuon System · LESSONS_LEARNED.docx · v3.0 · Updated with Claude Workflow Guide · Tháng 4/2026 |
| --- |
