import { type NextRequest, NextResponse } from "next/server"
import { validateConfig, compareConfigs } from "@/lib/validation/config-validator"
import { mockConfigs } from "@/lib/mock-data/configs"
import type { StrategyConfig } from "@/lib/types/config"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { config, compareWith } = body as {
      config: StrategyConfig
      compareWith?: string
    }

    // Validate the config
    const validationResult = validateConfig(config)

    // If compareWith is provided, generate diff
    let diff = null
    if (compareWith && mockConfigs[compareWith]) {
      diff = compareConfigs(mockConfigs[compareWith], config)
    }

    return NextResponse.json({
      validation: validationResult,
      diff,
    })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const env = searchParams.get("env") || "production"

  const config = mockConfigs[env]
  if (!config) {
    return NextResponse.json({ error: "Environment not found" }, { status: 404 })
  }

  const validationResult = validateConfig(config)

  return NextResponse.json({
    config,
    validation: validationResult,
  })
}
