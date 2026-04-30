export const Role = {
  CUSTOMER: 1,
  CHEF:     2,
  CASHIER:  3,
  MANAGER:  4,
  ADMIN:    5,
} as const

export type RoleValue = typeof Role[keyof typeof Role]

export interface User {
  id:         string
  username:   string
  full_name:  string
  role:       'customer' | 'chef' | 'cashier' | 'manager' | 'admin'
  is_active:  boolean
}
