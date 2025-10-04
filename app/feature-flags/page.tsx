"use client"

import { useState, useEffect } from "react"
import { Flag, Plus } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FeatureFlagCard } from "@/components/feature-flag-card"
import { CIRunCard } from "@/components/ci-run-card"
import type { FeatureFlag, CIRun } from "@/lib/types/feature-flags"

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [ciRuns, setCIRuns] = useState<CIRun[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadFlags()
    loadCIRuns()
  }, [])

  const loadFlags = async () => {
    try {
      const response = await fetch("/api/feature-flags")
      const data = await response.json()
      setFlags(data)
    } catch (error) {
      console.error("[v0] Failed to load flags:", error)
    }
  }

  const loadCIRuns = async () => {
    try {
      const response = await fetch("/api/ci?type=runs")
      const data = await response.json()
      setCIRuns(data)
    } catch (error) {
      console.error("[v0] Failed to load CI runs:", error)
    }
  }

  const toggleFlag = async (id: string) => {
    try {
      const response = await fetch("/api/feature-flags/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      const updatedFlag = await response.json()
      setFlags(flags.map((f) => (f.id === id ? updatedFlag : f)))
    } catch (error) {
      console.error("[v0] Failed to toggle flag:", error)
    }
  }

  const updateFlag = async (id: string, updates: Partial<FeatureFlag>) => {
    try {
      const response = await fetch("/api/feature-flags", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      })
      const updatedFlag = await response.json()
      setFlags(flags.map((f) => (f.id === id ? updatedFlag : f)))
    } catch (error) {
      console.error("[v0] Failed to update flag:", error)
    }
  }

  const runCI = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/ci", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          configId: "ci-1",
          branch: "main",
          commit: "abc123def456",
          triggeredBy: "manual",
        }),
      })
      const run = await response.json()
      setCIRuns([run, ...ciRuns])
    } catch (error) {
      console.error("[v0] Failed to run CI:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Flag className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">Feature Flags & CI</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="flags" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="flags">Feature Flags</TabsTrigger>
            <TabsTrigger value="ci">CI Integration</TabsTrigger>
          </TabsList>

          <TabsContent value="flags" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Feature Flags</CardTitle>
                    <CardDescription>Manage feature toggles and gradual rollouts</CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Flag
                  </Button>
                </div>
              </CardHeader>
            </Card>

            <div className="grid gap-4">
              {flags.map((flag) => (
                <FeatureFlagCard key={flag.id} flag={flag} onToggle={toggleFlag} onUpdate={updateFlag} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ci" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>CI Integration</CardTitle>
                    <CardDescription>
                      Automated checks for config validation, connectivity, and pre-market readiness
                    </CardDescription>
                  </div>
                  <Button onClick={runCI} disabled={loading}>
                    {loading ? "Running..." : "Run CI Checks"}
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {ciRuns.length > 0 ? (
              <div className="grid gap-4">
                {ciRuns.map((run) => (
                  <CIRunCard key={run.id} run={run} />
                ))}
              </div>
            ) : (
              <Card className="p-12">
                <div className="text-center space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">No CI Runs Yet</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      Run CI checks to validate configs, test connectivity, and verify pre-market readiness
                    </p>
                    <Button onClick={runCI} disabled={loading} size="lg">
                      Run CI Checks
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
