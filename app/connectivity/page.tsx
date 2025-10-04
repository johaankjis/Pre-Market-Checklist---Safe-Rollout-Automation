"use client"

import { useState, useEffect } from "react"
import { RefreshCw, Wifi } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EndpointStatus } from "@/components/endpoint-status"
import { FeedStatusCard } from "@/components/feed-status"
import { SLAMetricsCard } from "@/components/sla-metrics"
import type { EndpointHealth, FeedStatus, SLAMetrics } from "@/lib/types/connectivity"

export default function ConnectivityPage() {
  const [endpoints, setEndpoints] = useState<EndpointHealth[]>([])
  const [feeds, setFeeds] = useState<FeedStatus[]>([])
  const [sla, setSla] = useState<Array<{ endpoint: string; metrics: SLAMetrics | null }>>([])
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>("")

  useEffect(() => {
    loadConnectivityData()
    const interval = setInterval(loadConnectivityData, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const loadConnectivityData = async () => {
    try {
      const response = await fetch("/api/connectivity")
      const data = await response.json()
      setEndpoints(data.endpoints)
      setFeeds(data.feeds)
      setSla(data.sla)
      setLastUpdate(data.timestamp)
    } catch (error) {
      console.error("[v0] Failed to load connectivity data:", error)
    }
  }

  const runHealthChecks = async () => {
    setLoading(true)
    try {
      await fetch("/api/connectivity", { method: "POST" })
      await loadConnectivityData()
    } catch (error) {
      console.error("[v0] Health check failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const healthyCount = endpoints.filter((e) => e.status === "healthy").length
  const degradedCount = endpoints.filter((e) => e.status === "degraded").length
  const downCount = endpoints.filter((e) => e.status === "down").length

  const activeFeeds = feeds.filter((f) => f.status === "active").length
  const staleFeeds = feeds.filter((f) => f.status === "stale").length
  const disconnectedFeeds = feeds.filter((f) => f.status === "disconnected").length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wifi className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">Connectivity Monitor</h1>
            </div>
            <div className="flex items-center gap-3">
              {lastUpdate && (
                <span className="text-sm text-muted-foreground">
                  Last update: {new Date(lastUpdate).toLocaleTimeString()}
                </span>
              )}
              <Button onClick={runHealthChecks} disabled={loading} size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid gap-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Endpoint Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-success" />
                    <span className="text-sm text-foreground">{healthyCount} Healthy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-warning" />
                    <span className="text-sm text-foreground">{degradedCount} Degraded</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-destructive" />
                    <span className="text-sm text-foreground">{downCount} Down</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Feed Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-success" />
                    <span className="text-sm text-foreground">{activeFeeds} Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-warning" />
                    <span className="text-sm text-foreground">{staleFeeds} Stale</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-destructive" />
                    <span className="text-sm text-foreground">{disconnectedFeeds} Disconnected</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed View */}
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Real-time connectivity status, feed health, and SLA metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="endpoints" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
                  <TabsTrigger value="feeds">Data Feeds</TabsTrigger>
                  <TabsTrigger value="sla">SLA Metrics</TabsTrigger>
                </TabsList>

                <TabsContent value="endpoints" className="mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    {endpoints.map((endpoint) => (
                      <EndpointStatus key={endpoint.name} endpoint={endpoint} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="feeds" className="mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    {feeds.map((feed) => (
                      <FeedStatusCard key={feed.name} feed={feed} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="sla" className="mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    {sla
                      .filter((s) => s.metrics !== null)
                      .map((s) => (
                        <SLAMetricsCard key={s.endpoint} endpoint={s.endpoint} metrics={s.metrics!} />
                      ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
