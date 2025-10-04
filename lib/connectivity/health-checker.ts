import type { EndpointHealth, ConnectivityCheck, SLAMetrics } from "@/lib/types/connectivity"

export class HealthChecker {
  private checkHistory: Map<string, ConnectivityCheck[]> = new Map()

  async checkEndpoint(url: string, name: string): Promise<ConnectivityCheck> {
    const startTime = Date.now()

    try {
      // Simulate connectivity check with random latency
      const latency = Math.random() * 100 + 20 // 20-120ms
      await new Promise((resolve) => setTimeout(resolve, latency))

      // Simulate occasional failures (5% failure rate)
      const success = Math.random() > 0.05

      const check: ConnectivityCheck = {
        endpoint: name,
        success,
        latency: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: success ? undefined : "Connection timeout",
      }

      // Store in history
      if (!this.checkHistory.has(name)) {
        this.checkHistory.set(name, [])
      }
      const history = this.checkHistory.get(name)!
      history.push(check)

      // Keep only last 100 checks
      if (history.length > 100) {
        history.shift()
      }

      return check
    } catch (error) {
      return {
        endpoint: name,
        success: false,
        latency: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  getEndpointHealth(name: string): EndpointHealth | null {
    const history = this.checkHistory.get(name)
    if (!history || history.length === 0) {
      return null
    }

    const recentChecks = history.slice(-20) // Last 20 checks
    const successfulChecks = recentChecks.filter((c) => c.success)
    const uptime = (successfulChecks.length / recentChecks.length) * 100
    const errorRate = ((recentChecks.length - successfulChecks.length) / recentChecks.length) * 100

    const avgLatency = successfulChecks.reduce((sum, c) => sum + c.latency, 0) / successfulChecks.length

    let status: "healthy" | "degraded" | "down"
    if (uptime >= 99) {
      status = "healthy"
    } else if (uptime >= 95) {
      status = "degraded"
    } else {
      status = "down"
    }

    const lastCheck = recentChecks[recentChecks.length - 1]

    return {
      name,
      url: `https://api.${name.toLowerCase()}.example.com`,
      status,
      latency: avgLatency,
      lastCheck: lastCheck.timestamp,
      uptime,
      errorRate,
    }
  }

  getSLAMetrics(name: string): SLAMetrics | null {
    const history = this.checkHistory.get(name)
    if (!history || history.length === 0) {
      return null
    }

    const successfulChecks = history.filter((c) => c.success)
    const availability = (successfulChecks.length / history.length) * 100

    const latencies = successfulChecks.map((c) => c.latency).sort((a, b) => a - b)
    const avgLatency = latencies.reduce((sum, l) => sum + l, 0) / latencies.length

    const p95Index = Math.floor(latencies.length * 0.95)
    const p99Index = Math.floor(latencies.length * 0.99)

    return {
      availability,
      avgLatency,
      p95Latency: latencies[p95Index] || avgLatency,
      p99Latency: latencies[p99Index] || avgLatency,
      errorRate: ((history.length - successfulChecks.length) / history.length) * 100,
      totalRequests: history.length,
    }
  }

  clearHistory(name?: string): void {
    if (name) {
      this.checkHistory.delete(name)
    } else {
      this.checkHistory.clear()
    }
  }
}

// Singleton instance
export const healthChecker = new HealthChecker()
