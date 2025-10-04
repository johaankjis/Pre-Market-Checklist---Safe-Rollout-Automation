import type { ChecklistItem, ChecklistRun } from "@/lib/types/checklist"
import { validateConfig } from "@/lib/validation/config-validator"
import { healthChecker } from "@/lib/connectivity/health-checker"
import { mockConfigs } from "@/lib/mock-data/configs"

export class ChecklistEngine {
  private currentRun: ChecklistRun | null = null

  async runChecklist(environment = "production"): Promise<ChecklistRun> {
    const runId = `run-${Date.now()}`
    const startTime = new Date().toISOString()

    this.currentRun = {
      id: runId,
      startTime,
      status: "running",
      totalChecks: 0,
      passedChecks: 0,
      failedChecks: 0,
      warningChecks: 0,
      items: [],
    }

    // Define all checks
    const checks: Array<() => Promise<ChecklistItem>> = [
      // Config checks
      () => this.checkConfigValidity(environment),
      () => this.checkRiskLimits(environment),
      () => this.checkVenueConfiguration(environment),

      // Connectivity checks
      () => this.checkEndpointConnectivity("NYSE"),
      () => this.checkEndpointConnectivity("NASDAQ"),
      () => this.checkEndpointConnectivity("BATS"),

      // Feed checks
      () => this.checkFeedHealth("NYSE Market Data"),
      () => this.checkFeedHealth("NASDAQ Market Data"),
      () => this.checkFeedHealth("Reference Data Feed"),

      // System checks
      () => this.checkDiskSpace(),
      () => this.checkMemory(),
      () => this.checkClockSkew(),
      () => this.checkCPUUsage(),
    ]

    this.currentRun.totalChecks = checks.length

    // Run all checks sequentially
    for (const check of checks) {
      const item = await check()
      this.currentRun.items.push(item)

      if (item.status === "passed") {
        this.currentRun.passedChecks++
      } else if (item.status === "failed") {
        this.currentRun.failedChecks++
      } else if (item.status === "warning") {
        this.currentRun.warningChecks++
      }
    }

    // Complete the run
    const endTime = new Date().toISOString()
    this.currentRun.endTime = endTime
    this.currentRun.duration = new Date(endTime).getTime() - new Date(startTime).getTime()
    this.currentRun.status = this.currentRun.failedChecks > 0 ? "failed" : "completed"

    return this.currentRun
  }

