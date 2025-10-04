# Architecture Documentation

## Overview

The Pre-Market Checklist & Safe Rollout Automation platform is built as a modern web application using Next.js 15 with the App Router pattern. The architecture follows a clean separation of concerns with distinct layers for presentation, business logic, and data management.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (Client)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Dashboard  │  │  Checklist  │  │   Canary    │   ...   │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   Next.js App Router                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              React Server Components                    │ │
│  │  • Server-side rendering                                │ │
│  │  • Streaming                                            │ │
│  │  • Data fetching                                        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Routes                              │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌─────────┐ │
│  │ Checklist │  │  Canary   │  │Validation │  │  CI/CD  │ │
│  └───────────┘  └───────────┘  └───────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                      │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ ChecklistEngine  │  │  CanaryEngine    │                │
│  └──────────────────┘  └──────────────────┘                │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ ConfigValidator  │  │  HealthChecker   │                │
│  └──────────────────┘  └──────────────────┘                │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  FlagManager     │  │   CIManager      │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

## Layer Breakdown

### 1. Presentation Layer (app/, components/)

**Components Directory Structure:**
```
components/
├── ui/                          # Base UI components (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ...
├── canary-deployment-card.tsx   # Feature-specific components
├── checklist-item.tsx
├── system-health-overview.tsx
└── ...
```

**App Routes Structure:**
```
app/
├── page.tsx                     # Home - Config Validation
├── dashboard/page.tsx           # System Dashboard
├── checklist/page.tsx           # Pre-Market Checklist
├── connectivity/page.tsx        # Connectivity Monitor
├── canary/page.tsx              # Canary Deployments
├── feature-flags/page.tsx       # Feature Flags
└── api/                         # API Routes
    ├── checklist/route.ts
    ├── canary/route.ts
    ├── validate/route.ts
    └── ...
```

**Key Characteristics:**
- Server and Client Components mixed appropriately
- Client Components marked with `"use client"` directive
- Responsive design with Tailwind CSS
- Accessible UI with Radix UI primitives

### 2. API Layer (app/api/)

Each API route follows the Next.js App Router convention:

```typescript
// Example: app/api/checklist/route.ts
export async function POST(request: NextRequest) {
  // Handle POST request
}

export async function GET() {
  // Handle GET request
}
```

**API Endpoints:**
- `/api/checklist` - Checklist execution
- `/api/validate` - Configuration validation
- `/api/connectivity` - Connectivity checks
- `/api/canary` - Canary deployments
- `/api/feature-flags` - Feature flag management
- `/api/ci` - CI pipeline control

### 3. Business Logic Layer (lib/)

#### ChecklistEngine (`lib/checklist/checklist-engine.ts`)

Orchestrates pre-market validation checks across multiple categories:

```typescript
export class ChecklistEngine {
  async runChecklist(environment: string): Promise<ChecklistRun>
  private async checkConfigValidity(): Promise<ChecklistItem>
  private async checkEndpointConnectivity(name: string): Promise<ChecklistItem>
  private async checkFeedHealth(feedName: string): Promise<ChecklistItem>
  private async checkRiskLimits(): Promise<ChecklistItem>
  private async checkMemory(): Promise<ChecklistItem>
  private async checkDisk(): Promise<ChecklistItem>
}
```

**Check Categories:**
1. **Config Checks**: Validate strategy configuration, risk limits, venue settings
2. **Connectivity Checks**: Test connection to trading venues (NYSE, NASDAQ, BATS)
3. **Feed Checks**: Monitor market data feed health and latency
4. **Risk Checks**: Verify risk parameters and position limits
5. **System Checks**: Check memory, disk, CPU, clock skew

#### CanaryEngine (`lib/canary/canary-engine.ts`)

Manages progressive deployment rollouts:

```typescript
export class CanaryEngine {
  async startDeployment(config: CanaryConfig): Promise<CanaryDeployment>
  async progressStage(deploymentId: string): Promise<CanaryDeployment>
  async rollback(deploymentId: string, reason: string): Promise<CanaryDeployment>
  private evaluateStageHealth(stage: CanaryStage, config: CanaryConfig): boolean
}
```

