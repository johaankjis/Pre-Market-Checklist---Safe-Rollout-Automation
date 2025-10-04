import { Activity, AlertCircle, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { FeedStatus } from "@/lib/types/connectivity"

interface FeedStatusCardProps {
  feed: FeedStatus
}

export function FeedStatusCard({ feed }: FeedStatusCardProps) {
  const statusConfig = {
    active: {
      color: "text-success",
      badge: "default" as const,
      icon: Activity,
    },
    stale: {
      color: "text-warning",
      badge: "secondary" as const,
      icon: Clock,
    },
    disconnected: {
      color: "text-destructive",
      badge: "destructive" as const,
      icon: AlertCircle,
    },
  }

  const config = statusConfig[feed.status]
  const StatusIcon = config.icon

  const timeSinceHeartbeat = Math.floor((Date.now() - new Date(feed.lastHeartbeat).getTime()) / 1000)

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <StatusIcon className={`h-4 w-4 ${config.color}`} />
            <h3 className="font-medium text-foreground">{feed.name}</h3>
          </div>
          <Badge variant={config.badge} className="text-xs">
            {feed.status}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Msg/sec</p>
            <p className="font-mono font-medium text-foreground">{feed.messagesPerSecond.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Lag</p>
            <p className="font-mono font-medium text-foreground">{feed.lag}ms</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Heartbeat</p>
            <p className="font-mono text-xs text-muted-foreground">{timeSinceHeartbeat}s ago</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
