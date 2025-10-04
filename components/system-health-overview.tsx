"use client"

import { CheckCircle2, XCircle, AlertTriangle, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SystemHealthProps {
  configStatus: "healthy" | "warning" | "error"
  connectivityStatus: "healthy" | "warning" | "error"
  checklistStatus: "healthy" | "warning" | "error"
  canaryStatus: "healthy" | "warning" | "error"
}

export function SystemHealthOverview({
  configStatus,
  connectivityStatus,
  checklistStatus,
  canaryStatus,
}: SystemHealthProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "healthy":
        return {
          icon: CheckCircle2,
          color: "text-success",
          bg: "bg-success/10",
          badge: "default" as const,
        }
      case "warning":
        return {
          icon: AlertTriangle,
          color: "text-warning",
          bg: "bg-warning/10",
          badge: "secondary" as const,
        }
      case "error":
        return {
          icon: XCircle,
          color: "text-destructive",
          bg: "bg-destructive/10",
          badge: "destructive" as const,
        }
      default:
        return {
          icon: Activity,
          color: "text-muted-foreground",
          bg: "bg-secondary",
          badge: "secondary" as const,
        }
    }
  }

  const systems = [
    { name: "Config Validation", status: configStatus },
    { name: "Connectivity", status: connectivityStatus },
    { name: "Pre-Market Checklist", status: checklistStatus },
    { name: "Canary Deployment", status: canaryStatus },
  ]

  const overallStatus = systems.some((s) => s.status === "error")
    ? "error"
    : systems.some((s) => s.status === "warning")
      ? "warning"
      : "healthy"

  const overallConfig = getStatusConfig(overallStatus)
  const OverallIcon = overallConfig.icon

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>System Health Overview</CardTitle>
          <div className="flex items-center gap-2">
            <OverallIcon className={`h-5 w-5 ${overallConfig.color}`} />
            <Badge variant={overallConfig.badge} className="capitalize">
              {overallStatus}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {systems.map((system) => {
            const config = getStatusConfig(system.status)
            const Icon = config.icon
            return (
              <div key={system.name} className={`flex items-center gap-3 p-4 rounded-lg ${config.bg}`}>
                <Icon className={`h-5 w-5 ${config.color}`} />
                <div>
                  <p className="text-sm font-medium text-foreground">{system.name}</p>
                  <p className={`text-xs ${config.color} capitalize`}>{system.status}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
