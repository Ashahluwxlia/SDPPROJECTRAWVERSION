import { NextResponse } from "next/server"
import { hashPassword } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createToken } from "@/lib/auth"
import { sendEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email, and password are required",
        },
        { status: 400 },
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters long",
        },
        { status: 400 },
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email already in use",
        },
        { status: 400 },
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create avatar from initials
    const initials = name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
    const avatar = `/placeholder.svg?height=100&width=100&text=${initials}`

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        avatar,
        role: "member",
        preferences: {
          create: {
            theme: "system",
            notifications: true,
          },
        },
      },
    })

    // Create token
    const token = await createToken(user)

    // Set cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
      message: "Registration successful",
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

    // Log the registration activity
    try {
      await prisma.activityLog.create({
        data: {
          action: "register",
          details: `User registered`,
          entityType: "user",
          entityId: user.id,
          userId: user.id,
        },
      })
    } catch (logError) {
      console.error("Failed to log registration activity:", logError)
      // Continue with registration even if logging fails
    }

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name)
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError)
      // Continue with registration even if email fails
    }

    return response
  } catch (error) {
    console.error("Registration error:", error)
    const errorMessage = error instanceof Error ? error.message : "An error occurred during registration"
    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      { status: 500 },
    )
  }
}

// Send a welcome email
async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  const subject = "Welcome to TaskTogether!"
  const text = `Hi ${name},\n\nWelcome to TaskTogether! We're excited to have you on board.\n\nBest regards,\nThe TaskTogether Team`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to TaskTogether, ${name}!</h2>
      <p>Thank you for signing up. We're excited to help you organize your tasks and boost your productivity.</p>
      <p>Click the button below to get started:</p>
      <div style="text-align: center; margin: 25px 0;">
        <a href="${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/dashboard" 
           style="background-color: #6366F1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Go to Dashboard
        </a>
      </div>
      <p>If you have any questions, feel free to reply to this email.</p>
      <p>Happy task managing!</p>
      <p>The TaskTogether Team</p>
    </div>
  `

  await sendEmail({ to: email, subject, text, html })
}
