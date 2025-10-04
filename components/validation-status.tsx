import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { ValidationResult } from "@/lib/types/config"

interface ValidationStatusProps {
  result: ValidationResult
}

export function ValidationStatus({ result }: ValidationStatusProps) {
  const criticalErrors = result.errors.filter((e) => e.severity === "critical")
  const normalErrors = result.errors.filter((e) => e.severity === "error")

  if (result.valid && result.warnings.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-success" />
        <span className="text-sm font-medium text-success">All checks passed</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      {criticalErrors.length > 0 && (
        <Badge variant="destructive" className="gap-1.5">
          <XCircle className="h-3.5 w-3.5" />
          {criticalErrors.length} Critical
        </Badge>
      )}
      {normalErrors.length > 0 && (
        <Badge variant="destructive" className="gap-1.5 bg-destructive/80">
          <XCircle className="h-3.5 w-3.5" />
          {normalErrors.length} Error{normalErrors.length !== 1 ? "s" : ""}
        </Badge>
      )}
      {result.warnings.length > 0 && (
        <Badge variant="secondary" className="gap-1.5 bg-warning/20 text-warning-foreground">
          <AlertTriangle className="h-3.5 w-3.5" />
          {result.warnings.length} Warning{result.warnings.length !== 1 ? "s" : ""}
        </Badge>
      )}
    </div>
  )
}
