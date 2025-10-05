# Canary Deployment Documentation

The Canary Deployment system enables safe, progressive rollouts of new software versions with automatic health monitoring and rollback capabilities.

## Overview

Canary deployments gradually shift traffic from the current version to a new version, monitoring health metrics at each stage. If issues are detected, the system can automatically roll back to the previous version.

## Deployment Flow

```
┌────────────────────────────────────────────────────────────┐
│  Stage 1: 10% Traffic                                      │
│  • Monitor for 15 minutes                                  │
│  • Check: Error Rate < 1%                                  │
│  • Check: Latency P95 < 200ms                              │
│  • Check: Success Rate > 99.5%                             │
└──────────────┬─────────────────────────────────────────────┘
               │ Health OK? → Continue
               │ Health Bad? → Auto Rollback
               ▼
┌────────────────────────────────────────────────────────────┐
│  Stage 2: 25% Traffic                                      │
│  • Monitor for 30 minutes                                  │
│  • Same health checks                                      │
└──────────────┬─────────────────────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────────────────────┐
│  Stage 3: 50% Traffic                                      │
│  • Monitor for 30 minutes                                  │
│  • Same health checks                                      │
└──────────────┬─────────────────────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────────────────────┐
│  Stage 4: 100% Traffic                                     │
│  • Full rollout                                            │
│  • Continuous monitoring                                   │
└────────────────────────────────────────────────────────────┘
```

## Key Concepts

### Traffic Splitting

Traffic is gradually shifted from old to new version:
- **Stage 1**: 10% new, 90% old
- **Stage 2**: 25% new, 75% old
- **Stage 3**: 50% new, 50% old
- **Stage 4**: 100% new, 0% old

### Health Checks

At each stage, the system monitors:

1. **Error Rate**: Percentage of failed requests
2. **Latency P95**: 95th percentile response time
3. **Success Rate**: Percentage of successful requests

### Auto-Rollback

If any health check fails:
1. System immediately stops progression
2. Traffic is shifted back to previous version
3. Deployment is marked as "rolled_back"
4. Team is notified with failure reason

## CanaryEngine API

### Class: CanaryEngine

Located in `lib/canary/canary-engine.ts`

#### Methods

##### `startDeployment(config: CanaryConfig): Promise<CanaryDeployment>`

Starts a new canary deployment.

**Parameters:**
```typescript
interface CanaryConfig {
  name: string                  // Deployment name
  version: string               // Version being deployed
  environment: string           // Target environment
  stages: Array<{
    trafficPercentage: number   // Traffic % for this stage
    duration: number            // Duration in minutes
  }>
  healthThresholds: {
    maxErrorRate: number        // Max acceptable error rate
    maxLatencyP95: number       // Max acceptable latency (ms)
    minSuccessRate: number      // Min acceptable success rate
  }
  autoRollback: boolean         // Enable automatic rollback
}
```

**Example:**
```typescript
import { canaryEngine } from '@/lib/canary/canary-engine'

const deployment = await canaryEngine.startDeployment({
  name: 'v2.1.0 Production Rollout',
  version: '2.1.0',
  environment: 'production',
  stages: [
    { trafficPercentage: 10, duration: 15 },
    { trafficPercentage: 25, duration: 30 },
    { trafficPercentage: 50, duration: 30 },
    { trafficPercentage: 100, duration: 60 }
  ],
  healthThresholds: {
    maxErrorRate: 1.0,
    maxLatencyP95: 200,
    minSuccessRate: 99.5
  },
  autoRollback: true
})
```

##### `progressStage(deploymentId: string): Promise<CanaryDeployment>`

Manually progress to the next stage.

**Example:**
```typescript
const updated = await canaryEngine.progressStage('canary-1234567890')
console.log(`Now at stage ${updated.currentStage}`)
```

##### `rollback(deploymentId: string, reason: string): Promise<CanaryDeployment>`

Manually trigger a rollback.

**Example:**
```typescript
const rolled = await canaryEngine.rollback(
  'canary-1234567890',
  'High error rate detected manually'
)
```

##### `getDeployment(deploymentId: string): CanaryDeployment | undefined`

Retrieve deployment status.

**Example:**
```typescript
const deployment = canaryEngine.getDeployment('canary-1234567890')
if (deployment) {
  console.log(`Status: ${deployment.status}`)
  console.log(`Stage: ${deployment.currentStage}/${deployment.totalStages}`)
}
```

## Types

### CanaryDeployment

