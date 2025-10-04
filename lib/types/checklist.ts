// Pre-market checklist types

export interface ChecklistItem {
  id: string
  name: string
  category: "config" | "connectivity" | "risk" | "system" | "feeds"
  status: "pending" | "running" | "passed" | "failed" | "warning"
  duration?: number
  message?: string
  details?: string
  timestamp?: string
}

export interface ChecklistRun {
  id: string
  startTime: string
  endTime?: string
  duration?: number
  status: "running" | "completed" | "failed"
  totalChecks: number
  passedChecks: number
  failedChecks: number
  warningChecks: number
  items: ChecklistItem[]
}

export interface SystemCheck {
  diskSpace: {
    available: number
    total: number
    percentage: number
  }
  memory: {
    available: number
    total: number
    percentage: number
  }
  clockSkew: number
  cpuUsage: number
}
