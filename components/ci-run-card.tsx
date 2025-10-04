import { CheckCircle2, XCircle, Clock, Loader2, GitBranch } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { CIRun } from "@/lib/types/feature-flags"

interface CIRunCardProps {
  run: CIRun
}

export function CIRunCard({ run }: CIRunCardProps) {
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
    success: {
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

  const config = statusConfig[run.status]
  const StatusIcon = config.icon

  const completedChecks = run.checks.filter((c) => c.status === "passed" || c.status === "failed").length
  const progress = (completedChecks / run.checks.length) * 100

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusIcon className={`h-5 w-5 ${config.color} ${config.animate ? "animate-spin" : ""}`} />
            <div>
              <CardTitle className="text-base">CI Run #{run.id.split("-")[1]}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <GitBranch className="h-3 w-3" />
                <span className="font-mono">{run.branch}</span>
                <span>•</span>
                <span className="font-mono text-xs">{run.commit.substring(0, 7)}</span>
              </div>
            </div>
          </div>
          <Badge variant={config.badge}>{run.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Progress</span>
            <span className="text-sm text-muted-foreground">
              {completedChecks} / {run.checks.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Checks */}
        <div className="space-y-2">
          {run.checks.map((check, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-secondary/50 rounded-md">
              <div className="flex items-center gap-2">
                {check.status === "passed" && <CheckCircle2 className="h-4 w-4 text-success" />}
                {check.status === "failed" && <XCircle className="h-4 w-4 text-destructive" />}
                {check.status === "running" && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
                {check.status === "pending" && <Clock className="h-4 w-4 text-muted-foreground" />}
                <span className="text-sm text-foreground">{check.name}</span>
              </div>
              {check.duration && <span className="text-xs text-muted-foreground">{check.duration}ms</span>}
            </div>
          ))}
        </div>

        {/* Metadata */}
        <div className="pt-4 border-t border-border text-xs text-muted-foreground">
          <p>Triggered by: {run.triggeredBy}</p>
          <p>Started: {new Date(run.startTime).toLocaleString()}</p>
          {run.endTime && <p>Ended: {new Date(run.endTime).toLocaleString()}</p>}
          {run.duration && <p>Duration: {(run.duration / 1000).toFixed(1)}s</p>}
        </div>
      </CardContent>
    </Card>
  )
}
