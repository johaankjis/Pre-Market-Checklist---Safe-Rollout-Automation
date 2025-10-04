// Feature flag types

export interface FeatureFlag {
  id: string
  name: string
  key: string
  description: string
  enabled: boolean
  environments: {
    production: boolean
    staging: boolean
    development: boolean
  }
  rolloutPercentage: number
  createdAt: string
  updatedAt: string
  tags: string[]
}

export interface FeatureFlagRule {
  id: string
  flagId: string
  type: "user" | "environment" | "percentage" | "custom"
  condition: string
  value: boolean
}

export interface CIConfig {
  id: string
  name: string
  provider: "github" | "gitlab" | "jenkins" | "circleci"
  enabled: boolean
  webhookUrl?: string
  triggers: {
    onPush: boolean
    onPullRequest: boolean
    onTag: boolean
  }
  checks: {
    configValidation: boolean
    connectivityTest: boolean
    preMarketChecklist: boolean
  }
  notifications: {
    slack?: string
    email?: string[]
  }
}

export interface CIRun {
  id: string
  configId: string
  status: "pending" | "running" | "success" | "failed"
  startTime: string
  endTime?: string
  duration?: number
  checks: CICheck[]
  triggeredBy: string
  branch: string
  commit: string
}

export interface CICheck {
  name: string
  status: "pending" | "running" | "passed" | "failed"
  duration?: number
  message?: string
  details?: string
}