  private async checkConfigValidity(environment: string): Promise<ChecklistItem> {
    const startTime = Date.now()
    const item: ChecklistItem = {
      id: "config-validity",
      name: "Config Schema Validation",
      category: "config",
      status: "running",
    }

    try {
      const config = mockConfigs[environment]
      const validation = validateConfig(config)
      const duration = Date.now() - startTime

      const criticalErrors = validation.errors.filter((e) => e.severity === "critical")

      if (criticalErrors.length > 0) {
        return {
          ...item,
          status: "failed",
          duration,
          message: `${criticalErrors.length} critical error(s) found`,
          details: criticalErrors.map((e) => `${e.field}: ${e.message}`).join("; "),
          timestamp: new Date().toISOString(),
        }
      }

      if (validation.errors.length > 0) {
        return {
          ...item,
          status: "warning",
          duration,
          message: `${validation.errors.length} error(s) found`,
          details: validation.errors.map((e) => `${e.field}: ${e.message}`).join("; "),
          timestamp: new Date().toISOString(),
        }
      }

      return {
        ...item,
        status: "passed",
        duration,
        message: "Config validation passed",
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        ...item,
        status: "failed",
        duration: Date.now() - startTime,
        message: "Config validation failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      }
    }
  }

  private async checkRiskLimits(environment: string): Promise<ChecklistItem> {
    const startTime = Date.now()
    const item: ChecklistItem = {
      id: "risk-limits",
      name: "Risk Limits Check",
      category: "risk",
      status: "running",
    }

    try {
      const config = mockConfigs[environment]
      const duration = Date.now() - startTime

      if (!config.riskLimits || config.riskLimits.length === 0) {
        return {
          ...item,
          status: "failed",
          duration,
          message: "No risk limits configured",
          timestamp: new Date().toISOString(),
        }
      }

      const enabledLimits = config.riskLimits.filter((r) => r.enabled)
      if (enabledLimits.length === 0) {
        return {
          ...item,
          status: "warning",
          duration,
          message: "No risk limits enabled",
          timestamp: new Date().toISOString(),
        }
      }

      return {
        ...item,
        status: "passed",
        duration,
        message: `${enabledLimits.length} risk limit(s) active`,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        ...item,
        status: "failed",
        duration: Date.now() - startTime,
        message: "Risk limits check failed",
        timestamp: new Date().toISOString(),
      }
    }
  }

  private async checkVenueConfiguration(environment: string): Promise<ChecklistItem> {
    const startTime = Date.now()
    const item: ChecklistItem = {
      id: "venue-config",
      name: "Venue Configuration",
      category: "config",
      status: "running",
    }

    try {
      const config = mockConfigs[environment]
      const duration = Date.now() - startTime

      const enabledVenues = config.venues.filter((v) => v.enabled)
      if (enabledVenues.length === 0) {
        return {
          ...item,
          status: "failed",
          duration,
          message: "No venues enabled",
          timestamp: new Date().toISOString(),
        }
      }

      return {
        ...item,
        status: "passed",
        duration,
        message: `${enabledVenues.length} venue(s) enabled`,
        details: enabledVenues.map((v) => v.name).join(", "),
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        ...item,
        status: "failed",
        duration: Date.now() - startTime,
        message: "Venue configuration check failed",
        timestamp: new Date().toISOString(),
      }
    }
  }

  private async checkEndpointConnectivity(endpoint: string): Promise<ChecklistItem> {
    const startTime = Date.now()
    const item: ChecklistItem = {
      id: `connectivity-${endpoint.toLowerCase()}`,
      name: `${endpoint} Connectivity`,
      category: "connectivity",
      status: "running",
    }

    try {
      const check = await healthChecker.checkEndpoint(`https://api.${endpoint.toLowerCase()}.example.com`, endpoint)
      const duration = Date.now() - startTime

      if (!check.success) {
        return {
          ...item,
          status: "failed",
          duration,
          message: "Connection failed",
          details: check.error,
          timestamp: new Date().toISOString(),
        }
      }

      if (check.latency > 100) {
        return {
          ...item,
          status: "warning",
          duration,
          message: `High latency: ${check.latency.toFixed(0)}ms`,
          timestamp: new Date().toISOString(),
        }
      }

      return {
        ...item,
        status: "passed",
        duration,
        message: `Connected (${check.latency.toFixed(0)}ms)`,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        ...item,
        status: "failed",
        duration: Date.now() - startTime,
        message: "Connectivity check failed",
        timestamp: new Date().toISOString(),
      }
    }
  }

  private async checkFeedHealth(feedName: string): Promise<ChecklistItem> {
    const startTime = Date.now()
    const item: ChecklistItem = {
      id: `feed-${feedName.toLowerCase().replace(/\s+/g, "-")}`,
      name: `${feedName} Health`,
      category: "feeds",
      status: "running",
    }

    try {
      // Simulate feed health check
      await new Promise((resolve) => setTimeout(resolve, 50))
      const duration = Date.now() - startTime

      // Random status for demo
      const isHealthy = Math.random() > 0.2
      const lag = Math.random() * 20

      if (!isHealthy) {
        return {
          ...item,
          status: "failed",
          duration,
          message: "Feed disconnected",
          timestamp: new Date().toISOString(),
        }
      }

      if (lag > 10) {
        return {
          ...item,
          status: "warning",
          duration,
          message: `High lag: ${lag.toFixed(0)}ms`,
          timestamp: new Date().toISOString(),
        }
      }

      return {
        ...item,
        status: "passed",
        duration,
        message: `Active (lag: ${lag.toFixed(0)}ms)`,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        ...item,
        status: "failed",
        duration: Date.now() - startTime,
        message: "Feed health check failed",
        timestamp: new Date().toISOString(),
      }
    }
  }

  private async checkDiskSpace(): Promise<ChecklistItem> {
    const startTime = Date.now()
    const item: ChecklistItem = {
      id: "disk-space",
      name: "Disk Space",
      category: "system",
      status: "running",
    }

    try {
      // Simulate disk space check
      await new Promise((resolve) => setTimeout(resolve, 30))
      const duration = Date.now() - startTime

      const total = 1000 // GB
      const available = 150 + Math.random() * 200 // 150-350 GB
      const percentage = (available / total) * 100

      if (percentage < 10) {
        return {
          ...item,
          status: "failed",
          duration,
          message: `Critical: ${percentage.toFixed(1)}% available`,
          details: `${available.toFixed(0)}GB / ${total}GB`,
          timestamp: new Date().toISOString(),
        }
      }

      if (percentage < 20) {
        return {
          ...item,
          status: "warning",
          duration,
          message: `Low: ${percentage.toFixed(1)}% available`,
          details: `${available.toFixed(0)}GB / ${total}GB`,
          timestamp: new Date().toISOString(),
        }
      }

      return {
        ...item,
        status: "passed",
        duration,
        message: `${percentage.toFixed(1)}% available`,
        details: `${available.toFixed(0)}GB / ${total}GB`,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        ...item,
        status: "failed",
        duration: Date.now() - startTime,
        message: "Disk space check failed",
        timestamp: new Date().toISOString(),
      }
    }
  }

  private async checkMemory(): Promise<ChecklistItem> {
    const startTime = Date.now()
    const item: ChecklistItem = {
      id: "memory",
      name: "Memory Usage",
      category: "system",
      status: "running",
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 30))
      const duration = Date.now() - startTime

      const total = 64 // GB
      const used = 20 + Math.random() * 30 // 20-50 GB
      const percentage = (used / total) * 100

      if (percentage > 90) {
        return {
          ...item,
          status: "failed",
          duration,
          message: `Critical: ${percentage.toFixed(1)}% used`,
          details: `${used.toFixed(1)}GB / ${total}GB`,
          timestamp: new Date().toISOString(),
        }
      }

      if (percentage > 80) {
        return {
          ...item,
          status: "warning",
          duration,
          message: `High: ${percentage.toFixed(1)}% used`,
          details: `${used.toFixed(1)}GB / ${total}GB`,
          timestamp: new Date().toISOString(),
        }
      }

      return {
        ...item,
        status: "passed",
        duration,
        message: `${percentage.toFixed(1)}% used`,
        details: `${used.toFixed(1)}GB / ${total}GB`,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        ...item,
        status: "failed",
        duration: Date.now() - startTime,
        message: "Memory check failed",
        timestamp: new Date().toISOString(),
      }
    }
  }

  private async checkClockSkew(): Promise<ChecklistItem> {
    const startTime = Date.now()
    const item: ChecklistItem = {
      id: "clock-skew",
      name: "Clock Skew",
      category: "system",
      status: "running",
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 40))
      const duration = Date.now() - startTime

      // Simulate clock skew in milliseconds
      const skew = Math.random() * 100 - 50 // -50 to +50 ms

      if (Math.abs(skew) > 30) {
        return {
          ...item,
          status: "warning",
          duration,
          message: `Skew: ${skew.toFixed(0)}ms`,
          details: "Consider NTP sync",
          timestamp: new Date().toISOString(),
        }
      }

      return {
        ...item,
        status: "passed",
        duration,
        message: `Skew: ${skew.toFixed(0)}ms`,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        ...item,
        status: "failed",
        duration: Date.now() - startTime,
        message: "Clock skew check failed",
        timestamp: new Date().toISOString(),
      }
    }
  }

  private async checkCPUUsage(): Promise<ChecklistItem> {
    const startTime = Date.now()
    const item: ChecklistItem = {
      id: "cpu-usage",
      name: "CPU Usage",
      category: "system",
      status: "running",
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 30))
      const duration = Date.now() - startTime

      const usage = 10 + Math.random() * 60 // 10-70%

      if (usage > 80) {
        return {
          ...item,
          status: "failed",
          duration,
          message: `Critical: ${usage.toFixed(1)}%`,
          timestamp: new Date().toISOString(),
        }
      }

      if (usage > 70) {
        return {
          ...item,
          status: "warning",
          duration,
          message: `High: ${usage.toFixed(1)}%`,
          timestamp: new Date().toISOString(),
        }
      }

      return {
        ...item,
        status: "passed",
        duration,
        message: `${usage.toFixed(1)}%`,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        ...item,
        status: "failed",
        duration: Date.now() - startTime,
        message: "CPU usage check failed",
        timestamp: new Date().toISOString(),
      }
    }
  }

  getCurrentRun(): ChecklistRun | null {
    return this.currentRun
  }
}

export const checklistEngine = new ChecklistEngine()
