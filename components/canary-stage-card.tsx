import { CheckCircle2, XCircle, Clock, Loader2, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { CanaryStage } from "@/lib/types/canary"

interface CanaryStageCardProps {
  stage: CanaryStage
  isActive: boolean
}

export function CanaryStageCard({ stage, isActive }: CanaryStageCardProps) {
  const statusConfig = {
    pending: {
      icon: Clock,
      color: "text-muted-foreground",
      badge: "secondary" as const,
    },
    running: {
      icon: Loader2,
      color: "text-primary",
      badge: "default" as const,
      animate: true,
    },
    completed: {
      icon: CheckCircle2,
      color: "text-success",
      badge: "default" as const,
    },
    failed: {
      icon: XCircle,
      color: "text-destructive",
      badge: "destructive" as const,
    },
  }

  const config = statusConfig[stage.status]
  const StatusIcon = config.icon

  const passedChecks = stage.healthChecks.filter((c) => c.status === "passed").length
  const totalChecks = stage.healthChecks.length
  const healthProgress = (passedChecks / totalChecks) * 100

  return (
    <Card className={isActive ? "border-primary" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusIcon className={`h-5 w-5 ${config.color} ${config.animate ? "animate-spin" : ""}`} />
            <div>
              <CardTitle className="text-base">{stage.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {stage.duration} min • {stage.trafficPercentage}% traffic
              </p>
            </div>
          </div>
          <Badge variant={config.badge}>{stage.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health Checks */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Health Checks</span>
            <span className="text-sm text-muted-foreground">
              {passedChecks} / {totalChecks}
            </span>
          </div>
          <Progress value={healthProgress} className="h-2 mb-3" />
          <div className="space-y-2">
            {stage.healthChecks.map((check) => (
              <div key={check.name} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{check.name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-foreground">
                    {check.actual.toFixed(2)} / {check.threshold.toFixed(2)}
                  </span>
                  {check.status === "passed" && <CheckCircle2 className="h-4 w-4 text-success" />}
                  {check.status === "failed" && <XCircle className="h-4 w-4 text-destructive" />}
                  {check.status === "pending" && <Clock className="h-4 w-4 text-muted-foreground" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Metrics */}
        {stage.metrics.requests > 0 && (
          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Stage Metrics</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Requests</p>
                <p className="text-lg font-semibold text-foreground">{stage.metrics.requests.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Errors</p>
                <p className="text-lg font-semibold text-foreground">{stage.metrics.errors}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Latency</p>
                <p className="text-lg font-semibold text-foreground">{stage.metrics.avgLatency}ms</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Max Latency</p>
                <p className="text-lg font-semibold text-foreground">{stage.metrics.maxLatency}ms</p>
              </div>
            </div>
          </div>
        )}

        {/* Timestamps */}
        {stage.startTime && (
          <div className="pt-4 border-t border-border text-xs text-muted-foreground">
            <p>Started: {new Date(stage.startTime).toLocaleString()}</p>
            {stage.endTime && <p>Ended: {new Date(stage.endTime).toLocaleString()}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