**Deployment Flow:**
1. Initialize deployment with stages
2. Start Stage 1 (e.g., 10% traffic)
3. Monitor health metrics
4. If healthy, progress to next stage
5. If unhealthy, trigger automatic rollback
6. Repeat until 100% or failure

#### ConfigValidator (`lib/validation/config-validator.ts`)

Validates trading strategy configurations:

```typescript
export class ConfigValidator {
  validate(config: StrategyConfig): ValidationResult
  private validateBasicFields(config: StrategyConfig): void
  private validateRiskLimits(config: StrategyConfig): void
  private validateVenues(config: StrategyConfig): void
  private validateRouting(config: StrategyConfig): void
}
```

**Validation Categories:**
- Basic fields (name, version, enabled status)
- Risk limits (max notional, position, order size)
- Venue configuration (endpoints, timeouts, retries)
- Routing rules (symbol mapping, priorities)

#### HealthChecker (`lib/connectivity/health-checker.ts`)

Monitors endpoint connectivity and health:

```typescript
export class HealthChecker {
  async checkEndpoint(url: string, name: string): Promise<ConnectivityCheck>
  getEndpointHealth(name: string): EndpointHealth | null
  getSLAMetrics(name: string): SLAMetrics
  clearHistory(): void
}
```

**Tracked Metrics:**
- Latency (average, P95, P99)
- Success rate
- Uptime percentage
- Error rate
- Historical trends

#### FlagManager (`lib/feature-flags/flag-manager.ts`)

Controls feature flags and toggles:

```typescript
export class FlagManager {
  getAllFlags(): FeatureFlag[]
  getFlag(id: string): FeatureFlag | undefined
  updateFlag(id: string, updates: Partial<FeatureFlag>): FeatureFlag
  isEnabled(key: string, environment: string): boolean
}
```

**Flag Types:**
- Feature toggles (on/off)
- Percentage rollouts (0-100%)
- Environment-specific flags
- CI/CD pipeline controls

#### CIManager (`lib/ci/ci-manager.ts`)

Manages CI/CD pipeline execution:

```typescript
export class CIManager {
  async startRun(config: CIConfig): Promise<CIRun>
  getRunStatus(runId: string): CIRun | undefined
  getAllRuns(): CIRun[]
}
```

## Data Flow

### Example: Running a Pre-Market Checklist

```
1. User clicks "Run Checklist" button
   └─> ChecklistPage component (Client)

2. Sends POST request to API
   └─> /api/checklist route handler (Server)

3. API route calls business logic
   └─> ChecklistEngine.runChecklist()

4. Engine executes checks in parallel
   ├─> checkConfigValidity()
   ├─> checkEndpointConnectivity()
   ├─> checkFeedHealth()
   ├─> checkRiskLimits()
   └─> checkMemory()

5. Returns aggregated results
   └─> ChecklistRun object

6. API returns JSON response
   └─> Client updates UI with results

7. User views detailed results
   └─> ChecklistSummary & ChecklistItemCard components
```

## Type System

All types are defined in `lib/types/`:

```
types/
├── canary.ts        # Canary deployment types
├── checklist.ts     # Checklist types
├── config.ts        # Configuration types
├── connectivity.ts  # Connectivity types
└── feature-flags.ts # Feature flag types
```

**Key Type Patterns:**

```typescript
// Status types use discriminated unions
type Status = "pending" | "running" | "passed" | "failed" | "warning"

// Results include timestamps
interface ChecklistRun {
  id: string
  startTime: string
  endTime?: string
  status: Status
  items: ChecklistItem[]
}

// Metrics include thresholds
interface HealthCheck {
  name: string
  status: Status
  threshold: number
  actual: number
}
```

## State Management

**Approach**: Local component state with React hooks

- `useState` for local state
- `useEffect` for side effects
- No global state management (Redux, Zustand, etc.)
- API calls return fresh data on each request

**Rationale**: 
- Simple architecture for this use case
- Server-side rendering reduces need for client state
- Real-time data fetched on demand

## Styling Architecture

**Tailwind CSS v4 Configuration:**

```css
/* styles/globals.css */
@import "tailwindcss";

/* CSS variables for theming */
@theme {
  --color-primary: ...
  --color-success: ...
  --color-warning: ...
}
```

**Component Styling Patterns:**

