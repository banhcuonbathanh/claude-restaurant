export type TaskStatus   = 'pending' | 'in_progress' | 'completed' | 'overdue'
export type TaskPriority = 'high' | 'medium' | 'low'
export type StaffRole    = 'kitchen' | 'cashier' | 'server' | 'manager' | 'admin' | 'chef' | 'staff'

export interface Task {
  id:           string
  staffId:      string
  name:         string
  description?: string
  priority:     TaskPriority
  dueDate:      string        // "YYYY-MM-DD"
  dueTimeStart: string        // "HH:mm" (may be empty)
  dueTimeEnd:   string        // "HH:mm" (may be empty)
  status:       TaskStatus
  notes?:       string
  createdAt:    string
  updatedAt:    string
}

export interface DailyTaskMetrics {
  date:            string
  totalTasks:      number
  completedTasks:  number
  inProgressTasks: number
  overdueTasks:    number
}

export interface StaffTaskStat {
  staffId:        string
  staffName:      string
  role:           string
  assignedCount:  number
  completedCount: number
  completionRate: number   // 0–100
  qualityScore:   number   // 0–5.0
  hasOverdue:     boolean
}

export interface StaffTaskStatsResponse {
  metrics:    DailyTaskMetrics
  staffStats: StaffTaskStat[]
}

export interface TaskBoardFilters {
  date:   string              // "YYYY-MM-DD"
  role:   string              // 'all' | StaffRole
  status: string              // 'all' | TaskStatus
  search: string
}

export interface CreateTaskPayload {
  staffId:       string
  name:          string
  description?:  string
  priority:      TaskPriority
  dueDateTime:   string       // ISO 8601
  dueTimeStart?: string
  dueTimeEnd?:   string
  notes?:        string
}

// ── Legacy types (used by todo-list page — kept for compatibility) ──────────

export interface TodoTaskFilter {
  assigned_to?: string
  start_date?:  string
  end_date?:    string
  status?:      'all' | TaskStatus
  page?:        number
}

export interface StaffOption {
  id:   string
  name: string
}

export interface UpdateTaskPayload {
  name?:        string
  description?: string
  staffId?:     string
  dueDateTime?: string
}
