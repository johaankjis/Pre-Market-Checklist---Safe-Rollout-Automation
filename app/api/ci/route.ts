import { type NextRequest, NextResponse } from "next/server"
import { ciManager } from "@/lib/ci/ci-manager"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")

  if (type === "runs") {
    const runs = ciManager.getAllRuns()
    return NextResponse.json(runs)
  }

  const configs = ciManager.getAllConfigs()
  return NextResponse.json(configs)
}

export async function POST(request: NextRequest) {
  try {
    const { configId, branch, commit, triggeredBy } = await request.json()
    const run = await ciManager.runCI(configId, branch, commit, triggeredBy)
    return NextResponse.json(run)
  } catch (error) {
    return NextResponse.json({ error: "Failed to run CI" }, { status: 500 })
  }
}
