import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-actions"
import { isDemoMode } from "@/lib/auth.server"

export async function GET() {
  try {
    // Check if we're in demo mode
    const demoMode = await isDemoMode()

    if (demoMode) {
      // Return demo user profile
      return NextResponse.json({
        id: "demo-user",
        name: "Demo User",
        email: "demo@example.com",
        avatar: "/placeholder.svg?height=100&width=100&text=DU",
        role: "demo",
        isDemo: true,
        createdAt: new Date().toISOString(),
      })
    }

    // Get the current authenticated user
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Return user profile without sensitive information
    const { password, ...safeUser } = user

    return NextResponse.json({
      ...safeUser,
      isDemo: false,
    })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
  }
}
