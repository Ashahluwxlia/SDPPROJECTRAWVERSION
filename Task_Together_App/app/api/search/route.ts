import { type NextRequest, NextResponse } from "next/server"
import { searchTasks } from "@/lib/board-actions"
import { getCurrentUser } from "@/lib/auth-actions"

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const searchParams = req.nextUrl.searchParams
  const query = searchParams.get("q") || ""
  const page = Number.parseInt(searchParams.get("page") || "1", 10)
  const limit = Number.parseInt(searchParams.get("limit") || "20", 10)

  if (!query) {
    return NextResponse.json({ error: "Search query is required" }, { status: 400 })
  }

  try {
    const results = await searchTasks(query, page, limit)

    return NextResponse.json(results)
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "An error occurred while searching" }, { status: 500 })
  }
}

