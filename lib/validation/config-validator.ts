import type { StrategyConfig, ValidationResult, ValidationError, ValidationWarning } from "@/lib/types/config"

export class ConfigValidator {
  private errors: ValidationError[] = []
  private warnings: ValidationWarning[] = []

  validate(config: StrategyConfig): ValidationResult {
    this.errors = []
    this.warnings = []

    this.validateBasicFields(config)
    this.validateRiskLimits(config)
    this.validateVenues(config)
    this.validateRouting(config)

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      timestamp: new Date().toISOString(),
    }
  }

  private validateBasicFields(config: StrategyConfig): void {
    if (!config.name || config.name.trim() === "") {
      this.errors.push({
        field: "name",
        message: "Strategy name is required",
        severity: "critical",
      })
    }

    if (!config.version || !this.isValidVersion(config.version)) {
      this.errors.push({
        field: "version",
        message: "Invalid version format. Expected semver (e.g., 1.0.0)",
        severity: "error",
      })
    }
  }

  private validateRiskLimits(config: StrategyConfig): void {
    if (!config.riskLimits || config.riskLimits.length === 0) {
      this.errors.push({
        field: "riskLimits",
        message: "At least one risk limit must be defined",
        severity: "critical",
      })
      return
    }

    config.riskLimits.forEach((limit, index) => {
      if (!limit.symbol) {
        this.errors.push({
          field: `riskLimits[${index}].symbol`,
          message: "Symbol is required",
          severity: "error",
        })
      }

      if (limit.maxNotional <= 0) {
        this.errors.push({
          field: `riskLimits[${index}].maxNotional`,
          message: "Max notional must be positive",
          severity: "critical",
        })
      }

      if (limit.maxNotional > 10000000) {
        this.warnings.push({
          field: `riskLimits[${index}].maxNotional`,
          message: "Max notional exceeds $10M threshold",
          suggestion: "Consider reviewing with risk management",
        })
      }

      if (limit.maxPosition <= 0) {
        this.errors.push({
          field: `riskLimits[${index}].maxPosition`,
          message: "Max position must be positive",
          severity: "error",
        })
      }

      if (limit.maxOrderSize > limit.maxPosition) {
        this.errors.push({
          field: `riskLimits[${index}].maxOrderSize`,
          message: "Max order size cannot exceed max position",
          severity: "error",
        })
      }
    })
  }

  private validateVenues(config: StrategyConfig): void {
    if (!config.venues || config.venues.length === 0) {
      this.errors.push({
        field: "venues",
        message: "At least one venue must be configured",
        severity: "critical",
      })
      return
    }

    const enabledVenues = config.venues.filter((v) => v.enabled)
    if (enabledVenues.length === 0) {
      this.warnings.push({
        field: "venues",
        message: "No venues are enabled",
        suggestion: "Enable at least one venue for trading",
      })
    }

    config.venues.forEach((venue, index) => {
      if (!venue.name) {
        this.errors.push({
          field: `venues[${index}].name`,
          message: "Venue name is required",
          severity: "error",
        })
      }

      if (!venue.apiEndpoint || !this.isValidUrl(venue.apiEndpoint)) {
        this.errors.push({
          field: `venues[${index}].apiEndpoint`,
          message: "Valid API endpoint URL is required",
          severity: "critical",
        })
      }

      if (venue.timeout < 100 || venue.timeout > 30000) {
        this.warnings.push({
          field: `venues[${index}].timeout`,
          message: "Timeout should be between 100ms and 30s",
          suggestion: "Recommended: 1000-5000ms",
        })
      }
    })
  }

  private validateRouting(config: StrategyConfig): void {
    if (!config.routing || config.routing.length === 0) {
      this.warnings.push({
        field: "routing",
        message: "No routing rules defined",
        suggestion: "Add routing rules for order flow",
      })
      return
    }

    const venueNames = new Set(config.venues.map((v) => v.name))
    const symbols = new Set(config.riskLimits.map((r) => r.symbol))

    config.routing.forEach((rule, index) => {
      if (!symbols.has(rule.symbol)) {
        this.warnings.push({
          field: `routing[${index}].symbol`,
          message: `Symbol ${rule.symbol} not found in risk limits`,
          suggestion: "Add risk limit for this symbol",
        })
      }

      if (!venueNames.has(rule.venue)) {
        this.errors.push({
          field: `routing[${index}].venue`,
          message: `Venue ${rule.venue} not found in venue configuration`,
          severity: "error",
        })
      }

      if (rule.priority < 1 || rule.priority > 100) {
        this.warnings.push({
          field: `routing[${index}].priority`,
          message: "Priority should be between 1 and 100",
        })
      }
    })
  }

  private isValidVersion(version: string): boolean {
    return /^\d+\.\d+\.\d+$/.test(version)
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
}

export function validateConfig(config: StrategyConfig): ValidationResult {
  const validator = new ConfigValidator()
  return validator.validate(config)
}

export function compareConfigs(oldConfig: StrategyConfig, newConfig: StrategyConfig) {
  const added: string[] = []
  const removed: string[] = []
  const modified: Array<{ field: string; oldValue: any; newValue: any }> = []

  // Compare basic fields
  if (oldConfig.version !== newConfig.version) {
    modified.push({
      field: "version",
      oldValue: oldConfig.version,
      newValue: newConfig.version,
    })
  }

  if (oldConfig.enabled !== newConfig.enabled) {
    modified.push({
      field: "enabled",
      oldValue: oldConfig.enabled,
      newValue: newConfig.enabled,
    })
  }

  // Compare risk limits
  const oldSymbols = new Set(oldConfig.riskLimits.map((r) => r.symbol))
  const newSymbols = new Set(newConfig.riskLimits.map((r) => r.symbol))

  newSymbols.forEach((symbol) => {
    if (!oldSymbols.has(symbol)) {
      added.push(`riskLimits.${symbol}`)
    }
  })

  oldSymbols.forEach((symbol) => {
    if (!newSymbols.has(symbol)) {
      removed.push(`riskLimits.${symbol}`)
    }
  })

  return { added, removed, modified }
}
