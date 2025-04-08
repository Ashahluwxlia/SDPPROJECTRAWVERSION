"use server"

import { prisma } from "@/lib/prisma"
import { hashPassword, verifyPassword, createToken, verifyToken as authVerifyToken } from "./auth"
import { sendEmail } from "./email"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import crypto from "crypto"
import { setAuthCookie, removeAuthCookie, getAuthToken, isDemoMode } from "@/lib/auth.server"

// Define User type to fix the linter error
interface User {
  id: string
  name: string
  email: string
  password: string
  avatar?: string | null
  role?: string
  createdAt: Date
  updatedAt: Date
  preferences?: {
    theme: string
    notifications: boolean
  }
}

// Define global type for reset tokens
declare global {
  var resetTokens: {
    [key: string]: {
      userId: string
      expiresAt: Date
    }
  }
}

// Initialize global resetTokens if it doesn't exist
if (!global.resetTokens) {
  global.resetTokens = {}
}

// Demo user data
const DEMO_USER: User = {
  id: "demo-user-id",
  name: "Demo User",
  email: "demo@example.com",
  password: "",
  avatar: "/placeholder.svg?height=100&width=100&text=DU",
  role: "demo",
  createdAt: new Date(),
  updatedAt: new Date(),
  preferences: {
    theme: "system",
    notifications: true,
  },
}

/**
 * Get the current user based on their authentication token
 * Returns demo user if in demo mode, real user if authenticated, or null
 */
// First, update the User interface to make password optional when returning
interface User {
  id: string
  name: string
  email: string
  password: string
  avatar?: string | null
  role?: string
  createdAt: Date
  updatedAt: Date
  preferences?: {
    theme: string
    notifications: boolean
  }
}

// Add a new type for user without password
type UserWithoutPassword = Omit<User, 'password'>;

// Then update the getCurrentUser return type and implementation
export async function getCurrentUser(): Promise<UserWithoutPassword | null> {
  try {
    // Check if we're in demo mode
    const demoMode = await isDemoMode()
    if (demoMode) {
      // Return a demo user with consistent data
      return DEMO_USER
    }

    // For real users, get the auth token
    const token = await getAuthToken()
    if (!token) {
      return null
    }

    // Validate the token and get the user ID
    const payload = await verifyToken(token)
    if (!payload || !payload.userId) {
      // Invalid token, remove it
      await removeAuthCookie()
      return null
    }

    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        preferences: true,
      },
    })

    if (!user) {
      // User not found, remove the token
      await removeAuthCookie()
      return null
    }

    // Return the user without the password
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword;
    
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Sign in a user with email and password
 * Supports both real users and demo mode
 */
export async function signIn(formData: FormData): Promise<{ success: boolean; error?: string; redirectUrl?: string }> {
  try {
    const isDemoModeLogin = formData.get("isDemoMode") === "true"

    // Handle demo mode login
    if (isDemoModeLogin) {
      await setAuthCookie("demo-token", true)
      revalidatePath("/dashboard")
      return { success: true, redirectUrl: "/dashboard" }
    }

    // Handle real user login
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
      return { success: false, error: "Email and password are required" }
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return { success: false, error: "Invalid email or password" }
    }

    const isPasswordValid = await verifyPassword(password, user.password)

    if (!isPasswordValid) {
      return { success: false, error: "Invalid email or password" }
    }

    // Create authentication token
    const token = await createToken(user)

    // Set the auth cookie
    await setAuthCookie(token, false)

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: "login",
        details: `User logged in`,
        entityType: "user",
        entityId: user.id,
        userId: user.id,
      },
    })

    revalidatePath("/dashboard")
    return { success: true, redirectUrl: "/dashboard" }
  } catch (error) {
    console.error("Sign in error:", error)
    return { success: false, error: "An error occurred during sign in" }
  }
}

/**
 * Register a new user
 * Supports both real registration and demo mode
 */
