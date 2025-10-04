"use client"

import { Clock, CheckCircle2, Rocket, Flag, Wifi } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Activity {
  id: string
  type: "validation" | "connectivity" | "checklist" | "canary" | "feature-flag" | "ci"
  title: string
  status: "success" | "warning" | "error"
  timestamp: string
  details?: string
}

interface RecentActivityProps {
  activities: Activity[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "validation":
        return CheckCircle2
      case "connectivity":
        return Wifi
      case "checklist":
        return CheckCircle2
      case "canary":
        return Rocket
      case "feature-flag":
        return Flag
      case "ci":
        return CheckCircle2
      default:
        return Clock
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "success":
        return { color: "text-success", badge: "default" as const }
      case "warning":
        return { color: "text-warning", badge: "secondary" as const }
      case "error":
        return { color: "text-destructive", badge: "destructive" as const }
      default:
        return { color: "text-muted-foreground", badge: "secondary" as const }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.length > 0 ? (
            activities.map((activity) => {
              const Icon = getIcon(activity.type)
              const config = getStatusConfig(activity.status)
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <Icon className={`h-5 w-5 ${config.color} mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                      <Badge variant={config.badge} className="text-xs capitalize shrink-0">
                        {activity.status}
                      </Badge>
                    </div>
                    {activity.details && <p className="text-xs text-muted-foreground mb-1">{activity.details}</p>}
                    <p className="text-xs text-muted-foreground">{new Date(activity.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              )
            })
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