```typescript
interface CanaryDeployment {
  id: string                    // Unique deployment ID
  name: string                  // Deployment name
  environment: string           // Target environment
  version: string               // Version being deployed
  status: "pending" | "running" | "completed" | "failed" | "rolled_back"
  startTime: string             // ISO timestamp
  endTime?: string              // ISO timestamp (when done)
  currentStage: number          // Current stage number (1-based)
  totalStages: number           // Total number of stages
  stages: CanaryStage[]         // Stage details
  healthMetrics: HealthMetrics  // Overall health metrics
  rollbackReason?: string       // Reason for rollback
}
```

### CanaryStage

```typescript
interface CanaryStage {
  stage: number                 // Stage number
  name: string                  // Display name
  trafficPercentage: number     // Traffic % for this stage
  duration: number              // Duration in minutes
  status: "pending" | "running" | "completed" | "failed"
  startTime?: string            // ISO timestamp
  endTime?: string              // ISO timestamp
  healthChecks: HealthCheck[]   // Health check results
  metrics: StageMetrics         // Stage-specific metrics
}
```

### HealthCheck

```typescript
interface HealthCheck {
  name: string                  // Check name
  status: "pending" | "passed" | "failed"
  threshold: number             // Acceptable threshold
  actual: number                // Actual measured value
  timestamp?: string            // ISO timestamp
}
```

## Usage Examples

### Starting a Deployment from UI

```typescript
const [deployments, setDeployments] = useState<CanaryDeployment[]>([])

const startDeployment = async () => {
  const config = {
    name: 'v2.1.0 Rollout',
    version: '2.1.0',
    environment: 'production',
    stages: [
      { trafficPercentage: 10, duration: 15 },
      { trafficPercentage: 50, duration: 30 },
      { trafficPercentage: 100, duration: 60 }
    ],
    healthThresholds: {
      maxErrorRate: 1.0,
      maxLatencyP95: 200,
      minSuccessRate: 99.5
    },
    autoRollback: true
  }

  try {
    const response = await fetch('/api/canary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    })
    const deployment = await response.json()
    setDeployments(prev => [...prev, deployment])
  } catch (error) {
    console.error('Failed to start deployment:', error)
  }
}
```

### Monitoring Deployment Progress

```typescript
// Poll for updates
useEffect(() => {
  if (!activeDeployment) return

  const interval = setInterval(async () => {
    const response = await fetch(`/api/canary/${activeDeployment.id}`)
    const updated = await response.json()
    setActiveDeployment(updated)

    // Stop polling if deployment is complete
    if (updated.status === 'completed' || updated.status === 'rolled_back') {
      clearInterval(interval)
    }
  }, 5000) // Poll every 5 seconds

  return () => clearInterval(interval)
}, [activeDeployment])
```

### Manual Progression

```typescript
const handleProgress = async (deploymentId: string) => {
  try {
    const response = await fetch(`/api/canary/${deploymentId}/progress`, {
      method: 'POST'
    })
    const updated = await response.json()
    // Update UI with new deployment state
  } catch (error) {
    console.error('Failed to progress stage:', error)
  }
}
```

### Manual Rollback

```typescript
const handleRollback = async (deploymentId: string, reason: string) => {
  if (!confirm('Are you sure you want to roll back this deployment?')) {
    return
  }

  try {
    const response = await fetch(`/api/canary/${deploymentId}/rollback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    })
    const rolled = await response.json()
    // Update UI to show rollback
  } catch (error) {
    console.error('Rollback failed:', error)
  }
}
```

## Configuration Best Practices

### Stage Configuration

**Conservative Approach (Recommended for Production):**
```typescript
stages: [
  { trafficPercentage: 5, duration: 15 },   // Minimal risk
  { trafficPercentage: 10, duration: 15 },
  { trafficPercentage: 25, duration: 30 },
  { trafficPercentage: 50, duration: 30 },
  { trafficPercentage: 100, duration: 60 }
]
```

**Aggressive Approach (For Non-Critical Systems):**
```typescript
stages: [
  { trafficPercentage: 25, duration: 10 },
  { trafficPercentage: 50, duration: 10 },
  { trafficPercentage: 100, duration: 30 }
]
```

**Emergency Rollout:**
```typescript
stages: [
  { trafficPercentage: 50, duration: 5 },
  { trafficPercentage: 100, duration: 10 }
]
```

### Health Thresholds

**Strict (Critical Systems):**
```typescript
healthThresholds: {
  maxErrorRate: 0.5,        // 0.5% max errors
  maxLatencyP95: 150,       // 150ms max latency
  minSuccessRate: 99.9      // 99.9% min success
}
```

**Moderate (Standard Systems):**
```typescript
healthThresholds: {
  maxErrorRate: 1.0,        // 1% max errors
  maxLatencyP95: 200,       // 200ms max latency
  minSuccessRate: 99.5      // 99.5% min success
}
```

**Lenient (Development/Staging):**
```typescript
healthThresholds: {
  maxErrorRate: 5.0,        // 5% max errors
  maxLatencyP95: 500,       // 500ms max latency
  minSuccessRate: 95.0      // 95% min success
}
```

## Monitoring and Alerts

### Metrics to Track

**Per-Stage Metrics:**
- Request count
- Error count
- Average latency
- Maximum latency
- Success rate

**Overall Metrics:**
- Error rate
- P95 latency
- P99 latency
- Throughput (requests/second)
- Success rate

### Alert Conditions

1. **Critical**: Health check fails → Immediate rollback
2. **Warning**: Metrics approaching threshold → Manual review
3. **Info**: Stage progression → Notification
4. **Success**: Deployment complete → Confirmation

### Recommended Alert Rules

```typescript
// Alert when error rate is 80% of threshold
if (actualErrorRate > (maxErrorRate * 0.8)) {
  sendWarning('Error rate approaching threshold')
}