export async function registerUser(
  formData: FormData,
): Promise<{ success: boolean; error?: string; redirectUrl?: string }> {
  try {
    const isDemoMode = formData.get("isDemoMode") === "true"

    // Handle demo mode registration
    if (isDemoMode) {
      await setAuthCookie("demo-token", true)
      revalidatePath("/dashboard")
      return { success: true, redirectUrl: "/dashboard" }
    }

    // Handle real user registration
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!name || !email || !password) {
      return { success: false, error: "Name, email, and password are required" }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { success: false, error: "Please enter a valid email address" }
    }

    // Validate password strength
    if (password.length < 8) {
      return { success: false, error: "Password must be at least 8 characters long" }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { success: false, error: "Email already in use" }
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create avatar from initials
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
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

    // Create and set authentication token
    const token = await createToken(user)
    await setAuthCookie(token, false)

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: "register",
        details: `User registered`,
        entityType: "user",
        entityId: user.id,
        userId: user.id,
      },
    })

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name)
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError)
      // Continue even if email fails
    }

    revalidatePath("/dashboard")
    return { success: true, redirectUrl: "/dashboard" }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, error: "An error occurred during registration" }
  }
}

/**
 * Log out a user
 * Handles both real users and demo mode
 */
export async function logout(): Promise<void> {
  try {
    const token = await getAuthToken()
    const demoMode = await isDemoMode()

    // For real users, clean up the session
    if (token && !demoMode) {
      await deleteSession(token)
    }

    // Remove auth cookies for both real and demo users
    await removeAuthCookie()

    // Redirect to login page
    redirect("/login")
  } catch (error) {
    console.error("Logout error:", error)
    // Still try to redirect even if there's an error
    redirect("/login")
  }
}

/**
 * Request a password reset
 * Demo mode: simulates success without sending email
 * Real mode: generates token and sends reset email
 */
export async function requestPasswordReset(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const email = formData.get("email") as string

    if (!email) {
      return { success: false, error: "Email is required" }
    }

    // Check if we're in demo mode
    const demoMode = await isDemoMode()
    if (demoMode) {
      // In demo mode, just return success without doing anything
      return { success: true }
    }

    // For real users, process the reset request
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Don't reveal if email exists for security reasons
      return { success: true }
    }

    // Generate a reset token
    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // 24 hours from now

    // Store the token (in a real app, this would be in the database)
    global.resetTokens[token] = {
      userId: user.id,
      expiresAt,
    }

    // Send password reset email
    await sendPasswordResetEmail(user.email, user.name, token)

    return { success: true }
  } catch (error) {
    console.error("Password reset request error:", error)
    return { success: false, error: "An error occurred while processing your request" }
  }
}

/**
 * Reset a user's password using a token
 */
export async function resetPassword(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const token = formData.get("token") as string
    const password = formData.get("password") as string

    if (!token || !password) {
      return { success: false, error: "Token and password are required" }
    }

    // Check if we're in demo mode
    const demoMode = await isDemoMode()
    if (demoMode) {
      // In demo mode, just return success without doing anything
      return { success: true }
    }

    // Verify the token
    const resetData = global.resetTokens?.[token]

    if (!resetData || resetData.expiresAt < new Date()) {
      return { success: false, error: "Invalid or expired token" }
    }

    // Validate password strength
    if (password.length < 8) {
      return { success: false, error: "Password must be at least 8 characters long" }
    }

    // Hash the new password
    const hashedPassword = await hashPassword(password)

    // Update the user's password
    await prisma.user.update({
      where: { id: resetData.userId },
      data: { password: hashedPassword },
    })

    // Remove the used token
    delete global.resetTokens[token]

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: "update",
        details: "Password reset",
        entityType: "user",
        entityId: resetData.userId,
        userId: resetData.userId,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Password reset error:", error)
    return { success: false, error: "An error occurred while resetting your password" }
  }
}

/**
 * Verify a password reset token
 */
export async function verifyResetToken(token: string): Promise<boolean> {
  try {
    // Check if we're in demo mode
    const demoMode = await isDemoMode()
    if (demoMode) {
      // In demo mode, always return true
      return true
    }

    // Check if the token exists and is not expired
    const resetData = global.resetTokens?.[token]

    if (!resetData || resetData.expiresAt < new Date()) {
      return false
    }

    return true
  } catch (error) {
    console.error("Token verification error:", error)
    return false
  }
}

/**
 * Invite a user to join a board or team
 */
