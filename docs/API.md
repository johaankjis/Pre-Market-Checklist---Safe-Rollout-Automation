# API Reference

This document describes all API endpoints available in the Pre-Market Checklist & Safe Rollout Automation platform.

## Base URL

```
Development: http://localhost:3000
Production: https://your-domain.com
```

## Table of Contents

1. [Checklist API](#checklist-api)
2. [Configuration Validation API](#configuration-validation-api)
3. [Connectivity API](#connectivity-api)
4. [Canary Deployment API](#canary-deployment-api)
5. [Feature Flags API](#feature-flags-api)
6. [CI Pipeline API](#ci-pipeline-api)

---

## Checklist API

### Run Checklist

Execute a pre-market checklist for a specified environment.

**Endpoint:** `POST /api/checklist`

**Request Body:**
```json
{
  "environment": "production"
}
```

**Parameters:**
- `environment` (string, optional): Target environment. Default: "production"
  - Values: `"production"`, `"staging"`

**Response:** `200 OK`
```json
{
  "id": "run-1698765432000",
  "startTime": "2024-03-15T09:30:00.000Z",
  "endTime": "2024-03-15T09:30:45.000Z",
  "duration": 45000,
  "status": "completed",
  "totalChecks": 15,
  "passedChecks": 13,
  "failedChecks": 1,
  "warningChecks": 1,
  "items": [
    {
      "id": "config-validity",
      "name": "Configuration Validity",
      "category": "config",
      "status": "passed",
      "duration": 150,
      "message": "Configuration is valid",
      "timestamp": "2024-03-15T09:30:01.000Z"
    },
    {
      "id": "feed-nyse-market-data",
      "name": "NYSE Market Data Health",
      "category": "feeds",
      "status": "warning",
      "duration": 2500,
      "message": "Feed lag above threshold",
      "details": "Current lag: 12.3ms (threshold: 10ms)",
      "timestamp": "2024-03-15T09:30:05.000Z"
    }
  ]
}
```

**Check Categories:**
- `config`: Configuration validation checks
- `connectivity`: Endpoint connectivity checks
- `feeds`: Market data feed health checks
- `risk`: Risk limit verification checks
- `system`: System resource checks (memory, disk, CPU)

**Check Statuses:**
- `pending`: Check has not started
- `running`: Check is in progress
- `passed`: Check completed successfully
- `failed`: Check failed critical validation
- `warning`: Check passed but with warnings

**Error Response:** `500 Internal Server Error`
```json
{
  "error": "Checklist execution failed"
}
```

---

### Get Current Checklist

Retrieve the status of the most recent checklist run.

**Endpoint:** `GET /api/checklist`

**Response:** `200 OK`
```json
{
  "id": "run-1698765432000",
  "startTime": "2024-03-15T09:30:00.000Z",
  "status": "running",
  "totalChecks": 15,
  "passedChecks": 8,
  "failedChecks": 0,
  "warningChecks": 0,
  "items": [...]
}
```

**Error Response:** `404 Not Found`
```json
{
  "error": "No checklist run found"
}
```

---

## Configuration Validation API

### Validate Configuration

Validate a trading strategy configuration.

**Endpoint:** `POST /api/validate`

**Request Body:**
```json
{
  "environment": "production",
  "strategy": "momentum_strategy"
}
```

**Parameters:**
- `environment` (string): Target environment
- `strategy` (string): Strategy name to validate

**Response:** `200 OK`
```json
{
  "valid": false,
  "errors": [
    {
      "field": "riskLimits[0].maxNotional",
      "message": "Max notional exceeds venue limit",
      "severity": "critical"
    },
    {
      "field": "venues[1].apiEndpoint",
      "message": "Invalid URL format",
      "severity": "error"
    }
  ],
  "warnings": [
    {
      "field": "parameters.lookbackPeriod",
      "message": "Lookback period is unusually high",
      "suggestion": "Consider reducing to 20-50 periods"
    }
  ],
  "timestamp": "2024-03-15T09:30:00.000Z"
}
```

**Validation Severity Levels:**
- `critical`: Must be fixed before deployment
- `error`: Should be fixed, may cause issues
- `warning`: Advisory, best practice recommendations

**Error Response:** `500 Internal Server Error`
```json
{
  "error": "Validation failed"
}
```

---

### Get Configuration

Retrieve a configuration for a specific environment and strategy.

**Endpoint:** `GET /api/validate?environment=production&strategy=momentum_strategy`

**Query Parameters:**
- `environment` (string): Target environment
- `strategy` (string): Strategy name

**Response:** `200 OK`
```json
{
  "name": "Momentum Strategy",
  "version": "1.2.3",
  "enabled": true,
  "riskLimits": [
    {
      "symbol": "AAPL",
      "maxNotional": 1000000,
      "maxPosition": 10000,
      "maxOrderSize": 1000,
      "enabled": true
    }
  ],
  "venues": [
    {
      "name": "NYSE",
      "enabled": true,
      "apiEndpoint": "https://api.nyse.com",
      "timeout": 5000,
      "maxRetries": 3
    }
  ],
  "routing": [
    {
      "symbol": "AAPL",
      "venue": "NYSE",
      "priority": 1,
      "conditions": {}
    }
  ],
  "parameters": {
    "lookbackPeriod": 20,
    "threshold": 0.02
  }
}
```

---

### Compare Configurations

Compare two configuration versions.

**Endpoint:** `POST /api/validate/compare`

**Request Body:**
```json
{
  "oldConfig": { ... },
  "newConfig": { ... }
}
```

**Response:** `200 OK`
```json
{
  "added": [
    "venues[2]",
    "routing[3]"
  ],
  "removed": [
    "venues[1]"
  ],
  "modified": [
    {
      "field": "riskLimits[0].maxNotional",
      "oldValue": 1000000,
      "newValue": 1500000
    },
    {
      "field": "parameters.threshold",
      "oldValue": 0.02,
      "newValue": 0.03
    }
  ]
}
```

---

## Connectivity API

### Get Connectivity Status

Retrieve current connectivity status for all endpoints.

**Endpoint:** `GET /api/connectivity`

**Response:** `200 OK`
```json
{
  "endpoints": [
    {
      "name": "NYSE",
      "status": "healthy",
      "lastCheck": "2024-03-15T09:30:00.000Z",
      "latency": 45,
      "successRate": 99.8,
      "uptime": 99.95
    },
    {
      "name": "NASDAQ",
      "status": "warning",
      "lastCheck": "2024-03-15T09:30:00.000Z",
      "latency": 125,
      "successRate": 98.5,
      "uptime": 99.2
    }
  ],
  "sla": [
    {
      "endpoint": "NYSE",
      "metrics": {
        "uptime": 99.95,
        "avgLatency": 45,
        "p95Latency": 78,
        "p99Latency": 120,
        "errorRate": 0.2,
        "totalChecks": 1000,
        "failedChecks": 2
      }
    }
  ],
  "feeds": [
    {
      "name": "NYSE Market Data",
      "status": "healthy",
      "latency": 5,
      "lag": 2,
      "lastUpdate": "2024-03-15T09:30:00.000Z"
    }
  ],
  "timestamp": "2024-03-15T09:30:00.000Z"
}
```

**Endpoint Statuses:**
- `healthy`: All checks passing
- `warning`: Some degradation detected
- `error`: Significant issues or offline

---

### Run Connectivity Checks

Execute fresh connectivity checks for all endpoints.

**Endpoint:** `POST /api/connectivity`

**Response:** `200 OK`
```json
{
  "message": "Health checks completed",
  "checks": [
    {
      "endpoint": "NYSE",
      "success": true,
      "latency": 45,
      "timestamp": "2024-03-15T09:30:00.000Z"
    },
    {
      "endpoint": "NASDAQ",
      "success": true,
      "latency": 78,
      "timestamp": "2024-03-15T09:30:00.000Z"
    }
  ]
}
```

---

## Canary Deployment API

### Start Canary Deployment

Initiate a new canary deployment.

**Endpoint:** `POST /api/canary`

**Request Body:**
```json
{
  "name": "v2.1.0 Rollout",
  "version": "2.1.0",
  "environment": "production",
  "stages": [
    {
      "trafficPercentage": 10,
      "duration": 15
    },
    {
      "trafficPercentage": 25,
      "duration": 30
    },
    {
      "trafficPercentage": 50,
      "duration": 30
    },
    {
      "trafficPercentage": 100,
      "duration": 60
    }
  ],
  "healthThresholds": {
    "maxErrorRate": 1.0,
    "maxLatencyP95": 200,
    "minSuccessRate": 99.5
  },
  "autoRollback": true
}
```

**Response:** `200 OK`
```json
{
  "id": "canary-1698765432000",
  "name": "v2.1.0 Rollout",
  "environment": "production",
  "version": "2.1.0",
  "status": "running",
  "startTime": "2024-03-15T09:30:00.000Z",
  "currentStage": 1,
  "totalStages": 4,
  "stages": [
    {
      "stage": 1,
      "name": "Stage 1 - 10% Traffic",
      "trafficPercentage": 10,
      "duration": 15,
      "status": "running",
      "startTime": "2024-03-15T09:30:00.000Z",
      "healthChecks": [
        {
          "name": "Error Rate",
          "status": "pending",
          "threshold": 1.0,
          "actual": 0
        }
      ],
      "metrics": {
        "requests": 0,
        "errors": 0,
        "avgLatency": 0,
        "maxLatency": 0
      }
    }
  ],
  "healthMetrics": {
    "errorRate": 0,
    "latencyP95": 0,
    "latencyP99": 0,
    "throughput": 0,
    "successRate": 100
  }
}
```

**Error Response:** `500 Internal Server Error`
```json
{
  "error": "Failed to start canary deployment"
}
```

---

### Get Deployment Status

Retrieve status of a specific canary deployment.

**Endpoint:** `GET /api/canary/:id`

**Parameters:**
- `id` (string): Deployment ID

**Response:** `200 OK`
```json
{
  "id": "canary-1698765432000",
  "name": "v2.1.0 Rollout",
  "status": "running",
  "currentStage": 2,
  "totalStages": 4,
  "stages": [...],
  "healthMetrics": {...}
}
```

**Error Response:** `404 Not Found`
```json
{
  "error": "Deployment not found"
}
```

---

### Progress Deployment

Manually progress to the next stage.

**Endpoint:** `POST /api/canary/:id/progress`

**Response:** `200 OK`
```json
{
  "message": "Progressed to stage 2",
  "deployment": {...}
}
```

---

### Rollback Deployment

Manually trigger a rollback.

**Endpoint:** `POST /api/canary/:id/rollback`

**Request Body:**
```json
{
  "reason": "High error rate detected"
}
```

**Response:** `200 OK`
```json
{
  "message": "Rollback initiated",
  "deployment": {
    "status": "rolled_back",
    "rollbackReason": "High error rate detected",
    ...
  }
}
```

---

## Feature Flags API

### Get All Feature Flags

Retrieve all feature flags.

**Endpoint:** `GET /api/feature-flags`

**Response:** `200 OK`
```json
{
  "flags": [
    {
      "id": "enhanced-risk-monitoring",
      "name": "Enhanced Risk Monitoring",
      "description": "Advanced real-time risk monitoring",
      "key": "enhanced_risk_monitoring",
      "enabled": true,
      "environments": {
        "production": true,
        "staging": true
      },
      "rolloutPercentage": 100,
      "createdAt": "2024-01-15T00:00:00.000Z",
      "updatedAt": "2024-03-15T09:30:00.000Z"
    }
  ]
}
```

---

### Update Feature Flag

Update a specific feature flag.

**Endpoint:** `PUT /api/feature-flags/:id`

**Parameters:**
- `id` (string): Flag ID

**Request Body:**
```json
{
  "enabled": true,
  "environments": {
    "production": false,
    "staging": true
  },
  "rolloutPercentage": 50
}
```

**Response:** `200 OK`
```json
{
  "message": "Feature flag updated",
  "flag": {
    "id": "enhanced-risk-monitoring",
    "enabled": true,
    "environments": {
      "production": false,
      "staging": true
    },
    "rolloutPercentage": 50,
    "updatedAt": "2024-03-15T09:30:00.000Z"
  }
}
```

**Error Response:** `404 Not Found`
```json
{
  "error": "Feature flag not found"
}
```

---

## CI Pipeline API

### Get CI Runs

Retrieve all CI pipeline runs.

**Endpoint:** `GET /api/ci`

**Response:** `200 OK`
```json
{
  "runs": [
    {
      "id": "ci-1698765432000",
      "name": "Main CI Pipeline",
      "branch": "main",
      "commit": "a1b2c3d",
      "status": "success",
      "startTime": "2024-03-15T09:25:00.000Z",
      "endTime": "2024-03-15T09:27:30.000Z",
      "duration": 150,
      "steps": [
        {
          "name": "Lint",
          "status": "success",
          "duration": 15
        },
        {
          "name": "Build",
          "status": "success",
          "duration": 90
        },
        {
          "name": "Test",
          "status": "success",
          "duration": 45
        }
      ]
    }
  ]
}
```

---

### Start CI Run

Trigger a new CI pipeline run.

**Endpoint:** `POST /api/ci`

**Request Body:**
```json
{
  "branch": "main",
  "commit": "a1b2c3d",
  "buildCache": true,
  "runTests": true,
  "deploy": false
}
```

**Response:** `200 OK`
```json
{
  "message": "CI run started",
  "run": {
    "id": "ci-1698765432000",
    "status": "running",
    "startTime": "2024-03-15T09:30:00.000Z"
  }
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid request parameters",
  "details": "..."
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "..."
}
```

---

## Rate Limits

Currently no rate limits are enforced. In production, consider:

- 100 requests per minute per IP
- 1000 requests per hour per user
- Burst allowance of 20 requests

---

## Authentication

**Current Status**: No authentication implemented (demo application)

**Production Considerations**:
- API keys for service-to-service calls
- JWT tokens for user authentication
- OAuth 2.0 for third-party integrations
- Role-based access control (RBAC)

---

## Webhooks (Future)

Consider implementing webhooks for:
- Checklist completion notifications
- Canary deployment status changes
- Feature flag updates
- CI pipeline results
- Connectivity alerts

---

## SDK Examples

### JavaScript/TypeScript

```typescript
// Run checklist
const response = await fetch('/api/checklist', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ environment: 'production' })
})
const result = await response.json()

// Start canary deployment
const deployment = await fetch('/api/canary', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'v2.1.0',
    version: '2.1.0',
    environment: 'production',
    stages: [...],
    healthThresholds: {...}
  })
})
```

---

For more information, see [ARCHITECTURE.md](./ARCHITECTURE.md) and [README.md](../README.md).