// Alert on any rollback
if (deployment.status === 'rolled_back') {
  sendCriticalAlert('Deployment rolled back', deployment.rollbackReason)
}

// Alert on stage completion
if (stage.status === 'completed') {
  sendInfo(`Stage ${stage.stage} completed successfully`)
}
```

## Integration Patterns

### With Load Balancer

```typescript
// Update load balancer weights
async function updateTrafficSplit(percentage: number) {
  await loadBalancer.setWeights({
    'service-v1': 100 - percentage,
    'service-v2': percentage
  })
}
```

### With Service Mesh

```typescript
// Update service mesh routing rules
async function updateServiceMesh(percentage: number) {
  await serviceMesh.updateVirtualService({
    routes: [
      { destination: 'v1', weight: 100 - percentage },
      { destination: 'v2', weight: percentage }
    ]
  })
}
```

### With Feature Flags

```typescript
// Use feature flags for gradual rollout
async function updateFeatureFlag(percentage: number) {
  await featureFlags.update('new-feature', {
    enabled: true,
    rolloutPercentage: percentage
  })
}
```

## Troubleshooting

### Common Issues

**Deployment stuck at stage:**
- Check health check implementation
- Verify metrics are being collected
- Review threshold configurations
- Check for network issues

**False positive health failures:**
- Adjust thresholds to account for normal variance
- Increase stage duration for more data
- Review metric collection accuracy
- Check for external factors (load, time of day)

**Rollback doesn't work:**
- Verify rollback mechanism is properly configured
- Check load balancer/router configuration
- Ensure previous version is still available
- Review rollback procedure

### Debug Mode

Enable detailed logging:

```typescript
// In CanaryEngine
private debug(message: string, data?: any) {
  if (process.env.DEBUG_CANARY) {
    console.log(`[Canary] ${message}`, data)
  }
}
```

## Testing Strategies

### Smoke Tests

Run basic tests at each stage:

```typescript
async function runSmokeTests(deploymentId: string) {
  const tests = [
    () => testHealthEndpoint(),
    () => testCriticalFlow(),
    () => testDataIntegrity()
  ]

  for (const test of tests) {
    const result = await test()
    if (!result.passed) {
      await canaryEngine.rollback(deploymentId, `Smoke test failed: ${result.name}`)
      break
    }
  }
}
```

### A/B Testing

Compare versions:

```typescript
// Collect metrics for both versions
const v1Metrics = collectMetrics('v1')
const v2Metrics = collectMetrics('v2')

// Compare
if (v2Metrics.errorRate > v1Metrics.errorRate * 1.5) {
  // v2 has 50% more errors than v1
  await rollback('Error rate increased significantly')
}
```

## Future Enhancements

- [ ] Automated health check generation
- [ ] ML-based anomaly detection
- [ ] Integration with APM tools
- [ ] Custom metric definitions
- [ ] Scheduled deployments
- [ ] Multi-region deployments
- [ ] Blue-green deployment support
- [ ] Advanced traffic shaping
- [ ] Custom rollback strategies

---

For more information:
- [Architecture Documentation](./ARCHITECTURE.md)
- [API Reference](./API.md)
- [README](../README.md)
