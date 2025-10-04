import { type NextRequest, NextResponse } from "next/server"
import { featureFlagManager } from "@/lib/feature-flags/flag-manager"

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json()
    const flag = featureFlagManager.toggleFlag(id)

    if (!flag) {
      return NextResponse.json({ error: "Flag not found" }, { status: 404 })
    }

    return NextResponse.json(flag)
  } catch (error) {
    return NextResponse.json({ error: "Failed to toggle flag" }, { status: 500 })
  }
}