export async function inviteUser(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const email = formData.get("email") as string
    const type = formData.get("type") as string
    const entityId = formData.get("entityId") as string

    if (!email || !type || !entityId) {
      return { success: false, error: "Missing required fields" }
    }

    // Check if we're in demo mode
    const demoMode = await isDemoMode()
    if (demoMode) {
      // In demo mode, just return success
      return { success: true }
    }

    // For real users, create the invitation in the database
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "You must be logged in to invite users" }
    }

    // Create the invitation
    const invitation = await prisma.invitation.create({
      data: {
        email,
        type,
        ...(type === "board" ? { boardId: entityId } : { teamId: entityId }),
        status: "pending",
        token: crypto.randomBytes(32).toString("hex"),
        expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours from now
        senderId: user.id,
      },
    })

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: "create",
        details: `Invited user ${email} to ${type}`,
        entityType: type,
        entityId,
        userId: user.id,
      },
    })

    // Send invitation email
    if (type === "board") {
      const board = await prisma.board.findUnique({ where: { id: entityId } })
      await sendInvitationEmail(email, user.name, `board "${board?.name || "Untitled"}"`, invitation.token)
    } else {
      const team = await prisma.team.findUnique({ where: { id: entityId } })
      await sendInvitationEmail(email, user.name, `team "${team?.name || "Untitled"}"`, invitation.token)
    }

    return { success: true }
  } catch (error) {
    console.error("Error inviting user:", error)
    return { success: false, error: "An error occurred while inviting the user" }
  }
}

/**
 * Accept an invitation to join a board or team
 */
export async function acceptInvitation(
  token: string,
): Promise<{ success: boolean; error?: string; redirectUrl?: string }> {
  try {
    // Check if we're in demo mode
    const demoMode = await isDemoMode()
    if (demoMode) {
      // In demo mode, just return success
      return { success: true, redirectUrl: "/dashboard" }
    }

    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return { success: false, error: "You must be logged in to accept invitations" }
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        board: true,
        team: true,
        sender: true,
      },
    })

    if (!invitation) {
      return { success: false, error: "Invalid invitation" }
    }

    if (invitation.expiresAt < new Date()) {
      return { success: false, error: "Invitation has expired" }
    }

    if (invitation.status !== "pending") {
      return { success: false, error: "Invitation has already been processed" }
    }

    // Update invitation status
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "accepted", recipientId: currentUser.id },
    })

    let redirectUrl = "/dashboard"

    // Add user to board or team
    if (invitation.type === "board" && invitation.boardId) {
      await prisma.board.update({
        where: { id: invitation.boardId },
        data: {
          members: {
            connect: { id: currentUser.id },
          },
        },
      })

      // Log the activity
      await prisma.activityLog.create({
        data: {
          action: "join",
          details: `Joined board "${invitation.board?.name}"`,
          entityType: "board",
          entityId: invitation.boardId,
          userId: currentUser.id,
          boardId: invitation.boardId,
        },
      })

      redirectUrl = `/board/${invitation.boardId}`
    } else if (invitation.type === "team" && invitation.teamId) {
      await prisma.teamMember.create({
        data: {
          userId: currentUser.id,
          teamId: invitation.teamId,
          role: "member",
        },
      })

      // Log the activity
      await prisma.activityLog.create({
        data: {
          action: "join",
          details: `Joined team "${invitation.team?.name}"`,
          entityType: "team",
          entityId: invitation.teamId,
          userId: currentUser.id,
        },
      })

      redirectUrl = `/team/${invitation.teamId}`
    }

    return { success: true, redirectUrl }
  } catch (error) {
    console.error("Accept invitation error:", error)
    return { success: false, error: "An error occurred while accepting the invitation" }
  }
}

/**
 * Update a user's role in a team
 */
export async function updateUserRole(
  memberId: string,
  teamId: string,
  newRole: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if we're in demo mode
    const demoMode = await isDemoMode()
    if (demoMode) {
      // In demo mode, just return success
      return { success: true }
    }

    // Validate the role
    if (!["owner", "admin", "member"].includes(newRole)) {
      return { success: false, error: "Invalid role" }
    }

    // Get the current user
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return { success: false, error: "You must be logged in to update roles" }
    }

    // Check if the current user has permission to update roles
    const currentUserMembership = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: currentUser.id,
      },
    })

    if (!currentUserMembership || !["owner", "admin"].includes(currentUserMembership.role)) {
      return { success: false, error: "You don't have permission to update roles" }
    }

    // For real users, update the role in the database
    await prisma.teamMember.update({
      where: {
        id: memberId,
      },
      data: {
        role: newRole,
      },
    })

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: "update",
        details: `Updated user role to ${newRole}`,
        entityType: "team",
        entityId: teamId,
        userId: currentUser.id,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating user role:", error)
    return { success: false, error: "An error occurred while updating the role" }
  }
}

/**
 * Update user profile information
 */
