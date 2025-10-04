# Pre-Market Checklist Documentation

The Pre-Market Checklist is a comprehensive automated validation system that ensures all systems are ready before market open.

## Overview

The checklist performs automated checks across multiple categories to validate system readiness. It helps identify issues before they impact trading operations.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Checklist Page                        │
│  • User selects environment                              │
│  • Clicks "Run Checklist"                                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  API Route Handler                       │
│  POST /api/checklist                                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 ChecklistEngine                          │
│  • Orchestrates all checks                               │
│  • Runs checks in parallel                               │
│  • Aggregates results                                    │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
    ┌────────┐  ┌────────┐  ┌────────┐
    │ Config │  │Connect │  │ System │
    │ Checks │  │ Checks │  │ Checks │
    └────────┘  └────────┘  └────────┘
```

## Check Categories

### 1. Configuration Checks

Validate trading strategy configurations and settings.

**Checks:**
- **Configuration Validity**: Validates overall config structure
- **Risk Limits**: Verifies all risk parameters are within bounds
- **Venue Configuration**: Validates venue connection settings

**Example Results:**
```typescript
{
  id: "config-validity",
  name: "Configuration Validity",
  category: "config",
  status: "passed",
  duration: 150,
  message: "Configuration is valid",
  timestamp: "2024-03-15T09:30:01.000Z"
}
```

### 2. Connectivity Checks

Test connections to external systems and trading venues.

**Endpoints Tested:**
- NYSE (New York Stock Exchange)
- NASDAQ
- BATS (Better Alternative Trading System)
- Reference Data Service
- Execution Gateway

**Metrics:**
- Latency (response time)
- Success/failure status
- Error messages (if any)

**Example Results:**
```typescript
{
  id: "endpoint-nyse",
  name: "NYSE Connectivity",
  category: "connectivity",
  status: "passed",
  duration: 45,
  message: "Connection successful",
  details: "Latency: 45ms",
  timestamp: "2024-03-15T09:30:02.000Z"
}
```

### 3. Feed Checks

Monitor health and latency of market data feeds.

**Feeds Monitored:**
- NYSE Market Data
- NASDAQ Market Data
- BATS Market Data
- Reference Data Feed

**Metrics:**
- Feed availability
- Data lag/latency
- Update frequency
- Connection status

**Thresholds:**
- Warning: Lag > 10ms
- Critical: Lag > 50ms or feed disconnected

**Example Results:**
```typescript
{
  id: "feed-nyse-market-data",
  name: "NYSE Market Data Health",
  category: "feeds",
  status: "warning",
  duration: 2500,
  message: "Feed lag above threshold",
  details: "Current lag: 12.3ms (threshold: 10ms)",
  timestamp: "2024-03-15T09:30:05.000Z"
}
```

### 4. Risk Checks

Verify risk management systems and parameters.

**Checks:**
- Position limits
- Order size limits
- Notional limits
- Risk calculator availability

**Example Results:**
```typescript
{
  id: "risk-limits",
  name: "Risk Limits Check",
  category: "risk",
  status: "passed",
  duration: 100,
  message: "All risk limits configured correctly",
  timestamp: "2024-03-15T09:30:03.000Z"
}
```

### 5. System Checks

Monitor system resources and health.

**Checks:**
- **Memory Usage**: Ensure sufficient free memory
- **Disk Space**: Check available disk space
- **CPU Usage**: Monitor CPU load
- **Clock Skew**: Verify system time accuracy

**Thresholds:**

| Resource | Warning | Critical |
|----------|---------|----------|
| Memory   | > 80%   | > 90%    |
| Disk     | > 80%   | > 90%    |
| CPU      | > 70%   | > 90%    |
| Clock    | > 100ms | > 500ms  |

**Example Results:**
```typescript
{
  id: "memory",
  name: "Memory Usage",
  category: "system",
  status: "warning",
  duration: 30,
  message: "Memory usage elevated",
  details: "45.2GB / 64GB (70.6%)",
  timestamp: "2024-03-15T09:30:04.000Z"
}
```

## Status Types

Each check can have one of five statuses:

- **pending**: Check has not started yet
- **running**: Check is currently executing
- **passed**: Check completed successfully
- **warning**: Check passed but with warnings
- **failed**: Check failed critical validation

## ChecklistEngine API

### Class: ChecklistEngine

Located in `lib/checklist/checklist-engine.ts`

#### Methods

##### `runChecklist(environment?: string): Promise<ChecklistRun>`

Executes the complete checklist for the specified environment.

**Parameters:**
- `environment` (string, optional): Target environment. Default: "production"

**Returns:** `Promise<ChecklistRun>`

**Example:**
```typescript
import { checklistEngine } from '@/lib/checklist/checklist-engine'

