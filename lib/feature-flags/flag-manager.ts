import type { FeatureFlag } from "@/lib/types/feature-flags"

export class FeatureFlagManager {
  private flags: Map<string, FeatureFlag> = new Map()

  constructor() {
    // Initialize with default flags
    this.initializeDefaultFlags()
  }

  private initializeDefaultFlags() {
    const defaultFlags: FeatureFlag[] = [
      {
        id: "flag-1",
        name: "Enhanced Risk Monitoring",
        key: "enhanced_risk_monitoring",
        description: "Enable advanced risk monitoring with real-time alerts",
        enabled: true,
        environments: {
          production: true,
          staging: true,
          development: true,
        },
        rolloutPercentage: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ["risk", "monitoring"],
      },
      {
        id: "flag-2",
        name: "Canary Deployments",
        key: "canary_deployments",
        description: "Enable gradual rollout with canary deployments",
        enabled: true,
        environments: {
          production: false,
          staging: true,
          development: true,
        },
        rolloutPercentage: 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ["deployment", "canary"],
      },
      {
        id: "flag-3",
        name: "Advanced Config Diff",
        key: "advanced_config_diff",
        description: "Show detailed config differences with syntax highlighting",
        enabled: true,
        environments: {
          production: true,
          staging: true,
          development: true,
        },
        rolloutPercentage: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ["config", "ui"],
      },
      {
        id: "flag-4",
        name: "Auto Rollback",
        key: "auto_rollback",
        description: "Automatically rollback deployments on health check failures",
        enabled: false,
        environments: {
          production: false,
          staging: true,
          development: true,
        },
        rolloutPercentage: 25,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ["deployment", "safety"],
      },
      {
        id: "flag-5",
        name: "Real-time Feed Monitoring",
        key: "realtime_feed_monitoring",
        description: "Enable real-time market data feed monitoring",
        enabled: true,
        environments: {
          production: true,
          staging: true,
          development: true,
        },
        rolloutPercentage: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ["feeds", "monitoring"],
      },
    ]

    defaultFlags.forEach((flag) => {
      this.flags.set(flag.id, flag)
    })
  }

  isEnabled(key: string, environment: "production" | "staging" | "development" = "production"): boolean {
    const flag = Array.from(this.flags.values()).find((f) => f.key === key)
    if (!flag) return false

    // Check if flag is enabled globally
    if (!flag.enabled) return false

    // Check environment-specific setting
    if (!flag.environments[environment]) return false

    // Check rollout percentage (simulate with random)
    const random = Math.random() * 100
    return random <= flag.rolloutPercentage
  }

  getFlag(id: string): FeatureFlag | undefined {
    return this.flags.get(id)
  }

  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values()).sort((a, b) => a.name.localeCompare(b.name))
  }

  createFlag(flag: Omit<FeatureFlag, "id" | "createdAt" | "updatedAt">): FeatureFlag {
    const newFlag: FeatureFlag = {
      ...flag,
      id: `flag-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.flags.set(newFlag.id, newFlag)
    return newFlag
  }

  updateFlag(id: string, updates: Partial<FeatureFlag>): FeatureFlag | undefined {
    const flag = this.flags.get(id)
    if (!flag) return undefined

    const updatedFlag = {
      ...flag,
      ...updates,
      id: flag.id, // Preserve ID
      createdAt: flag.createdAt, // Preserve creation date
      updatedAt: new Date().toISOString(),
    }

    this.flags.set(id, updatedFlag)
    return updatedFlag
  }

  deleteFlag(id: string): boolean {
    return this.flags.delete(id)
  }

  toggleFlag(id: string): FeatureFlag | undefined {
    const flag = this.flags.get(id)
    if (!flag) return undefined

    return this.updateFlag(id, { enabled: !flag.enabled })
  }
}

export const featureFlagManager = new FeatureFlagManager()
