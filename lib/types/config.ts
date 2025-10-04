// Config validation types and schemas

export interface RiskLimit {
  symbol: string
  maxNotional: number
  maxPosition: number
  maxOrderSize: number
  enabled: boolean
}

export interface VenueConfig {
  name: string
  enabled: boolean
  apiEndpoint: string
  timeout: number
  maxRetries: number
}

export interface RoutingRule {
  symbol: string
  venue: string
  priority: number
  conditions: Record<string, any>
}

export interface StrategyConfig {
  name: string
  version: string
  enabled: boolean
  riskLimits: RiskLimit[]
  venues: VenueConfig[]
  routing: RoutingRule[]
  parameters: Record<string, any>
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  timestamp: string
}

export interface ValidationError {
  field: string
  message: string
  severity: "error" | "critical"
}

export interface ValidationWarning {
  field: string
  message: string
  suggestion?: string
}

export interface ConfigDiff {
  added: string[]
  removed: string[]
  modified: Array<{
    field: string
    oldValue: any
    newValue: any
  }>
}

export type ConfigDiffType = ConfigDiff
