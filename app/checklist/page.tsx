"use client"

import { useState } from "react"
import { Play, ListChecks } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChecklistSummary } from "@/components/checklist-summary"
import { ChecklistItemCard } from "@/components/checklist-item"
import type { ChecklistRun } from "@/lib/types/checklist"

export default function ChecklistPage() {
  const [environment, setEnvironment] = useState("production")
  const [checklistRun, setChecklistRun] = useState<ChecklistRun | null>(null)
  const [running, setRunning] = useState(false)

  const runChecklist = async () => {
    setRunning(true)
    try {
      const response = await fetch("/api/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ environment }),
      })
      const data = await response.json()
      setChecklistRun(data)
    } catch (error) {
      console.error("[v0] Checklist execution failed:", error)
    } finally {
      setRunning(false)
    }
  }

  const groupedItems = checklistRun?.items.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, typeof checklistRun.items>,
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ListChecks className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">Pre-Market Checklist</h1>
            </div>
            <div className="flex items-center gap-3">
              <Select value={environment} onValueChange={setEnvironment}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={runChecklist} disabled={running}>
                <Play className="h-4 w-4 mr-2" />
                {running ? "Running..." : "Run Checklist"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid gap-6">
          {checklistRun ? (
            <>
              {/* Summary */}
              <ChecklistSummary run={checklistRun} />

              {/* Detailed Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Check Results</CardTitle>
                  <CardDescription>Detailed results for all pre-market checks</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-6">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="config">Config</TabsTrigger>
                      <TabsTrigger value="connectivity">Connectivity</TabsTrigger>
                      <TabsTrigger value="feeds">Feeds</TabsTrigger>
                      <TabsTrigger value="risk">Risk</TabsTrigger>
                      <TabsTrigger value="system">System</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-6 space-y-3">
                      {checklistRun.items.map((item) => (
                        <ChecklistItemCard key={item.id} item={item} />
                      ))}
                    </TabsContent>

                    {Object.entries(groupedItems || {}).map(([category, items]) => (
                      <TabsContent key={category} value={category} className="mt-6 space-y-3">
                        {items.map((item) => (
                          <ChecklistItemCard key={item.id} item={item} />
                        ))}
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="p-12">
              <div className="text-center space-y-4">
                <ListChecks className="h-16 w-16 text-muted-foreground mx-auto" />
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">Ready to Run Pre-Market Checks</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Select an environment and click "Run Checklist" to begin automated pre-market validation
                  </p>
                  <Button onClick={runChecklist} disabled={running} size="lg">
                    <Play className="h-5 w-5 mr-2" />
                    Start Checklist
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
