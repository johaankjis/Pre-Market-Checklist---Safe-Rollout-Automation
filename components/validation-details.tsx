import { XCircle, AlertTriangle, Info } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { ValidationResult } from "@/lib/types/config"

interface ValidationDetailsProps {
  result: ValidationResult
}

export function ValidationDetails({ result }: ValidationDetailsProps) {
  if (result.valid && result.warnings.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {result.errors.map((error, index) => (
        <Card key={`error-${index}`} className="border-destructive/50 bg-destructive/5 p-4">
          <div className="flex gap-3">
            <XCircle className="h-5 w-5 shrink-0 text-destructive" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono text-foreground">{error.field}</code>
                {error.severity === "critical" && (
                  <span className="text-xs font-medium text-destructive">CRITICAL</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{error.message}</p>
            </div>
          </div>
        </Card>
      ))}

      {result.warnings.map((warning, index) => (
        <Card key={`warning-${index}`} className="border-warning/50 bg-warning/5 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
            <div className="flex-1 space-y-1">
              <code className="text-sm font-mono text-foreground">{warning.field}</code>
              <p className="text-sm text-muted-foreground">{warning.message}</p>
              {warning.suggestion && (
                <div className="flex items-start gap-2 mt-2 pt-2 border-t border-warning/20">
                  <Info className="h-4 w-4 shrink-0 text-warning/70 mt-0.5" />
                  <p className="text-xs text-muted-foreground">{warning.suggestion}</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
