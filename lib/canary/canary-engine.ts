import type { CanaryDeployment, CanaryStage, CanaryConfig, StageMetrics } from "@/lib/types/canary"

export class CanaryEngine {
  private deployments: Map<string, CanaryDeployment> = new Map()

  async startDeployment(config: CanaryConfig): Promise<CanaryDeployment> {
    const deploymentId = `canary-${Date.now()}`

    const stages: CanaryStage[] = config.stages.map((stageConfig, index) => ({
      stage: index + 1,
      name: `Stage ${index + 1} - ${stageConfig.trafficPercentage}% Traffic`,
      trafficPercentage: stageConfig.trafficPercentage,
      duration: stageConfig.duration,
      status: "pending" as const,
      healthChecks: [
        {
          name: "Error Rate",
          status: "pending" as const,
          threshold: config.healthThresholds.maxErrorRate,
          actual: 0,
        },
        {
          name: "Latency P95",
          status: "pending" as const,
          threshold: config.healthThresholds.maxLatencyP95,
          actual: 0,
        },
        {
          name: "Success Rate",
          status: "pending" as const,
          threshold: config.healthThresholds.minSuccessRate,
          actual: 0,
        },
      ],
      metrics: {
        requests: 0,
        errors: 0,
        avgLatency: 0,
        maxLatency: 0,
      },
    }))

    const deployment: CanaryDeployment = {
      id: deploymentId,
      name: config.name,
      environment: config.environment,
      version: config.version,
      status: "running",
      startTime: new Date().toISOString(),
      currentStage: 1,
      totalStages: stages.length,
      stages,
      healthMetrics: {
        errorRate: 0,
        latencyP95: 0,
        latencyP99: 0,
        throughput: 0,
        successRate: 100,
      },
    }

    this.deployments.set(deploymentId, deployment)

    // Start the first stage
    this.runStage(deploymentId, 0, config)

    return deployment
  }

  private async runStage(deploymentId: string, stageIndex: number, config: CanaryConfig) {
    const deployment = this.deployments.get(deploymentId)
    if (!deployment) return

    const stage = deployment.stages[stageIndex]
    if (!stage) return

    // Mark stage as running
    stage.status = "running"
    stage.startTime = new Date().toISOString()
    deployment.currentStage = stageIndex + 1

    // Simulate stage execution
    const stageDurationMs = stage.duration * 60 * 1000 // Convert minutes to ms
    const checkInterval = 5000 // Check every 5 seconds

    const startTime = Date.now()
    const checkStageHealth = async () => {
      const elapsed = Date.now() - startTime

      // Simulate metrics collection
      const metrics = this.generateStageMetrics(stage.trafficPercentage)
      stage.metrics = metrics

      // Update health checks
      const errorRate = (metrics.errors / metrics.requests) * 100
      const successRate = ((metrics.requests - metrics.errors) / metrics.requests) * 100

      stage.healthChecks[0].actual = errorRate
      stage.healthChecks[0].status = errorRate <= config.healthThresholds.maxErrorRate ? "passed" : "failed"

      stage.healthChecks[1].actual = metrics.avgLatency
      stage.healthChecks[1].status = metrics.avgLatency <= config.healthThresholds.maxLatencyP95 ? "passed" : "failed"

      stage.healthChecks[2].actual = successRate
      stage.healthChecks[2].status = successRate >= config.healthThresholds.minSuccessRate ? "passed" : "failed"

      // Update overall health metrics
      deployment.healthMetrics = {
        errorRate,
        latencyP95: metrics.avgLatency,
        latencyP99: metrics.maxLatency,
        throughput: metrics.requests / (elapsed / 1000),
        successRate,
      }

      // Check for failures
      const failedChecks = stage.healthChecks.filter((c) => c.status === "failed")
      if (failedChecks.length > 0 && config.autoRollback) {
        // Rollback
        deployment.status = "rolled_back"
        deployment.rollbackReason = `Health check failed: ${failedChecks.map((c) => c.name).join(", ")}`
        deployment.endTime = new Date().toISOString()
        stage.status = "failed"
        stage.endTime = new Date().toISOString()
        return
      }

      // Continue if stage not complete
      if (elapsed < stageDurationMs) {
        setTimeout(checkStageHealth, checkInterval)
      } else {
        // Stage complete
        stage.status = "completed"
        stage.endTime = new Date().toISOString()

        // Move to next stage or complete deployment
        if (stageIndex + 1 < deployment.stages.length) {
          this.runStage(deploymentId, stageIndex + 1, config)
        } else {
          // Deployment complete
          deployment.status = "completed"
          deployment.endTime = new Date().toISOString()
        }
      }
    }

    checkStageHealth()
  }

  private generateStageMetrics(trafficPercentage: number): StageMetrics {
    const baseRequests = 1000
    const requests = Math.floor((baseRequests * trafficPercentage) / 100)

    // Simulate some errors (1-3%)
    const errorRate = 0.01 + Math.random() * 0.02
    const errors = Math.floor(requests * errorRate)

    // Simulate latency (50-150ms)
    const avgLatency = 50 + Math.random() * 100
    const maxLatency = avgLatency * (1.5 + Math.random() * 0.5)

    return {
      requests,
      errors,
      avgLatency: Math.round(avgLatency),
      maxLatency: Math.round(maxLatency),
    }
  }

  async rollbackDeployment(deploymentId: string, reason: string): Promise<void> {
    const deployment = this.deployments.get(deploymentId)
    if (!deployment) {
      throw new Error("Deployment not found")
    }

    deployment.status = "rolled_back"
    deployment.rollbackReason = reason
    deployment.endTime = new Date().toISOString()

    // Mark current stage as failed
    const currentStage = deployment.stages[deployment.currentStage - 1]
    if (currentStage && currentStage.status === "running") {
      currentStage.status = "failed"
      currentStage.endTime = new Date().toISOString()
    }
  }

  getDeployment(deploymentId: string): CanaryDeployment | undefined {
    return this.deployments.get(deploymentId)
  }

  getAllDeployments(): CanaryDeployment[] {
    return Array.from(this.deployments.values()).sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
    )
  }
}

export const canaryEngine = new CanaryEngine()
