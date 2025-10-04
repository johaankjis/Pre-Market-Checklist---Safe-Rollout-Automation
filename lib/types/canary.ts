// Canary deployment types

export interface CanaryDeployment {
  id: string
  name: string
  environment: string
  version: string
  status: "pending" | "running" | "completed" | "failed" | "rolled_back"
  startTime: string
  endTime?: string
  currentStage: number
  totalStages: number
  stages: CanaryStage[]
  healthMetrics: HealthMetrics
  rollbackReason?: string
}

export interface CanaryStage {
  stage: number
  name: string
  trafficPercentage: number
  duration: number // minutes
  status: "pending" | "running" | "completed" | "failed"
  startTime?: string
  endTime?: string
  healthChecks: HealthCheck[]
  metrics: StageMetrics
}

export interface HealthCheck {
  name: string
  status: "pending" | "passed" | "failed"
  threshold: number
  actual: number
  timestamp?: string
}

export interface HealthMetrics {
  errorRate: number
  latencyP95: number
  latencyP99: number
  throughput: number
  successRate: number
}

export interface StageMetrics {
  requests: number
  errors: number
  avgLatency: number
  maxLatency: number
}

export interface CanaryConfig {
  name: string
  version: string
  environment: string
  stages: {
    trafficPercentage: number
    duration: number // minutes
  }[]
  healthThresholds: {
    maxErrorRate: number
    maxLatencyP95: number
    minSuccessRate: number
  }
  autoRollback: boolean
}
