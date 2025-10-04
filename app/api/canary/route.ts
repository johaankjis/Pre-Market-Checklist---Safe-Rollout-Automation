import { type NextRequest, NextResponse } from "next/server"
import { canaryEngine } from "@/lib/canary/canary-engine"
import type { CanaryConfig } from "@/lib/types/canary"

export async function POST(request: NextRequest) {
  try {
    const config: CanaryConfig = await request.json()

    const deployment = await canaryEngine.startDeployment(config)

    return NextResponse.json(deployment)
  } catch (error) {
    return NextResponse.json({ error: "Failed to start canary deployment" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const deploymentId = searchParams.get("id")

  if (deploymentId) {
    const deployment = canaryEngine.getDeployment(deploymentId)
    if (!deployment) {
      return NextResponse.json({ error: "Deployment not found" }, { status: 404 })
    }
    return NextResponse.json(deployment)
  }

  const deployments = canaryEngine.getAllDeployments()
  return NextResponse.json(deployments)
}
