export type StaffRole = 'chef' | 'cashier' | 'staff' | 'manager' | 'admin'
export type StaffStatus = 'active' | 'inactive'
export type ShiftSlot = 'sang' | 'chieu' | 'toi'

export interface Staff {
  id:               string
  username:         string
  full_name:        string
  role:             StaffRole
  job_title:        string
  shifts:           ShiftSlot[]
  responsibilities: string
  phone:            string | null
  email:            string | null
  is_active:        boolean
  performance_score: number
  created_at:       string
  updated_at?:      string
}

export interface StaffStats {
  total:   number
  active:  number
  inactive: number
  byRole:  Record<StaffRole, number>
}

export interface StaffListResponse {
  data: Staff[]
  meta: { page: number; limit: number; total: number }
}
