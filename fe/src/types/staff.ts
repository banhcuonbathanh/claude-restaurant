export type StaffRole = 'chef' | 'cashier' | 'staff' | 'manager' | 'admin'

export interface Staff {
  id:         string
  username:   string
  full_name:  string
  role:       StaffRole
  phone:      string | null
  email:      string | null
  is_active:  boolean
  created_at: string
  updated_at?: string
}

export interface StaffListResponse {
  data: Staff[]
  meta: { page: number; limit: number; total: number }
}
