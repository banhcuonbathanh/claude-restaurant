---
tags: [fe, page/admin]
---

# FE — Admin Staff & Training

Admin pages for people management and internal work tracking.

## Pages (`fe/src/app/(dashboard)/admin/`)

| Page | Route | BE |
|---|---|---|
| Staff CRUD | `admin/staff/` | [[BE - Staff]] |
| Task board | `admin/staff/task-board/` | [[BE - Tasks & Todo]] |
| Todo list | `admin/todo-list/` | [[BE - Tasks & Todo]] (hook `useTodoTasks.ts`) |
| Training | `admin/training/` | [[BE - Training]] (hook `useTrainingQueries.ts`, store `trainingStore.ts`) |

## Rules

- Role hierarchy for who can manage whom → [[Concept - RBAC]]

## Spec

- `docs/spec/Spec_7_Staff_Management.md` + `Spec_9_Admin_Dashboard_Pages.md` → [[Docs - Specs]]
