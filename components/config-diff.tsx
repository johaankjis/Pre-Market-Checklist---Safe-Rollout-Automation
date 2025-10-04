import { Plus, Minus, ArrowRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { ConfigDiffType } from "@/lib/types/config"

interface ConfigDiffProps {
  diff: ConfigDiffType
}

export function ConfigDiffComponent({ diff }: ConfigDiffProps) {
  const hasChanges = diff.added.length > 0 || diff.removed.length > 0 || diff.modified.length > 0

  if (!hasChanges) {
    return (
      <Card className="p-4">
        <p className="text-sm text-muted-foreground">No changes detected</p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {diff.added.map((field, index) => (
        <Card key={`added-${index}`} className="border-success/50 bg-success/5 p-4">
          <div className="flex items-center gap-3">
            <Plus className="h-4 w-4 text-success" />
            <code className="text-sm font-mono text-foreground">{field}</code>
            <span className="text-xs text-success">Added</span>
          </div>
        </Card>
      ))}

      {diff.removed.map((field, index) => (
        <Card key={`removed-${index}`} className="border-destructive/50 bg-destructive/5 p-4">
          <div className="flex items-center gap-3">
            <Minus className="h-4 w-4 text-destructive" />
            <code className="text-sm font-mono text-foreground">{field}</code>
            <span className="text-xs text-destructive">Removed</span>
          </div>
        </Card>
      ))}

      {diff.modified.map((change, index) => (
        <Card key={`modified-${index}`} className="border-primary/50 bg-primary/5 p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <ArrowRight className="h-4 w-4 text-primary" />
              <code className="text-sm font-mono text-foreground">{change.field}</code>
              <span className="text-xs text-primary">Modified</span>
            </div>
            <div className="flex items-center gap-3 pl-7 text-sm">
              <span className="text-muted-foreground">{JSON.stringify(change.oldValue)}</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <span className="text-foreground font-medium">{JSON.stringify(change.newValue)}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
