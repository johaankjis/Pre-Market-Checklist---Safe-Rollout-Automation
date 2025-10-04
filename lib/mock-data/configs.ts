import type { StrategyConfig } from "@/lib/types/config"

export const mockConfigs: Record<string, StrategyConfig> = {
  production: {
    name: "momentum-strategy-v2",
    version: "2.1.0",
    enabled: true,
    riskLimits: [
      {
        symbol: "AAPL",
        maxNotional: 5000000,
        maxPosition: 10000,
        maxOrderSize: 1000,
        enabled: true,
      },
      {
        symbol: "MSFT",
        maxNotional: 3000000,
        maxPosition: 8000,
        maxOrderSize: 800,
        enabled: true,
      },
      {
        symbol: "GOOGL",
        maxNotional: 4000000,
        maxPosition: 5000,
        maxOrderSize: 500,
        enabled: true,
      },
    ],
    venues: [
      {
        name: "NYSE",
        enabled: true,
        apiEndpoint: "https://api.nyse.example.com",
        timeout: 2000,
        maxRetries: 3,
      },
      {
        name: "NASDAQ",
        enabled: true,
        apiEndpoint: "https://api.nasdaq.example.com",
        timeout: 1500,
        maxRetries: 3,
      },
      {
        name: "BATS",
        enabled: false,
        apiEndpoint: "https://api.bats.example.com",
        timeout: 2000,
        maxRetries: 2,
      },
    ],
    routing: [
      {
        symbol: "AAPL",
        venue: "NASDAQ",
        priority: 1,
        conditions: { minLiquidity: 100000 },
      },
      {
        symbol: "MSFT",
        venue: "NASDAQ",
        priority: 1,
        conditions: { minLiquidity: 80000 },
      },
      {
        symbol: "GOOGL",
        venue: "NASDAQ",
        priority: 1,
        conditions: { minLiquidity: 50000 },
      },
    ],
    parameters: {
      lookbackPeriod: 20,
      entryThreshold: 0.02,
      exitThreshold: 0.01,
      maxHoldingPeriod: 300,
    },
  },
  staging: {
    name: "momentum-strategy-v2",
    version: "2.2.0-beta",
    enabled: true,
    riskLimits: [
      {
        symbol: "AAPL",
        maxNotional: 1000000,
        maxPosition: 2000,
        maxOrderSize: 200,
        enabled: true,
      },
    ],
    venues: [
      {
        name: "NYSE",
        enabled: true,
        apiEndpoint: "https://staging-api.nyse.example.com",
        timeout: 3000,
        maxRetries: 3,
      },
    ],
    routing: [
      {
        symbol: "AAPL",
        venue: "NYSE",
        priority: 1,
        conditions: { minLiquidity: 50000 },
      },
    ],
    parameters: {
      lookbackPeriod: 15,
      entryThreshold: 0.025,
      exitThreshold: 0.015,
      maxHoldingPeriod: 200,
    },
  },
  invalid: {
    name: "",
    version: "invalid",
    enabled: true,
    riskLimits: [
      {
        symbol: "AAPL",
        maxNotional: -1000,
        maxPosition: 0,
        maxOrderSize: 5000,
        enabled: true,
      },
    ],
    venues: [
      {
        name: "BadVenue",
        enabled: true,
        apiEndpoint: "not-a-url",
        timeout: 50,
        maxRetries: 0,
      },
    ],
    routing: [
      {
        symbol: "TSLA",
        venue: "NonExistentVenue",
        priority: 200,
        conditions: {},
      },
    ],
    parameters: {},
  },
}
