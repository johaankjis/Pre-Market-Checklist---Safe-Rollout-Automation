# Component Library Documentation

This document provides detailed information about all React components in the application.

## Component Structure

```
components/
├── ui/                          # Base UI components (shadcn/ui)
└── *.tsx                        # Feature-specific components
```

## Table of Contents

1. [Feature Components](#feature-components)
2. [UI Components](#ui-components)
3. [Component Patterns](#component-patterns)
4. [Styling Guidelines](#styling-guidelines)

---

## Feature Components

### SystemHealthOverview

Displays overall system health status across multiple categories.

**Location:** `components/system-health-overview.tsx`

**Props:**
```typescript
interface SystemHealthProps {
  configStatus: "healthy" | "warning" | "error"
  connectivityStatus: "healthy" | "warning" | "error"
  checklistStatus: "healthy" | "warning" | "error"
  canaryStatus: "healthy" | "warning" | "error"
}
```

**Usage:**
```tsx
<SystemHealthOverview
  configStatus="healthy"
  connectivityStatus="warning"
  checklistStatus="healthy"
  canaryStatus="healthy"
/>
```

**Features:**
- Visual indicators for each system category
- Color-coded status badges
- Icon representation of health states
- Responsive grid layout

---

### ChecklistSummary

Displays aggregated summary of checklist results.

**Location:** `components/checklist-summary.tsx`

**Props:**
```typescript
interface ChecklistSummaryProps {
  run: ChecklistRun
}
```

**Usage:**
```tsx
<ChecklistSummary run={checklistRun} />
```

**Displays:**
- Total checks executed
- Pass/fail/warning counts
- Overall status badge
- Execution duration
- Timestamp

---

### ChecklistItemCard

Displays individual checklist item details.

**Location:** `components/checklist-item.tsx`

**Props:**
```typescript
interface ChecklistItemProps {
  item: ChecklistItem
}
```

**Usage:**
```tsx
<ChecklistItemCard item={checklistItem} />
```

**Features:**
- Status icon (✓ passed, ✗ failed, ⚠ warning)
- Check name and category
- Execution duration
- Error message or details (if applicable)
- Timestamp
- Color-coded background

---

### CanaryDeploymentCard

Displays canary deployment information.

**Location:** `components/canary-deployment-card.tsx`

**Props:**
```typescript
interface CanaryDeploymentCardProps {
  deployment: CanaryDeployment
  onProgress?: (id: string) => void
  onRollback?: (id: string) => void
}
```

**Usage:**
```tsx
<CanaryDeploymentCard
  deployment={deployment}
  onProgress={handleProgress}
  onRollback={handleRollback}
/>
```

**Features:**
- Deployment name and version
- Current stage progress
- Health metrics visualization
- Action buttons (progress, rollback)
- Status indicator

---

### CanaryStageCard

Displays individual canary stage information.

**Location:** `components/canary-stage-card.tsx`

**Props:**
```typescript
interface CanaryStageCardProps {
  stage: CanaryStage
  isActive: boolean
}
```

**Usage:**
```tsx
<CanaryStageCard stage={stage} isActive={true} />
```

**Features:**
- Stage number and traffic percentage
- Duration information
- Health check results
- Metrics (requests, errors, latency)
- Active stage highlighting

---

### EndpointStatus

Displays connectivity status for an endpoint.

**Location:** `components/endpoint-status.tsx`

**Props:**
```typescript
interface EndpointStatusProps {
  endpoint: EndpointHealth
}
```

**Usage:**
```tsx
<EndpointStatus endpoint={endpointHealth} />
```

**Displays:**
- Endpoint name
- Status indicator
- Latency metrics
- Success rate
- Uptime percentage
- Last check timestamp

---

### FeedStatus

Displays market data feed status.

**Location:** `components/feed-status.tsx`

**Props:**
```typescript
interface FeedStatusProps {
  feed: Feed
}
```

**Usage:**
```tsx
<FeedStatus feed={feedData} />
```

**Displays:**
- Feed name and status
- Current latency
- Data lag time
- Last update timestamp
- Health indicator

---

### SLAMetrics

Displays SLA metrics for endpoints.

**Location:** `components/sla-metrics.tsx`

**Props:**
```typescript
interface SLAMetricsProps {
  metrics: SLAMetrics
  endpoint: string
}
```

**Usage:**
```tsx
<SLAMetrics metrics={slaData} endpoint="NYSE" />
```

**Displays:**
- Uptime percentage
- Average latency
- P95 and P99 latency
- Error rate
- Total/failed check counts

---

### ValidationStatus

Displays configuration validation status.

**Location:** `components/validation-status.tsx`

**Props:**
```typescript
interface ValidationStatusProps {
  result: ValidationResult
}
```

**Usage:**
```tsx
<ValidationStatus result={validationResult} />
```

**Features:**
- Valid/invalid indicator
- Error count with severity
- Warning count
- Timestamp
- Visual status badge

---

### ValidationDetails

Displays detailed validation errors and warnings.

**Location:** `components/validation-details.tsx`

**Props:**
```typescript
interface ValidationDetailsProps {
  result: ValidationResult
}
```

**Usage:**
```tsx
<ValidationDetails result={validationResult} />
```

**Displays:**
- List of errors with field paths
- Error severity indicators
- Warning messages
- Suggestions for fixes
- Collapsible sections

---

### ConfigDiff

Displays configuration differences between versions.

**Location:** `components/config-diff.tsx`

**Props:**
```typescript
interface ConfigDiffProps {
  diff: ConfigDiffType
}
```

**Usage:**
```tsx
<ConfigDiff diff={configDiff} />
```

**Features:**
- Added fields (green)
- Removed fields (red)
- Modified fields (blue)
- Old vs new value comparison
- Field path display

---

### FeatureFlagCard

Displays and controls a feature flag.

**Location:** `components/feature-flag-card.tsx`

**Props:**
```typescript
interface FeatureFlagCardProps {
  flag: FeatureFlag
  onUpdate: (id: string, updates: Partial<FeatureFlag>) => void
}
```

**Usage:**
```tsx
<FeatureFlagCard
  flag={featureFlag}
  onUpdate={handleUpdate}
/>
```

**Features:**
- Flag name and description
- Toggle switch for enable/disable
- Environment-specific toggles
- Rollout percentage slider
- Last updated timestamp

---

### CIRunCard

Displays CI pipeline run information.

**Location:** `components/ci-run-card.tsx`

**Props:**
```typescript
interface CIRunCardProps {
  run: CIRun
}
```

**Usage:**
```tsx
<CIRunCard run={ciRun} />
```

**Displays:**
- Run ID and status
- Branch and commit info
- Step-by-step progress
- Duration
- Success/failure indication

---

### MetricsGrid

Displays a grid of metric cards.

**Location:** `components/metrics-grid.tsx`

**Props:**
```typescript
interface MetricsGridProps {
  metrics: Array<{
    label: string
    value: number | string
    change?: number
    trend?: "up" | "down" | "neutral"
    unit?: string
  }>
}
```

**Usage:**
```tsx
<MetricsGrid metrics={metricsArray} />
```

**Features:**
- Responsive grid layout
- Metric cards with labels and values
- Trend indicators (↑ ↓ →)
- Change percentages
- Color-coded trends

---

### RecentActivity

Displays a feed of recent system activities.

**Location:** `components/recent-activity.tsx`

**Props:**
```typescript
interface RecentActivityProps {
  activities: Activity[]
  maxItems?: number
}
```

**Usage:**
```tsx
<RecentActivity activities={activityList} maxItems={10} />
```

**Displays:**
- Activity type icons
- Activity titles
- Status indicators
- Timestamps (relative)
- Details text

---

## UI Components

The application uses [shadcn/ui](https://ui.shadcn.com/) components built on Radix UI primitives. All UI components are located in `components/ui/`.

### Core UI Components

#### Button
**File:** `components/ui/button.tsx`

```tsx
<Button variant="default" size="default" onClick={handleClick}>
  Click Me
</Button>
```

**Variants:**
- `default` - Primary button
- `destructive` - Danger/delete actions
- `outline` - Secondary button
- `ghost` - Minimal button
- `link` - Link-styled button

**Sizes:**
- `default` - Standard size
- `sm` - Small
- `lg` - Large
- `icon` - Square icon button

---

#### Card
**File:** `components/ui/card.tsx`

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    Footer content
  </CardFooter>
</Card>
```

---

#### Badge
**File:** `components/ui/badge.tsx`

```tsx
<Badge variant="default">Label</Badge>
```

**Variants:**
- `default` - Default badge
- `secondary` - Secondary style
- `destructive` - Error/danger
- `outline` - Outlined style

---

#### Dialog
**File:** `components/ui/dialog.tsx`

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    <div>Dialog content</div>
    <DialogFooter>
      <Button>Close</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

#### Select
**File:** `components/ui/select.tsx`

```tsx
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

---

#### Tabs
**File:** `components/ui/tabs.tsx`

```tsx
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

---

#### Progress
**File:** `components/ui/progress.tsx`

```tsx
<Progress value={75} />
```

---

#### Toast
**File:** `components/ui/toast.tsx`

```tsx
import { useToast } from "@/hooks/use-toast"

const { toast } = useToast()

toast({
  title: "Success",
  description: "Operation completed successfully",
})
```

---

## Component Patterns

### Client Components

Components that use React hooks or browser APIs must be client components:

```tsx
"use client"

import { useState } from "react"

export function InteractiveComponent() {
  const [state, setState] = useState(false)
  // ...
}
```

### Server Components

Components without interactivity can be server components (default in App Router):

```tsx
// No "use client" directive needed
export function StaticComponent({ data }) {
  return <div>{data}</div>
}
```

### Composition Pattern

Build complex UIs by composing smaller components:

```tsx
export function ChecklistPage() {
  return (
    <div>
      <ChecklistSummary run={run} />
      {run.items.map(item => (
        <ChecklistItemCard key={item.id} item={item} />
      ))}
    </div>
  )
}
```

### Prop Drilling vs Context

**Current approach**: Props are passed down through components

**For future**: Consider React Context for deeply nested props

```tsx
// Example of Context (not currently used)
const ChecklistContext = createContext<ChecklistRun | null>(null)

export function ChecklistProvider({ children, run }) {
  return (
    <ChecklistContext.Provider value={run}>
      {children}
    </ChecklistContext.Provider>
  )
}
```

---

## Styling Guidelines

### Tailwind CSS Classes

Use utility classes for styling:

```tsx
<div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
  Content
</div>
```

### Conditional Classes

Use `clsx` or `cn` utility for conditional classes:

```tsx
import { cn } from "@/lib/utils"

<div className={cn(
  "base-class",
  isActive && "active-class",
  variant === "primary" && "primary-class"
)} />
```

### Component Variants

Use `class-variance-authority` for variant-based styling:

```tsx
import { cva } from "class-variance-authority"

const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "default-classes",
        outline: "outline-classes"
      },
      size: {
        default: "default-size",
        sm: "small-size"
      }
    }
  }
)
```

### Color Scheme

The application uses CSS variables for theming:

```css
/* Success states */
.text-success
.bg-success
.border-success

/* Warning states */
.text-warning
.bg-warning
.border-warning

/* Error states */
.text-destructive
.bg-destructive
.border-destructive

/* Neutral states */
.text-muted-foreground
.bg-card
.border-border
```

---

## Accessibility

All components follow accessibility best practices:

1. **Semantic HTML**: Use appropriate HTML elements
2. **ARIA Labels**: Add labels for screen readers
3. **Keyboard Navigation**: Support tab and arrow keys
4. **Focus Management**: Visible focus indicators
5. **Color Contrast**: Meet WCAG AA standards

```tsx
<button
  aria-label="Close dialog"
  aria-pressed={isActive}
  onClick={handleClick}
>
  <X className="h-4 w-4" />
</button>
```

---

## Performance Tips

1. **Memoization**: Use `React.memo()` for expensive components
2. **Lazy Loading**: Use `React.lazy()` for code splitting
3. **Virtual Scrolling**: For large lists (not currently implemented)
4. **Debouncing**: Debounce search and filter inputs
5. **Image Optimization**: Use next/image for images

---

## Testing Components (Future)

Recommended testing approach:

```tsx
import { render, screen } from "@testing-library/react"
import { ChecklistItemCard } from "./checklist-item"

describe("ChecklistItemCard", () => {
  it("renders passed status correctly", () => {
    const item = {
      id: "test",
      name: "Test Check",
      category: "config",
      status: "passed"
    }
    
    render(<ChecklistItemCard item={item} />)
    expect(screen.getByText("Test Check")).toBeInTheDocument()
  })
})
```

---

## Contributing Components

When creating new components:

1. Place in appropriate directory (ui/ or components/)
2. Use TypeScript for type safety
3. Follow existing naming conventions
4. Add JSDoc comments for complex props
5. Export component as named export
6. Include usage examples in comments

```tsx
/**
 * Displays system metrics in a grid layout
 * 
 * @example
 * <MetricsGrid metrics={[
 *   { label: "Users", value: 1000, trend: "up" }
 * ]} />
 */
export function MetricsGrid({ metrics }: MetricsGridProps) {
  // Implementation
}
```

---

For architecture details, see [ARCHITECTURE.md](./ARCHITECTURE.md).
