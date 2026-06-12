# Admin To-Do List — `/admin/todo-list`

> **TL;DR:** ✅ implemented · manager+ · "Công việc" — team task management: header, filter bar,
> task cards/table with status badges, create/edit modal with staff assignment. Page is a thin
> wrapper (`TodoPageClient` does everything) using `useTodoTasks` / `useTaskStats` /
> `useCreateTask` hooks.

---

## ASCII Wireframe

```
┌──────────────────────────────────────────────────────────────────┐
│ (admin shell: tab nav)                                           │
├──────────────────────────────────────────────────────────────────┤
│ Công việc                                  [+ Thêm công việc]    │ ← TodoPageHeader
├──────────────────────────────────────────────────────────────────┤
│ [Tất cả][Chờ làm][Đang làm][Hoàn thành]  [Ngày ▾] [Người ▾]      │ ← TodoFilterBar
├──────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────────────┐ │ ← TodoTaskTable /
│ │ Công việc            Giao cho    Hạn      Trạng thái    HĐ   │ │   TodoTaskCard
│ │ Vệ sinh khu bếp      chef01      17:00    [đang làm]  [✎][🗑]│ │
│ │ Kiểm kê nguyên liệu  cash02      21:00    [chờ làm]   [✎][🗑]│ │
│ │ Đặt hàng bột gạo     manager     12/06    [hoàn thành][✎][🗑]│ │
│ └──────────────────────────────────────────────────────────────┘ │
│  (loading: TodoPageSkeleton)                                     │
└──────────────────────────────────────────────────────────────────┘
  Overlay: CreateEditTaskModal — tiêu đề, mô tả, giao cho ▾ (staff list),
           hạn, trạng thái  [Lưu][Huỷ]
```

## Zones

| Zone | Component | Data source |
|---|---|---|
| Header | `todo-list/components/TodoPageHeader` | task stats (`useTaskStats`) |
| Filters | `todo-list/components/TodoFilterBar` | local `TodoTaskFilter` state |
| Table / cards | `todo-list/components/TodoTaskTable` / `TodoTaskCard` + `components/shared/TaskStatusBadge` | `useTodoTasks(filter)` |
| Modal | `todo-list/components/CreateEditTaskModal` | `useCreateTask`; staff dropdown via `listStaff` |
| Skeleton | `todo-list/components/TodoPageSkeleton` | loading state |

## Key Interactions

- **+ Thêm công việc** → modal with staff assignment dropdown → create mutation.
- Filter tabs by status; date/assignee dropdowns narrow the list.
- Row **✎** → modal in edit mode (status changes included) · **🗑** → confirm + delete.
- Per-staff drill-down lives on [`/admin/staff/task-board`](admin_task_board.md).

## Business Logic Used

- Task status set + badge colours → [../07_business_logic/LOGIC_FE.md](../07_business_logic/LOGIC_FE.md) (task hooks, status badge)
- Assignment limited to active staff accounts → [../02_spec/BUSINESS_RULES.md §1 RBAC](../02_spec/BUSINESS_RULES.md#1-rbac-role-hierarchy)
