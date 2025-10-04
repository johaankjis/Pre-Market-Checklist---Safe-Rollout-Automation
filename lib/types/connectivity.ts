// Connectivity monitoring types

export interface EndpointHealth {
  name: string
  url: string
  status: "healthy" | "degraded" | "down"
  latency: number
  lastCheck: string
  uptime: number
  errorRate: number
}

export interface ConnectivityCheck {
  endpoint: string
  success: boolean
  latency: number
  timestamp: string
  error?: string
}

export interface SLAMetrics {
  availability: number
  avgLatency: number
  p95Latency: number
  p99Latency: number
  errorRate: number
  totalRequests: number
}

export interface FeedStatus {
  name: string
  type: "market-data" | "reference-data" | "execution"
  connected: boolean
  lastHeartbeat: string
  messagesPerSecond: number
  lag: number
  status: "active" | "stale" | "disconnected"
}
