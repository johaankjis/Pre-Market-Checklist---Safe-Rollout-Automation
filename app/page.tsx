"use client"

import { useState, useEffect } from "react"
import { Activity, CheckCircle2, Wifi, ListChecks, Rocket, Flag, LayoutDashboard } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ValidationStatus } from "@/components/validation-status"
import { ValidationDetails } from "@/components/validation-details"
import { ConfigDiff } from "@/components/config-diff"
import type { StrategyConfig, ValidationResult, ConfigDiff as ConfigDiffType } from "@/lib/types/config"
import Link from "next/link"

export default function HomePage() {
  const [environment, setEnvironment] = useState("production")
  const [config, setConfig] = useState<StrategyConfig | null>(null)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [diff, setDiff] = useState<ConfigDiffType | null>(null)
  const [loading, setLoading] = useState(false)
  const [compareEnv, setCompareEnv] = useState<string>("")

  useEffect(() => {
    loadConfig()
  }, [environment])

  const loadConfig = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/validate?env=${environment}`)
      const data = await response.json()
      setConfig(data.config)
      setValidation(data.validation)

      // If comparing, fetch diff
      if (compareEnv && compareEnv !== environment) {
        const diffResponse = await fetch("/api/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            config: data.config,
            compareWith: compareEnv,
          }),
        })
        const diffData = await diffResponse.json()
        setDiff(diffData.diff)
      } else {
        setDiff(null)
      }
    } catch (error) {
      console.error("[v0] Failed to load config:", error)
    } finally {
      setLoading(false)
    }
  }

  const runValidation = async () => {
    if (!config) return

    setLoading(true)
    try {
      const response = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config,
          compareWith: compareEnv || undefined,
        }),
      })
      const data = await response.json()
      setValidation(data.validation)
      if (data.diff) {
        setDiff(data.diff)
      }
    } catch (error) {
      console.error("[v0] Validation failed:", error)
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
              <Activity className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">Pre-Market Ops Console</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/feature-flags">
                <Button variant="outline" size="sm">
                  <Flag className="h-4 w-4 mr-2" />
                  Feature Flags
                </Button>
              </Link>
              <Link href="/canary">
                <Button variant="outline" size="sm">
                  <Rocket className="h-4 w-4 mr-2" />
                  Canary
                </Button>
              </Link>
              <Link href="/checklist">
                <Button variant="outline" size="sm">
                  <ListChecks className="h-4 w-4 mr-2" />
                  Checklist
                </Button>
              </Link>
              <Link href="/connectivity">
                <Button variant="outline" size="sm">
                  <Wifi className="h-4 w-4 mr-2" />
                  Connectivity
                </Button>
              </Link>
              <Select value={environment} onValueChange={setEnvironment}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="invalid">Invalid (Test)</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={runValidation} disabled={loading}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Run Validation
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid gap-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-6 gap-4">
            <Card className="cursor-pointer hover:border-primary transition-colors">
              <Link href="/dashboard">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <LayoutDashboard className="h-5 w-5 text-primary" />
                    Dashboard
                  </CardTitle>
                  <CardDescription>Unified operations overview</CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors">
              <Link href="/">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Config Validation
                  </CardTitle>
                  <CardDescription>Validate strategy configs and risk limits</CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors">
              <Link href="/connectivity">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wifi className="h-5 w-5 text-primary" />
                    Connectivity Monitor
                  </CardTitle>
                  <CardDescription>Check endpoint health and feed status</CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors">
              <Link href="/checklist">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ListChecks className="h-5 w-5 text-primary" />
                    Pre-Market Checklist
                  </CardTitle>
                  <CardDescription>Run automated pre-market checks</CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors">
              <Link href="/canary">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Rocket className="h-5 w-5 text-primary" />
                    Canary Deployments
                  </CardTitle>
                  <CardDescription>Gradual rollouts with health monitoring</CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors">
              <Link href="/feature-flags">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Flag className="h-5 w-5 text-primary" />
                    Feature Flags
                  </CardTitle>
                  <CardDescription>Manage toggles and CI integration</CardDescription>
                </CardHeader>
              </Link>
            </Card>
          </div>

          {/* Status Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Config Validation Status</CardTitle>
                  <CardDescription>
                    Environment: <span className="font-mono">{environment}</span>
                    {config && (
                      <span className="ml-4">
                        Strategy: <span className="font-mono">{config.name}</span> v{config.version}
                      </span>
                    )}
                  </CardDescription>
                </div>
                {validation && <ValidationStatus result={validation} />}
              </div>
            </CardHeader>
            {validation && (
              <CardContent>
                <ValidationDetails result={validation} />
              </CardContent>
            )}
          </Card>

          {/* Detailed View */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration Details</CardTitle>
              <CardDescription>Review config schema, compare environments, and view validation results</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="validation" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="validation">Validation</TabsTrigger>
                  <TabsTrigger value="diff">Compare</TabsTrigger>
                  <TabsTrigger value="config">Raw Config</TabsTrigger>
                </TabsList>

                <TabsContent value="validation" className="space-y-4 mt-6">
                  {validation ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-3 gap-4">
                        <Card className="bg-card/50">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Critical Errors</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-destructive">
                              {validation.errors.filter((e) => e.severity === "critical").length}
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="bg-card/50">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Errors</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-destructive/80">
                              {validation.errors.filter((e) => e.severity === "error").length}
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="bg-card/50">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Warnings</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-warning">{validation.warnings.length}</div>
                          </CardContent>
                        </Card>
                      </div>
                      <ValidationDetails result={validation} />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Click "Run Validation" to validate the configuration
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="diff" className="space-y-4 mt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm text-muted-foreground">Compare with:</span>
                    <Select value={compareEnv} onValueChange={setCompareEnv}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select env" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="production">Production</SelectItem>
                        <SelectItem value="staging">Staging</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={loadConfig} size="sm" disabled={!compareEnv || loading}>
                      Generate Diff
                    </Button>
                  </div>
                  {diff ? (
                    <ConfigDiff diff={diff} />
                  ) : (
                    <Card className="p-8">
                      <p className="text-sm text-muted-foreground text-center">
                        Select an environment to compare configurations
                      </p>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="config" className="mt-6">
                  {config ? (
                    <Card className="bg-secondary/50">
                      <CardContent className="p-6">
                        <pre className="text-xs font-mono text-foreground overflow-x-auto">
                          {JSON.stringify(config, null, 2)}
                        </pre>
                      </CardContent>
                    </Card>
                  ) : (
                    <p className="text-sm text-muted-foreground">Loading configuration...</p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
