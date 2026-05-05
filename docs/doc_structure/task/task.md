Where tasks come from: the chain

BRD (business need)
  → SRS/FSD (functional detail + business rules)
    → Spec files 1-9 (domain-specific implementation specs)
      → Task rows in TASKS.md
docs/qui_trinh/ is the source. docs/spec/ is what I actually read. The task row is the smallest unit of work derived from a spec section.

What makes a task
A task row is created when a spec section defines a distinct, completable unit of work. The signal:

BE: one handler/endpoint group, one service method, one repository layer, or one sqlc query set → one task
FE: one component, one page, one API function group → one task (from wireframe decomposition)
DevOps: one infra concern (compose service, Caddyfile block, CI job) → one task
A task is NOT ready to start if any of these are missing:

Field	BE	FE
ID	✅ required	✅ required
Domain	✅ required	✅ required
Task description	✅ required	✅ required
Dependencies (all ✅)	✅ required	✅ required
spec_ref	optional but strong preference	REQUIRED
draw_ref	not applicable	REQUIRED
BE task creation procedure
Read the spec section (e.g. Spec_4_Orders_API.md §3 — Create Order)
Identify the vertical slice: handler + service method + repository queries needed
Check what DB queries exist vs need to be written (query/*.sql)
Check what dependencies must be ✅ first (e.g. auth middleware before order handler)
Write one task row per distinct implementation concern:
4-1 BE Create order handler + service + repository
4-2 BE GetOrdersByTable query + repository
These are separate because one can be verified independently
FE task creation procedure (Step 0 — mandatory before any task rows)
The FE flow is stricter because without a wireframe you discover the layout mid-code:


Step 0a: Read the spec section end-to-end
         → mark every screen, component, data source, interaction mentioned

Step 0b: Draw the wireframe
         → label every zone [ComponentName]
         → note the data source for each zone
         → note interactions (button → which API call)
         Example:
         ┌──────────────────────┬─────────────────────┐
         │ [OrderList]          │ [PrepPanel]          │
         │ GET /orders/live     │ computed from        │
         │ SSE stream           │ OrderList data       │
         └──────────────────────┴─────────────────────┘

Step 0c: Decompose the wireframe into task rows
         Order: shared components first → API layer → page-specific → page assembly
         Each row gets:
           spec_ref = exact spec section  (e.g. Spec_9 §3.2)
           draw_ref = wireframe file + zone  (e.g. wireframes/overview.md zone-B)

Step 0d: Align the wireframe with the user before writing code
Only after 0a-0d are done do you write the task rows into TASKS.md.

The constraint that shapes task size
Tasks should be completable in one session. The size signal is whether the task can be independently verified:

Can you run go build ./... and prove this specific task works? → good boundary
Can you render this component in isolation and verify it? → good boundary
If the answer is "only works when 3 other tasks are also done" → the task is too large, split it
The practical heuristic from the docs: 20-minute tasks (a single sqlc query wrapper) and 3-hour tasks (full auth service) should not both be called "one task" — the former is a sub-task of the latter.

What a task row must trace back to
Every task should be traceable to a spec section. If you cannot fill spec_ref for a FE task, it means one of two things:

The spec is missing a section → ❓ CLARIFY before writing the task
You are inventing scope that was not specified → stop, check with the user
This traceability is the only thing that prevents "task done but built the wrong thing" — which is the most expensive failure mode.