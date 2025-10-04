import { NextResponse } from "next/server"
import { healthChecker } from "@/lib/connectivity/health-checker"
import { generateMockFeeds } from "@/lib/mock-data/feeds"

const endpoints = ["NYSE", "NASDAQ", "BATS", "ReferenceData", "ExecutionGateway"]

export async function GET() {
  // Run health checks for all endpoints
  const checks = await Promise.all(
    endpoints.map((endpoint) =>
      healthChecker.checkEndpoint(`https://api.${endpoint.toLowerCase()}.example.com`, endpoint),
    ),
  )

  // Get health status for each endpoint
  const healthStatuses = endpoints.map((endpoint) => healthChecker.getEndpointHealth(endpoint)).filter(Boolean)

  // Get SLA metrics
  const slaMetrics = endpoints.map((endpoint) => ({
    endpoint,
    metrics: healthChecker.getSLAMetrics(endpoint),
  }))

  // Get feed statuses
  const feeds = generateMockFeeds()

  return NextResponse.json({
    endpoints: healthStatuses,
    sla: slaMetrics,
    feeds,
    timestamp: new Date().toISOString(),
  })
}

export async function POST() {
  // Clear history and run fresh checks
  healthChecker.clearHistory()

  const checks = await Promise.all(
    endpoints.map((endpoint) =>
      healthChecker.checkEndpoint(`https://api.${endpoint.toLowerCase()}.example.com`, endpoint),
    ),
  )

  return NextResponse.json({
    message: "Health checks completed",
    checks,
  })
}
