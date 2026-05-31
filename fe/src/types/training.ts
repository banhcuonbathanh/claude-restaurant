export type StaffRole = 'chef' | 'cashier' | 'staff' | 'manager'

export interface JobGuide {
  id: string
  title: string
  role: StaffRole
  description: string
  coverImageUrl: string
  youtubeUrl: string
  qualityKpiTarget: string
  quantityKpiTarget: string
  passThreshold: number
  maxAttempts: number
  responsibleRoles: StaffRole[]
  published: boolean
  createdAt: string
  updatedAt: string
}

export type TrainingStatus = 'Completed' | 'In Progress' | 'Not Started'

export interface StaffProgressRow {
  id: string
  guideId: string
  staffId: string
  staffName: string
  staffRole: StaffRole
  watchedPercent: number
  quizPassed: boolean | null
  lastActivity: string
}

export interface QuizAttempt {
  attemptNumber: number
  date: string
  score: number
  passed: boolean
}

export interface StaffProgressDetail {
  staffId: string
  guideId: string
  guideName: string
  watchedPercent: number
  passThreshold: number
  maxAttempts: number
  attemptsRemaining: number
  managerNotes: string
  quizAttempts: QuizAttempt[]
  createdAt: string
  updatedAt: string
}

export interface GuideProgressPage {
  data: StaffProgressRow[]
  total: number
  page: number
  pageSize: number
}

export interface CreateGuideInput {
  title: string
  role: StaffRole
  description?: string
  coverImageUrl?: string
  youtubeUrl?: string
  qualityKpiTarget?: string
  quantityKpiTarget?: string
  passThreshold?: number
  maxAttempts?: number
  published?: boolean
  responsibleRoles?: StaffRole[]
}