const result = await checklistEngine.runChecklist('production')
console.log(`Total checks: ${result.totalChecks}`)
console.log(`Passed: ${result.passedChecks}`)
console.log(`Failed: ${result.failedChecks}`)
```

##### `getCurrentRun(): ChecklistRun | null`

Returns the most recent checklist run.

**Returns:** `ChecklistRun | null`

**Example:**
```typescript
const currentRun = checklistEngine.getCurrentRun()
if (currentRun) {
  console.log(`Status: ${currentRun.status}`)
}
```

### Types

#### ChecklistRun

```typescript
interface ChecklistRun {
  id: string                    // Unique run identifier
  startTime: string             // ISO timestamp
  endTime?: string              // ISO timestamp (when completed)
  duration?: number             // Total duration in ms
  status: "running" | "completed" | "failed"
  totalChecks: number
  passedChecks: number
  failedChecks: number
  warningChecks: number
  items: ChecklistItem[]        // Individual check results
}
```

#### ChecklistItem

```typescript
interface ChecklistItem {
  id: string                    // Unique check identifier
  name: string                  // Display name
  category: "config" | "connectivity" | "risk" | "system" | "feeds"
  status: "pending" | "running" | "passed" | "failed" | "warning"
  duration?: number             // Execution time in ms
  message?: string              // Status message
  details?: string              // Additional details
  timestamp?: string            // ISO timestamp
}
```

## Usage Examples

### Running a Checklist from UI

```typescript
// In React component
const [checklistRun, setChecklistRun] = useState<ChecklistRun | null>(null)
const [running, setRunning] = useState(false)

const runChecklist = async () => {
  setRunning(true)
  try {
    const response = await fetch('/api/checklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ environment: 'production' })
    })
    const data = await response.json()
    setChecklistRun(data)
  } catch (error) {
    console.error('Checklist failed:', error)
  } finally {
    setRunning(false)
  }
}
```

### Filtering Results

```typescript
// Group items by category
const groupedItems = checklistRun?.items.reduce((acc, item) => {
  if (!acc[item.category]) {
    acc[item.category] = []
  }
  acc[item.category].push(item)
  return acc
}, {} as Record<string, ChecklistItem[]>)

// Get only failed checks
const failedChecks = checklistRun?.items.filter(
  item => item.status === 'failed'
)

// Get checks that need attention
const attentionNeeded = checklistRun?.items.filter(
  item => item.status === 'failed' || item.status === 'warning'
)
```

### Custom Check Implementation

To add a new check:

```typescript
// In ChecklistEngine class
private async checkCustomValidation(): Promise<ChecklistItem> {
  const startTime = Date.now()
  const item: ChecklistItem = {
    id: 'custom-validation',
    name: 'Custom Validation',
    category: 'config',
    status: 'running'
  }

  try {
    // Perform validation
    const result = await performValidation()
    const duration = Date.now() - startTime

    if (!result.valid) {
      return {
        ...item,
        status: 'failed',
        duration,
        message: 'Validation failed',
        details: result.error,
        timestamp: new Date().toISOString()
      }
    }

    return {
      ...item,
      status: 'passed',
      duration,
      message: 'Validation successful',
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      ...item,
      status: 'failed',
      duration: Date.now() - startTime,
      message: 'Check execution failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }
  }
}

// Add to checks array in runChecklist method
const checks: Array<() => Promise<ChecklistItem>> = [
  // ... existing checks
  () => this.checkCustomValidation(),
]
```

## Best Practices

### 1. Check Implementation

- Keep checks focused and single-purpose
- Include clear error messages
- Set appropriate timeouts
- Handle errors gracefully
- Return detailed context in failures

### 2. Performance

- Run independent checks in parallel
- Set reasonable timeouts (avoid long-running checks)
- Cache results when appropriate
- Avoid unnecessary API calls

### 3. Error Handling

```typescript
try {
  // Perform check
  const result = await checkOperation()
  return successResult(result)
} catch (error) {
  // Log error for debugging
  console.error('Check failed:', error)
  
  // Return user-friendly error
  return failureResult(
    error instanceof Error ? error.message : 'Unknown error'
  )
}
```

### 4. Testing Checklist Logic

```typescript
describe('ChecklistEngine', () => {
  it('should complete all checks', async () => {
    const engine = new ChecklistEngine()
    const result = await engine.runChecklist('production')
    
    expect(result.status).toBe('completed')
    expect(result.items.length).toBeGreaterThan(0)
    expect(result.totalChecks).toBe(result.items.length)
  })

  it('should mark failed checks correctly', async () => {
    const engine = new ChecklistEngine()
    const result = await engine.runChecklist('production')
    
    const failedCount = result.items.filter(
      item => item.status === 'failed'
    ).length
    
    expect(result.failedChecks).toBe(failedCount)
  })
})
```

## Monitoring and Alerts

### Recommended Alert Rules

1. **Critical Failures**: Alert when any check fails
2. **Multiple Warnings**: Alert when > 3 warnings
3. **Execution Time**: Alert if checklist takes > 2 minutes
4. **Pattern Detection**: Alert on repeated failures

### Metrics to Track

- Checklist execution frequency
- Average execution time
- Pass/fail rates by category
- Most common failure types
- Time-to-detection for issues

## Troubleshooting

### Common Issues

**Checklist times out:**
- Check network connectivity
- Verify external services are available
- Increase timeout values if needed

**High failure rate:**
- Review configuration changes
- Check external service status
- Verify credentials/API keys

**Inconsistent results:**
- Check for race conditions
- Verify test data consistency
- Review timeout configurations

## Future Enhancements

- [ ] Scheduled automatic execution
- [ ] Custom check definitions via UI
- [ ] Historical trend analysis
- [ ] Email/SMS notifications
- [ ] Integration with ticketing systems
- [ ] Performance benchmarking
- [ ] Machine learning anomaly detection
- [ ] Custom thresholds per environment

---

For more information:
- [Architecture Documentation](./ARCHITECTURE.md)
- [API Reference](./API.md)
- [README](../README.md)
