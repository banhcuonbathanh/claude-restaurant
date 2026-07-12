---
tags: [be, domain/staff]
---

# BE — Tasks & Todo

Staff task board + admin todo list backend.

## Code chain

`be/internal/handler/task_handler.go` → `be/internal/service/task_service.go` → `be/internal/repository/task_repo.go`

## Consumers

- [[FE - Admin Staff & Training]] — task board (`admin/staff/task-board/`) + todo list (`admin/todo-list/`)
- FE hook: `fe/src/hooks/useTodoTasks.ts`

## Related

- [[BE - Staff]] — task assignment targets staff members
