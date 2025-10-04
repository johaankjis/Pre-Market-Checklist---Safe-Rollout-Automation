import { type NextRequest, NextResponse } from "next/server"
import { featureFlagManager } from "@/lib/feature-flags/flag-manager"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (id) {
    const flag = featureFlagManager.getFlag(id)
    if (!flag) {
      return NextResponse.json({ error: "Flag not found" }, { status: 404 })
    }
    return NextResponse.json(flag)
  }

  const flags = featureFlagManager.getAllFlags()
  return NextResponse.json(flags)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const flag = featureFlagManager.createFlag(body)
    return NextResponse.json(flag)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create flag" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json()
    const flag = featureFlagManager.updateFlag(id, updates)

    if (!flag) {
      return NextResponse.json({ error: "Flag not found" }, { status: 404 })
    }

    return NextResponse.json(flag)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update flag" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Flag ID required" }, { status: 400 })
    }

    const success = featureFlagManager.deleteFlag(id)

    if (!success) {
      return NextResponse.json({ error: "Flag not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete flag" }, { status: 500 })
  }
}
