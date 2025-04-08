import { NextResponse } from "next/server"
import { removeAuthCookie, getAuthToken } from "@/lib/auth.server"
import { deleteSession } from "@/lib/auth"

export async function POST() {
  try {
    // Get the current token
    const token = await getAuthToken()

    // If there's a token, delete the session
    if (token) {
      await deleteSession(token)
    }

    // Remove auth cookies
    await removeAuthCookie()

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "An error occurred during logout",
      },
      { status: 500 },
    )
  }
}
