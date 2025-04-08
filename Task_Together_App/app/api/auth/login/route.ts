import { NextResponse } from "next/server"
import { verifyPassword, createToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { email, password, isDemoMode } = await request.json()

    // Handle demo mode login
    if (isDemoMode) {
      const response = NextResponse.json({
        success: true,
        message: "Demo mode activated",
      })

      // Set demo mode cookie
      response.cookies.set({
        name: "demo_mode",
        value: "true",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
        sameSite: "lax",
      })

      // Set a demo auth token
      response.cookies.set({
        name: "auth_token",
        value: "demo-token",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
        sameSite: "lax",
      })

      return response
    }

    // Validate input for real users
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required",
        },
        { status: 400 },
      )
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 },
      )
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 },
      )
    }

    // Create token
    const token = await createToken(user)

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
      message: "Login successful",
    })

    // Set the auth cookie in the response
    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
      sameSite: "lax",
    })

    // Ensure demo mode is turned off
    response.cookies.delete("demo_mode")

    // Log the login activity
    try {
      await prisma.activityLog.create({
        data: {
          action: "login",
          details: `User logged in`,
          entityType: "user",
          entityId: user.id,
          userId: user.id,
        },
      })
    } catch (logError) {
      console.error("Failed to log login activity:", logError)
      // Continue with login even if logging fails
    }

    return response
  } catch (error) {
    console.error("Login error:", error)
    const errorMessage = error instanceof Error ? error.message : "An error occurred during login"
    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      { status: 500 },
    )
  }
}
