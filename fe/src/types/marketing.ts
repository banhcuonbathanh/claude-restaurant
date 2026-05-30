export interface MarketingSpendItem {
  id: string
  icon: string
  name: string
  sub_items: string[]
  budget: number
  spent: number
  remaining: number
  progress_pct: number
  color: string
}

export interface MarketingBudgetSummary {
  total_budget: number
  total_spent: number
  total_remaining: number
  spent_pct: number
  roi: number
  roi_base: string
}

export interface MarketingLoveScore {
  cost_per_new_customer: number
  target_customers: number
  current_customers: number
  target_followers: number
  current_followers: number
  follower_progress_pct: number
  satisfaction_score: number
  satisfaction_max: number
}

export interface MarketingSpendResponse {
  date_range: { from: string; to: string }
  summary: MarketingBudgetSummary
  items: MarketingSpendItem[]
  love_score: MarketingLoveScore
}

export interface DateRange {
  from: string
  to: string
}

export interface CampaignMilestone {
  id: string
  label: string
  activities: string[]
  isKeyEvent: boolean
  color: string
}
