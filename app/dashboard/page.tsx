"use client"

import { useState } from "react"
import { Activity, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SystemHealthOverview } from "@/components/system-health-overview"
import { RecentActivity } from "@/components/recent-activity"
import { MetricsGrid } from "@/components/metrics-grid"
import Link from "next/link"

export default function DashboardPage() {
  const [loading, setLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  // Mock data - in production, this would come from APIs
  const [systemHealth] = useState({
    configStatus: "healthy" as const,
    connectivityStatus: "healthy" as const,
    checklistStatus: "warning" as const,
    canaryStatus: "healthy" as const,
  })

  const [metrics] = useState([
    { label: "Config Validations", value: 247, change: 12, trend: "up" as const, unit: "today" },
    { label: "Endpoint Health", value: "99.8", change: 0.2, trend: "up" as const, unit: "%" },
    { label: "Checklist Pass Rate", value: "94.5", change: -2.1, trend: "down" as const, unit: "%" },
    { label: "Active Canaries", value: 3, trend: "neutral" as const },
    { label: "Feature Flags", value: 5, change: 1, trend: "up" as const },
    { label: "CI Runs", value: 42, change: 8, trend: "up" as const, unit: "today" },
    { label: "Avg Response Time", value: 45, change: -5, trend: "up" as const, unit: "ms" },
    { label: "Error Rate", value: "0.02", change: -15, trend: "up" as const, unit: "%" },
  ])

  const [activities] = useState([
    {
      id: "1",
      type: "ci" as const,
      title: "CI Pipeline Completed",
      status: "success" as const,
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      details: "All checks passed in 2.3s",
    },
    {
      id: "2",
      type: "canary" as const,
      title: "Canary Deployment Started",
      status: "success" as const,
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      details: "v2.1.0 rolling out to 25% of traffic",
    },
    {
      id: "3",
      type: "checklist" as const,
      title: "Pre-Market Checklist Warning",
      status: "warning" as const,
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      details: "Market data feed latency above threshold",
    },
    {
      id: "4",
      type: "feature-flag" as const,
      title: "Feature Flag Updated",
      status: "success" as const,
      timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
      details: "Enhanced Risk Monitoring enabled in production",
    },
    {
      id: "5",
      type: "validation" as const,
      title: "Config Validation Completed",
      status: "success" as const,
      timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
      details: "Production config validated successfully",
    },
    {
      id: "6",
      type: "connectivity" as const,
      title: "Connectivity Check Passed",
      status: "success" as const,
      timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
      details: "All endpoints responding normally",
    },
  ])

  const handleRefresh = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLastRefresh(new Date())
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl font-semibold text-foreground">Operations Dashboard</h1>
                <p className="text-xs text-muted-foreground">Last updated: {lastRefresh.toLocaleTimeString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Link href="/">
                <Button variant="outline" size="sm">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* System Health */}
          <SystemHealthOverview {...systemHealth} />

          {/* Metrics Grid */}
          <MetricsGrid metrics={metrics} />

          {/* Recent Activity */}
          <RecentActivity activities={activities} />

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link href="/">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 bg-transparent">
                <span className="font-semibold">Config Validation</span>
                <span className="text-xs text-muted-foreground">Validate strategy configs</span>
              </Button>
            </Link>
            <Link href="/connectivity">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 bg-transparent">
                <span className="font-semibold">Connectivity Monitor</span>
                <span className="text-xs text-muted-foreground">Check endpoint health</span>
              </Button>
            </Link>
            <Link href="/checklist">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 bg-transparent">
                <span className="font-semibold">Pre-Market Checklist</span>
                <span className="text-xs text-muted-foreground">Run automated checks</span>
              </Button>
            </Link>
            <Link href="/canary">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 bg-transparent">
                <span className="font-semibold">Canary Deployments</span>
                <span className="text-xs text-muted-foreground">Manage rollouts</span>
              </Button>
            </Link>
            <Link href="/feature-flags">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 bg-transparent">
                <span className="font-semibold">Feature Flags</span>
                <span className="text-xs text-muted-foreground">Toggle features & CI</span>
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
