import { Circle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { EndpointHealth } from "@/lib/types/connectivity"

interface EndpointStatusProps {
  endpoint: EndpointHealth
}

export function EndpointStatus({ endpoint }: EndpointStatusProps) {
  const statusColors = {
    healthy: "text-success",
    degraded: "text-warning",
    down: "text-destructive",
  }

  const statusBadges = {
    healthy: "default",
    degraded: "secondary",
    down: "destructive",
  } as const

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">{endpoint.name}</CardTitle>
          <Badge variant={statusBadges[endpoint.status]} className="gap-1.5">
            <Circle className={`h-2 w-2 fill-current ${statusColors[endpoint.status]}`} />
            {endpoint.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Latency</p>
            <p className="font-mono font-medium text-foreground">{endpoint.latency.toFixed(1)}ms</p>
          </div>
          <div>
            <p className="text-muted-foreground">Uptime</p>
            <p className="font-mono font-medium text-foreground">{endpoint.uptime.toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Error Rate</p>
            <p className="font-mono font-medium text-foreground">{endpoint.errorRate.toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Last Check</p>
            <p className="font-mono text-xs text-muted-foreground">
              {new Date(endpoint.lastCheck).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