```tsx
// Utility classes
<div className="flex items-center gap-3 p-4 rounded-lg bg-card">

// Conditional classes with clsx
<Badge variant={status === "passed" ? "default" : "destructive"}>

// Custom variants with class-variance-authority
const buttonVariants = cva("...", {
  variants: { ... }
})
```

## Performance Optimizations

1. **Server Components**: Use RSC for data fetching and static rendering
2. **Code Splitting**: Automatic with Next.js App Router
3. **Image Optimization**: Use next/image for assets
4. **Lazy Loading**: Load heavy components on demand
5. **Parallel Data Fetching**: Run multiple checks concurrently

## Security Considerations

1. **Input Validation**: All user inputs validated on server
2. **Type Safety**: TypeScript prevents type-related bugs
3. **API Route Protection**: Add authentication middleware as needed
4. **Environment Variables**: Sensitive data in .env files
5. **CSP Headers**: Configure Content Security Policy

## Scalability

**Current Architecture**: Monolithic Next.js application

**Future Considerations**:
- Separate API backend for multiple frontends
- Database for persistent storage
- Message queue for async operations
- Microservices for independent scaling
- Caching layer for frequently accessed data

## Testing Strategy

**Current State**: No tests (demo/prototype application)

**Recommended Additions**:
1. **Unit Tests**: Jest for business logic
2. **Component Tests**: React Testing Library
3. **E2E Tests**: Playwright or Cypress
4. **API Tests**: Supertest or similar
5. **Type Checking**: TypeScript compiler

## Deployment Architecture

```
┌─────────────────────────────────────┐
│       Vercel / Cloud Platform       │
│  ┌───────────────────────────────┐  │
│  │     Next.js Application       │  │
│  │  • SSR & Static Generation    │  │
│  │  • API Routes                 │  │
│  │  • Edge Functions             │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│      External Systems (Future)      │
│  • Trading Venues                   │
│  • Market Data Providers            │
│  • Risk Management Systems          │
└─────────────────────────────────────┘
```

## Error Handling

**API Layer:**
```typescript
try {
  const result = await engine.runChecklist(environment)
  return NextResponse.json(result)
} catch (error) {
  return NextResponse.json(
    { error: "Checklist execution failed" },
    { status: 500 }
  )
}
```

**Business Logic Layer:**
```typescript
try {
  // Perform operation
  return { status: "passed", ... }
} catch (error) {
  return {
    status: "failed",
    message: error instanceof Error ? error.message : "Unknown error"
  }
}
```

**UI Layer:**
```typescript
try {
  const response = await fetch("/api/checklist", { method: "POST" })
  const data = await response.json()
  setChecklistRun(data)
} catch (error) {
  console.error("Checklist execution failed:", error)
  // Show error toast/notification
}
```

## Monitoring and Observability

**Current Implementation:**
- Console logging for debugging
- Client-side error boundary (can be added)
- Vercel Analytics integration

**Recommended Additions:**
- Structured logging (Winston, Pino)
- Error tracking (Sentry, Rollbar)
- Performance monitoring (Web Vitals)
- Custom dashboards for metrics
- Alerting for critical failures

## Development Workflow

1. **Local Development**: `npm run dev` with hot reload
2. **Type Checking**: TypeScript compiler continuous checking
3. **Linting**: ESLint with Next.js config
4. **Code Formatting**: Prettier (can be added)
5. **Git Workflow**: Feature branches, pull requests
6. **CI/CD**: Automated builds and deployments

## Best Practices

1. **Separation of Concerns**: UI, API, and business logic separated
2. **Type Safety**: TypeScript for all code
3. **Component Reusability**: shadcn/ui for consistent UI
4. **API Consistency**: RESTful patterns
5. **Error Handling**: Graceful degradation
6. **Documentation**: Code comments and external docs
7. **Performance**: Optimize bundle size and rendering

## Future Enhancements

1. **Real API Integration**: Connect to actual trading systems
2. **Database Layer**: Persist historical data
3. **Authentication**: User management and RBAC
4. **WebSocket Support**: Real-time updates
5. **Advanced Charting**: More detailed visualizations
6. **Alert Configuration**: Customizable alerts
7. **Audit Logging**: Track all system changes
8. **Multi-tenant Support**: Support multiple organizations

---

For more details on specific components, see [COMPONENTS.md](./COMPONENTS.md).
