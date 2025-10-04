import { type NextRequest, NextResponse } from "next/server"
import { canaryEngine } from "@/lib/canary/canary-engine"

export async function POST(request: NextRequest) {
  try {
    const { deploymentId, reason } = await request.json()

    await canaryEngine.rollbackDeployment(deploymentId, reason)

    const deployment = canaryEngine.getDeployment(deploymentId)
    return NextResponse.json(deployment)
  } catch (error) {
    return NextResponse.json({ error: "Failed to rollback deployment" }, { status: 500 })
  }
}
