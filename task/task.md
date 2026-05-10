Step 1 — Install sqlc (5 min)

# macOS
brew install sqlc

# verify
sqlc version
Step 2 — Run sqlc generate (P3-1)

cd /Users/monghoaivu/Desktop/code/claude\ restaurant/be
sqlc generate
This creates be/internal/db/ with all Go models + query functions from your query/*.sql files. Everything in Phase 4 depends on this output.

After it runs, verify the generated structs use correct field names (P3-2):


grep -r "BasePrice\|ImageUrl\|StaffId\|WebhookPayload" be/internal/db/
# should return nothing — if it returns anything, those are wrong names
Step 3 — Start Phase 4.1 Auth (first backend task)
Once be/internal/db/ is populated, you're ready to code. The first task is 4.1-1 in docs/TASKS.md:


4.1-1 → be/pkg/redis/pubsub.go
4.1-2 → be/pkg/redis/bloom.go
4.1-3 → be/internal/repository/auth_repo.go
4.1-4 → be/internal/service/auth_service.go
4.1-5 → complete be/internal/middleware/auth.go
4.1-6 → be/internal/handler/auth_handler.go
Before writing any of those, follow the workflow:

Read docs/spec/Spec1_Auth_Updated_v2.md + docs/core/MASTER_v1.2.md §3, §6 + docs/contract/ERROR_CONTRACT_v1.1.md
Write a plan, confirm with yourself (or ask here)
Then implement
TL;DR: Run brew install sqlc → sqlc generate → start task 4.1-1. That one install unblocks the entire backend.

