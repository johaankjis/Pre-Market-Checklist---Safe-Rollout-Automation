import { type NextRequest, NextResponse } from "next/server"
import { checklistEngine } from "@/lib/checklist/checklist-engine"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { environment = "production" } = body

    const result = await checklistEngine.runChecklist(environment)

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: "Checklist execution failed" }, { status: 500 })
  }
}

export async function GET() {
  const currentRun = checklistEngine.getCurrentRun()

  if (!currentRun) {
    return NextResponse.json({ error: "No checklist run found" }, { status: 404 })
  }

  return NextResponse.json(currentRun)
}
