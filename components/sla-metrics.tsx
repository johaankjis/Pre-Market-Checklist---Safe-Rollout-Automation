import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { SLAMetrics } from "@/lib/types/connectivity"

interface SLAMetricsProps {
  endpoint: string
  metrics: SLAMetrics
}

export function SLAMetricsCard({ endpoint, metrics }: SLAMetricsProps) {
  const availabilityColor =
    metrics.availability >= 99.9 ? "text-success" : metrics.availability >= 99 ? "text-warning" : "text-destructive"

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{endpoint}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Availability</span>
            <span className={`text-lg font-bold font-mono ${availabilityColor}`}>
              {metrics.availability.toFixed(2)}%
            </span>
          </div>
          <Progress value={metrics.availability} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Avg Latency</p>
            <p className="font-mono font-medium text-foreground">{metrics.avgLatency.toFixed(1)}ms</p>
          </div>
          <div>
            <p className="text-muted-foreground">P95 Latency</p>
            <p className="font-mono font-medium text-foreground">{metrics.p95Latency.toFixed(1)}ms</p>
          </div>
          <div>
            <p className="text-muted-foreground">P99 Latency</p>
            <p className="font-mono font-medium text-foreground">{metrics.p99Latency.toFixed(1)}ms</p>
          </div>
          <div>
            <p className="text-muted-foreground">Error Rate</p>
            <p className="font-mono font-medium text-foreground">{metrics.errorRate.toFixed(2)}%</p>
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Total Requests: <span className="font-mono">{metrics.totalRequests}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
