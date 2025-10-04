"use client"

import { Rocket, CheckCircle2, XCircle, RotateCcw, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import type { CanaryDeployment } from "@/lib/types/canary"

interface CanaryDeploymentCardProps {
  deployment: CanaryDeployment
  onRollback?: (deploymentId: string) => void
  onViewDetails?: (deploymentId: string) => void
}

export function CanaryDeploymentCard({ deployment, onRollback, onViewDetails }: CanaryDeploymentCardProps) {
  const statusConfig = {
    pending: {
      icon: Clock,
      color: "text-muted-foreground",
      badge: "secondary" as const,
    },
    running: {
      icon: Rocket,
      color: "text-primary",
      badge: "default" as const,
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
    rolled_back: {
      icon: RotateCcw,
      color: "text-warning",
      badge: "secondary" as const,
    },
  }

  const config = statusConfig[deployment.status]
  const StatusIcon = config.icon

  const progress = (deployment.currentStage / deployment.totalStages) * 100

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusIcon className={`h-5 w-5 ${config.color}`} />
            <div>
              <CardTitle className="text-base">{deployment.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                v{deployment.version} • {deployment.environment}
              </p>
            </div>
          </div>
          <Badge variant={config.badge}>{deployment.status.replace("_", " ")}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Deployment Progress</span>
            <span className="text-sm text-muted-foreground">
              Stage {deployment.currentStage} / {deployment.totalStages}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Health Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Error Rate</p>
            <p className="text-lg font-semibold text-foreground">{deployment.healthMetrics.errorRate.toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Latency P95</p>
            <p className="text-lg font-semibold text-foreground">{deployment.healthMetrics.latencyP95.toFixed(0)}ms</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Success Rate</p>
            <p className="text-lg font-semibold text-foreground">{deployment.healthMetrics.successRate.toFixed(1)}%</p>
          </div>
        </div>

        {/* Rollback Reason */}
        {deployment.rollbackReason && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive font-medium">Rollback Reason:</p>
            <p className="text-sm text-destructive/80 mt-1">{deployment.rollbackReason}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => onViewDetails?.(deployment.id)} className="flex-1">
            View Details
          </Button>
          {deployment.status === "running" && (
            <Button variant="destructive" size="sm" onClick={() => onRollback?.(deployment.id)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Rollback
            </Button>
          )}
        </div>

        {/* Timestamps */}
        <div className="pt-4 border-t border-border text-xs text-muted-foreground">
          <p>Started: {new Date(deployment.startTime).toLocaleString()}</p>
          {deployment.endTime && <p>Ended: {new Date(deployment.endTime).toLocaleString()}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
