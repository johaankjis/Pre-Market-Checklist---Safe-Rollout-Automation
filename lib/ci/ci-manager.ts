import type { CIConfig, CIRun, CICheck } from "@/lib/types/feature-flags"
import { validateConfig } from "@/lib/validation/config-validator"
import { healthChecker } from "@/lib/connectivity/health-checker"
import { checklistEngine } from "@/lib/checklist/checklist-engine"
import { mockConfigs } from "@/lib/mock-data/configs"

export class CIManager {
  private configs: Map<string, CIConfig> = new Map()
  private runs: Map<string, CIRun> = new Map()

  constructor() {
    this.initializeDefaultConfig()
  }

  private initializeDefaultConfig() {
    const defaultConfig: CIConfig = {
      id: "ci-1",
      name: "GitHub Actions",
      provider: "github",
      enabled: true,
      webhookUrl: "https://api.github.com/repos/org/repo/dispatches",
      triggers: {
        onPush: true,
        onPullRequest: true,
        onTag: true,
      },
      checks: {
        configValidation: true,
        connectivityTest: true,
        preMarketChecklist: true,
      },
      notifications: {
        slack: "https://hooks.slack.com/services/xxx",
        email: ["ops@example.com"],
      },
    }

    this.configs.set(defaultConfig.id, defaultConfig)
  }

  async runCI(configId: string, branch: string, commit: string, triggeredBy: string): Promise<CIRun> {
    const config = this.configs.get(configId)
    if (!config) {
      throw new Error("CI config not found")
    }

    const runId = `run-${Date.now()}`
    const run: CIRun = {
      id: runId,
      configId,
      status: "running",
      startTime: new Date().toISOString(),
      checks: [],
      triggeredBy,
      branch,
      commit,
    }

    this.runs.set(runId, run)

    // Run checks based on config
    const checks: Array<() => Promise<CICheck>> = []

    if (config.checks.configValidation) {
      checks.push(() => this.runConfigValidation())
    }

    if (config.checks.connectivityTest) {
      checks.push(() => this.runConnectivityTest())
    }

    if (config.checks.preMarketChecklist) {
      checks.push(() => this.runPreMarketChecklist())
    }

    // Execute checks sequentially
    for (const check of checks) {
      const result = await check()
      run.checks.push(result)

      if (result.status === "failed") {
        run.status = "failed"
        break
      }
    }

    // Complete the run
    if (run.status !== "failed") {
      run.status = "success"
    }

    run.endTime = new Date().toISOString()
    run.duration = new Date(run.endTime).getTime() - new Date(run.startTime).getTime()

    return run
  }

  private async runConfigValidation(): Promise<CICheck> {
    const startTime = Date.now()
    const check: CICheck = {
      name: "Config Validation",
      status: "running",
    }

    try {
      const config = mockConfigs.production
      const validation = validateConfig(config)

      const criticalErrors = validation.errors.filter((e) => e.severity === "critical")

      if (criticalErrors.length > 0) {
        return {
          ...check,
          status: "failed",
          duration: Date.now() - startTime,
          message: `${criticalErrors.length} critical error(s) found`,
          details: criticalErrors.map((e) => `${e.field}: ${e.message}`).join("; "),
        }
      }

      return {
        ...check,
        status: "passed",
        duration: Date.now() - startTime,
        message: "Config validation passed",
      }
    } catch (error) {
      return {
        ...check,
        status: "failed",
        duration: Date.now() - startTime,
        message: "Config validation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  private async runConnectivityTest(): Promise<CICheck> {
    const startTime = Date.now()
    const check: CICheck = {
      name: "Connectivity Test",
      status: "running",
    }

    try {
      const endpoints = ["NYSE", "NASDAQ", "BATS"]
      const results = await Promise.all(
        endpoints.map((ep) => healthChecker.checkEndpoint(`https://api.${ep.toLowerCase()}.example.com`, ep)),
      )

      const failures = results.filter((r) => !r.success)

      if (failures.length > 0) {
        return {
          ...check,
          status: "failed",
          duration: Date.now() - startTime,
          message: `${failures.length} endpoint(s) failed`,
          details: failures.map((f) => f.error).join("; "),
        }
      }

      return {
        ...check,
        status: "passed",
        duration: Date.now() - startTime,
        message: "All endpoints healthy",
      }
    } catch (error) {
      return {
        ...check,
        status: "failed",
        duration: Date.now() - startTime,
        message: "Connectivity test failed",
      }
    }
  }

  private async runPreMarketChecklist(): Promise<CICheck> {
    const startTime = Date.now()
    const check: CICheck = {
      name: "Pre-Market Checklist",
      status: "running",
    }

    try {
      const result = await checklistEngine.runChecklist("production")

      if (result.failedChecks > 0) {
        return {
          ...check,
          status: "failed",
          duration: Date.now() - startTime,
          message: `${result.failedChecks} check(s) failed`,
          details: result.items
            .filter((i) => i.status === "failed")
            .map((i) => i.name)
            .join("; "),
        }
      }

      return {
        ...check,
        status: "passed",
        duration: Date.now() - startTime,
        message: "All checks passed",
      }
    } catch (error) {
      return {
        ...check,
        status: "failed",
        duration: Date.now() - startTime,
        message: "Pre-market checklist failed",
      }
    }
  }

  getConfig(id: string): CIConfig | undefined {
    return this.configs.get(id)
  }

  getAllConfigs(): CIConfig[] {
    return Array.from(this.configs.values())
  }

  getRun(id: string): CIRun | undefined {
    return this.runs.get(id)
  }

  getAllRuns(): CIRun[] {
    return Array.from(this.runs.values()).sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
    )
  }

  updateConfig(id: string, updates: Partial<CIConfig>): CIConfig | undefined {
    const config = this.configs.get(id)
    if (!config) return undefined

    const updatedConfig = {
      ...config,
      ...updates,
      id: config.id,
    }

    this.configs.set(id, updatedConfig)
    return updatedConfig
  }
}

export const ciManager = new CIManager()
