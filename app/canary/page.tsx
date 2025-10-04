"use client"

import { useState, useEffect } from "react"
import { Rocket, Plus } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { CanaryDeploymentCard } from "@/components/canary-deployment-card"
import { CanaryStageCard } from "@/components/canary-stage-card"
import type { CanaryDeployment, CanaryConfig } from "@/lib/types/canary"

export default function CanaryPage() {
  const [deployments, setDeployments] = useState<CanaryDeployment[]>([])
  const [selectedDeployment, setSelectedDeployment] = useState<CanaryDeployment | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState<CanaryConfig>({
    name: "Strategy Update",
    version: "1.0.0",
    environment: "production",
    stages: [
      { trafficPercentage: 10, duration: 5 },
      { trafficPercentage: 25, duration: 10 },
      { trafficPercentage: 50, duration: 15 },
      { trafficPercentage: 100, duration: 5 },
    ],
    healthThresholds: {
      maxErrorRate: 2.0,
      maxLatencyP95: 200,
      minSuccessRate: 98.0,
    },
    autoRollback: true,
  })

  useEffect(() => {
    loadDeployments()
    const interval = setInterval(loadDeployments, 3000)
    return () => clearInterval(interval)
  }, [])

  const loadDeployments = async () => {
    try {
      const response = await fetch("/api/canary")
      const data = await response.json()
      setDeployments(data)

      // Update selected deployment if viewing details
      if (selectedDeployment) {
        const updated = data.find((d: CanaryDeployment) => d.id === selectedDeployment.id)
        if (updated) {
          setSelectedDeployment(updated)
        }
      }
    } catch (error) {
      console.error("[v0] Failed to load deployments:", error)
    }
  }

  const startDeployment = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/canary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const deployment = await response.json()
      setDeployments([deployment, ...deployments])
      setDialogOpen(false)
    } catch (error) {
      console.error("[v0] Failed to start deployment:", error)
    } finally {
      setLoading(false)
    }
  }

  const rollbackDeployment = async (deploymentId: string) => {
    try {
      await fetch("/api/canary/rollback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deploymentId,
          reason: "Manual rollback requested",
        }),
      })
      loadDeployments()
    } catch (error) {
      console.error("[v0] Failed to rollback deployment:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Rocket className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">Canary Deployments</h1>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Deployment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Start Canary Deployment</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Deployment Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="version">Version</Label>
                      <Input
                        id="version"
                        value={formData.version}
                        onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="environment">Environment</Label>
                    <Select
                      value={formData.environment}
                      onValueChange={(v) => setFormData({ ...formData, environment: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="production">Production</SelectItem>
                        <SelectItem value="staging">Staging</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Health Thresholds</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="maxError" className="text-xs">
                          Max Error Rate (%)
                        </Label>
                        <Input
                          id="maxError"
                          type="number"
                          step="0.1"
                          value={formData.healthThresholds.maxErrorRate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              healthThresholds: {
                                ...formData.healthThresholds,
                                maxErrorRate: Number.parseFloat(e.target.value),
                              },
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxLatency" className="text-xs">
                          Max Latency P95 (ms)
                        </Label>
                        <Input
                          id="maxLatency"
                          type="number"
                          value={formData.healthThresholds.maxLatencyP95}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              healthThresholds: {
                                ...formData.healthThresholds,
                                maxLatencyP95: Number.parseInt(e.target.value),
                              },
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="minSuccess" className="text-xs">
                          Min Success Rate (%)
                        </Label>
                        <Input
                          id="minSuccess"
                          type="number"
                          step="0.1"
                          value={formData.healthThresholds.minSuccessRate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              healthThresholds: {
                                ...formData.healthThresholds,
                                minSuccessRate: Number.parseFloat(e.target.value),
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoRollback">Auto Rollback on Failure</Label>
                    <Switch
                      id="autoRollback"
                      checked={formData.autoRollback}
                      onCheckedChange={(checked) => setFormData({ ...formData, autoRollback: checked })}
                    />
                  </div>

                  <Button onClick={startDeployment} disabled={loading} className="w-full">
                    Start Deployment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {selectedDeployment ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => setSelectedDeployment(null)}>
                ← Back
              </Button>
              <h2 className="text-lg font-semibold text-foreground">
                {selectedDeployment.name} - v{selectedDeployment.version}
              </h2>
            </div>

            <div className="grid gap-4">
              {selectedDeployment.stages.map((stage) => (
                <CanaryStageCard
                  key={stage.stage}
                  stage={stage}
                  isActive={stage.stage === selectedDeployment.currentStage}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {deployments.length > 0 ? (
              <div className="grid gap-4">
                {deployments.map((deployment) => (
                  <CanaryDeploymentCard
                    key={deployment.id}
                    deployment={deployment}
                    onRollback={rollbackDeployment}
                    onViewDetails={setSelectedDeployment}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-12">
                <div className="text-center space-y-4">
                  <Rocket className="h-16 w-16 text-muted-foreground mx-auto" />
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">No Deployments Yet</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      Start your first canary deployment to gradually roll out changes with automated health monitoring
                    </p>
                    <Button onClick={() => setDialogOpen(true)} size="lg">
                      <Plus className="h-5 w-5 mr-2" />
                      New Deployment
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
