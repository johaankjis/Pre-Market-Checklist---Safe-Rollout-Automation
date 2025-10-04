import type { FeedStatus } from "@/lib/types/connectivity"

export function generateMockFeeds(): FeedStatus[] {
  const now = new Date()

  return [
    {
      name: "NYSE Market Data",
      type: "market-data",
      connected: true,
      lastHeartbeat: new Date(now.getTime() - 1000).toISOString(),
      messagesPerSecond: 12500,
      lag: 2,
      status: "active",
    },
    {
      name: "NASDAQ Market Data",
      type: "market-data",
      connected: true,
      lastHeartbeat: new Date(now.getTime() - 800).toISOString(),
      messagesPerSecond: 15200,
      lag: 1,
      status: "active",
    },
    {
      name: "BATS Market Data",
      type: "market-data",
      connected: true,
      lastHeartbeat: new Date(now.getTime() - 15000).toISOString(),
      messagesPerSecond: 450,
      lag: 15,
      status: "stale",
    },
    {
      name: "Reference Data Feed",
      type: "reference-data",
      connected: true,
      lastHeartbeat: new Date(now.getTime() - 2000).toISOString(),
      messagesPerSecond: 50,
      lag: 0,
      status: "active",
    },
    {
      name: "Execution Gateway",
      type: "execution",
      connected: false,
      lastHeartbeat: new Date(now.getTime() - 120000).toISOString(),
      messagesPerSecond: 0,
      lag: 120,
      status: "disconnected",
    },
  ]
}
