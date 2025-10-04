import { CheckCircle2, XCircle, AlertTriangle, Clock, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ChecklistItem } from "@/lib/types/checklist"

interface ChecklistItemCardProps {
  item: ChecklistItem
}

export function ChecklistItemCard({ item }: ChecklistItemCardProps) {
  const statusConfig = {
    pending: {
      icon: Clock,
      color: "text-muted-foreground",
      badge: "secondary" as const,
    },
    running: {
      icon: Loader2,
      color: "text-primary",
      badge: "secondary" as const,
      animate: true,
    },
    passed: {
      icon: CheckCircle2,
      color: "text-success",
      badge: "default" as const,
    },
    warning: {
      icon: AlertTriangle,
      color: "text-warning",
      badge: "secondary" as const,
    },
    failed: {
      icon: XCircle,
      color: "text-destructive",
      badge: "destructive" as const,
    },
  }

  const config = statusConfig[item.status]
  const StatusIcon = config.icon

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <StatusIcon className={`h-5 w-5 ${config.color} ${config.animate ? "animate-spin" : ""}`} />
          <div>
            <h3 className="font-medium text-foreground">{item.name}</h3>
            <p className="text-sm text-muted-foreground capitalize">{item.category}</p>
          </div>
        </div>
        <Badge variant={config.badge} className="text-xs">
          {item.status}
        </Badge>
      </div>

      {item.message && <p className="text-sm text-foreground mt-2 ml-8">{item.message}</p>}

      {item.details && <p className="text-xs text-muted-foreground mt-1 ml-8">{item.details}</p>}

      {item.duration !== undefined && (
        <p className="text-xs text-muted-foreground mt-2 ml-8">Duration: {item.duration}ms</p>
      )}
    </Card>
  )
}
