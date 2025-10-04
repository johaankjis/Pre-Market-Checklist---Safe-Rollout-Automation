import { CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { ChecklistRun } from "@/lib/types/checklist"

interface ChecklistSummaryProps {
  run: ChecklistRun
}

export function ChecklistSummary({ run }: ChecklistSummaryProps) {
  const progress = ((run.passedChecks + run.failedChecks + run.warningChecks) / run.totalChecks) * 100

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Checklist Summary</CardTitle>
          <div className="flex items-center gap-2">
            {run.status === "running" && <span className="text-sm text-muted-foreground">Running...</span>}
            {run.status === "completed" && <span className="text-sm text-success">Completed</span>}
            {run.status === "failed" && <span className="text-sm text-destructive">Failed</span>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="text-sm font-medium text-foreground">
              {run.passedChecks + run.failedChecks + run.warningChecks} / {run.totalChecks}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <div>
              <p className="text-2xl font-bold text-foreground">{run.passedChecks}</p>
              <p className="text-xs text-muted-foreground">Passed</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-destructive" />
            <div>
              <p className="text-2xl font-bold text-foreground">{run.failedChecks}</p>
              <p className="text-xs text-muted-foreground">Failed</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <div>
              <p className="text-2xl font-bold text-foreground">{run.warningChecks}</p>
              <p className="text-xs text-muted-foreground">Warnings</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold text-foreground">
                {run.duration ? `${(run.duration / 1000).toFixed(1)}s` : "-"}
              </p>
              <p className="text-xs text-muted-foreground">Duration</p>
            </div>
          </div>
        </div>

        {run.startTime && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">Started: {new Date(run.startTime).toLocaleString()}</p>
            {run.endTime && (
              <p className="text-xs text-muted-foreground">Ended: {new Date(run.endTime).toLocaleString()}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