export async function updateUserProfile(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if we're in demo mode
    const demoMode = await isDemoMode()
    if (demoMode) {
      // In demo mode, just return success
      return { success: true }
    }

    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return { success: false, error: "You must be logged in to update your profile" }
    }

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const theme = formData.get("theme") as string
    const notifications = formData.get("notifications") === "true"

    if (!name || !email) {
      return { success: false, error: "Name and email are required" }
    }

    // Check if email is already in use by another user
    if (email !== currentUser.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        return { success: false, error: "Email already in use" }
      }
    }

    // Update user profile
    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name,
        email,
        preferences: {
          update: {
            theme: theme || "system",
            notifications,
          },
        },
      },
    })

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: "update",
        details: "Updated profile information",
        entityType: "user",
        entityId: currentUser.id,
        userId: currentUser.id,
      },
    })

    revalidatePath("/profile")
    return { success: true }
  } catch (error) {
    console.error("Error updating profile:", error)
    return { success: false, error: "An error occurred while updating your profile" }
  }
}

/**
 * Change user password
 */
export async function changePassword(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if we're in demo mode
    const demoMode = await isDemoMode()
    if (demoMode) {
      // In demo mode, just return success
      return { success: true }
    }

    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return { success: false, error: "You must be logged in to change your password" }
    }

    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (!currentPassword || !newPassword || !confirmPassword) {
      return { success: false, error: "All password fields are required" }
    }

    if (newPassword !== confirmPassword) {
      return { success: false, error: "New passwords do not match" }
    }

    if (newPassword.length < 8) {
      return { success: false, error: "Password must be at least 8 characters long" }
    }

    // Get the user with password
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { id: true, password: true },
    })

    if (!user) {
      return { success: false, error: "User not found" }
    }

    // Verify current password
    const isPasswordValid = await verifyPassword(currentPassword, user.password)
    if (!isPasswordValid) {
      return { success: false, error: "Current password is incorrect" }
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword)

    // Update the password
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { password: hashedPassword },
    })

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: "update",
        details: "Changed password",
        entityType: "user",
        entityId: currentUser.id,
        userId: currentUser.id,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Error changing password:", error)
    return { success: false, error: "An error occurred while changing your password" }
  }
}

// Helper function to verify token
async function verifyToken(token: string) {
  try {
    return await authVerifyToken(token)
  } catch (error) {
    console.error("Error verifying token:", error)
    return null
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

// Send a password reset email
async function sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
  const resetUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/reset-password/${token}`
  const subject = "Reset Your Password"
  const text = `Hi ${name},\n\nYou requested a password reset. Click the link below to reset your password:\n\n${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.\n\nThe link will expire in 24 hours.\n\nBest regards,\nThe TaskTogether Team`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reset Your Password</h2>
      <p>Hi ${name},</p>
      <p>You've requested to reset your password. Click the button below to set a new password:</p>
      <div style="text-align: center; margin: 25px 0;">
        <a href="${resetUrl}" 
           style="background-color: #6366F1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Reset Password
        </a>
      </div>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <p>The link will expire in 24 hours.</p>
      <p>The TaskTogether Team</p>
    </div>
  `

  await sendEmail({ to: email, subject, text, html })
}

// Send an invitation email
async function sendInvitationEmail(
  email: string,
  senderName: string,
  entityName: string,
  token: string,
): Promise<void> {
  const invitationUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/invitation/${token}`
  const subject = `You've been invited to join ${entityName} on TaskTogether`
  const text = `Hi there,\n\n${senderName} has invited you to join ${entityName} on TaskTogether. Click the link below to accept the invitation:\n\n${invitationUrl}\n\nThe invitation will expire in 72 hours.\n\nBest regards,\nThe TaskTogether Team`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>You've Been Invited!</h2>
      <p>${senderName} has invited you to join ${entityName} on TaskTogether.</p>
      <div style="text-align: center; margin: 25px 0;">
        <a href="${invitationUrl}" 
           style="background-color: #6366F1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Accept Invitation
        </a>
      </div>
      <p>The invitation will expire in 72 hours.</p>
      <p>The TaskTogether Team</p>
    </div>
  `

  await sendEmail({ to: email, subject, text, html })
}

async function deleteSession(token: string): Promise<void> {
  // Implement your session deletion logic here
  // This is a placeholder, replace with your actual implementation
  console.log(`Deleting session for token: ${token}`)
}
