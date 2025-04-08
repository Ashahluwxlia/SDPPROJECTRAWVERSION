"use server"

import { prisma } from "./prisma"
import { getCurrentUser } from "./auth-actions"
import { revalidatePath } from "next/cache"
import { sendEmail } from "./email"
import crypto from "crypto"
import { Team, TeamMember } from "./types"

// Get all teams for the current user
export async function getTeams(): Promise<Team[]> {
  const user = await getCurrentUser()

  if (!user) {
    return []
  }

  try {
    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return teams as unknown as Team[]
  } catch (error) {
    console.error("Error fetching teams:", error)
    return []
  }
}

// Get a specific team
export async function getTeam(id: string): Promise<Team | null> {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  try {
    const team = await prisma.team.findFirst({
      where: {
        id,
        members: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    })

    return team as unknown as Team | null
  } catch (error) {
    console.error("Error fetching team:", error)
    return null
  }
}

// Create a new team
export async function createTeam(formData: FormData): Promise<{ success: boolean; teamId?: string; error?: string }> {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, error: "You must be logged in to create a team" }
  }

  try {
    const name = formData.get("name") as string
    const description = formData.get("description") as string

    if (!name) {
      return { success: false, error: "Team name is required" }
    }

    const team = await prisma.team.create({
      data: {
        name,
        description,
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: "admin",
          },
        },
      },
    })

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: "create",
        details: `Created team "${name}"`,
        entityType: "team",
        entityId: team.id,
        userId: user.id,
      },
    })

    revalidatePath("/team")

    return { success: true, teamId: team.id }
  } catch (error) {
    console.error("Error creating team:", error)
    return { success: false, error: "An error occurred while creating the team" }
  }
}

// Update a team
export async function updateTeam(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, error: "You must be logged in to update a team" }
  }

  try {
    const id = formData.get("id") as string
    const name = formData.get("name") as string
    const description = formData.get("description") as string

    if (!id || !name) {
      return { success: false, error: "Team ID and name are required" }
    }

    // Check if user is the owner or an admin of the team
    const team = await prisma.team.findFirst({
      where: {
        id,
        OR: [
          { ownerId: user.id },
          {
            members: {
              some: {
                userId: user.id,
                role: "admin",
              },
            },
          },
        ],
      },
    })

    if (!team) {
      return { success: false, error: "Team not found or you do not have permission to update it" }
    }

    // Update the team
    await prisma.team.update({
      where: { id },
      data: {
        name,
        description,
      },
    })

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: "update",
        details: `Updated team "${name}"`,
        entityType: "team",
        entityId: id,
        userId: user.id,
      },
    })

    revalidatePath("/team")

    return { success: true }
  } catch (error) {
    console.error("Error updating team:", error)
    return { success: false, error: "An error occurred while updating the team" }
  }
}

// Delete a team
export async function deleteTeam(id: string): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, error: "You must be logged in to delete a team" }
  }

  try {
    // Check if user is the owner of the team
    const team = await prisma.team.findFirst({
      where: {
        id,
        ownerId: user.id,
      },
    })

    if (!team) {
      return { success: false, error: "Team not found or you are not the owner" }
    }

    // Delete the team
    await prisma.team.delete({
      where: { id },
    })

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: "delete",
        details: `Deleted team "${team.name}"`,
        entityType: "team",
        entityId: id,
        userId: user.id,
      },
    })

    revalidatePath("/team")

    return { success: true }
  } catch (error) {
    console.error("Error deleting team:", error)
    return { success: false, error: "An error occurred while deleting the team" }
  }
}

// Invite a user to a team
export async function inviteToTeam(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, error: "You must be logged in to invite users" }
  }

  try {
    const teamId = formData.get("teamId") as string
    const email = formData.get("email") as string
    const role = (formData.get("role") as string) || "member"

    if (!teamId || !email) {
      return { success: false, error: "Team ID and email are required" }
    }

    // Check if user is the owner or an admin of the team
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        OR: [
          { ownerId: user.id },
          {
            members: {
              some: {
                userId: user.id,
                role: "admin",
              },
            },
          },
        ],
      },
    })

    if (!team) {
      return { success: false, error: "Team not found or you do not have permission to invite users" }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    // Generate invitation token
    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 72) // 72 hours from now

    // Create the invitation
    const invitation = await prisma.invitation.create({
      data: {
        email,
        token,
        type: "team",
        expiresAt,
        senderId: user.id,
        recipientId: existingUser?.id,
        teamId,
      },
    })

    // Send invitation email
    await sendTeamInvitationEmail(email, user.name, team.name, token)

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: "invite",
        details: `Invited ${email} to team "${team.name}"`,
        entityType: "team",
        entityId: teamId,
        userId: user.id,
      },
    })

    revalidatePath("/team")

    return { success: true }
  } catch (error) {
    console.error("Error inviting to team:", error)
    return { success: false, error: "An error occurred while sending the invitation" }
  }
}

// Remove a member from a team
export async function removeTeamMember(
  teamId: string,
  memberId: string,
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, error: "You must be logged in to remove team members" }
  }

  try {
    // Check if user is the owner or an admin of the team
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        OR: [
          { ownerId: user.id },
          {
            members: {
              some: {
                userId: user.id,
                role: "admin",
              },
            },
          },
        ],
      },
      include: {
        members: true,
      },
    })

    if (!team) {
      return { success: false, error: "Team not found or you do not have permission to remove members" }
    }

    // Check if the member exists
    const member = team.members.find((m) => m.id === memberId)

    if (!member) {
      return { success: false, error: "Member not found" }
    }

    // Cannot remove the owner
    if (member.userId === team.ownerId) {
      return { success: false, error: "Cannot remove the team owner" }
    }

    // Remove the member
    await prisma.teamMember.delete({
      where: { id: memberId },
    })

    // Get the member's user
    const memberUser = await prisma.user.findUnique({
      where: { id: member.userId },
    })

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: "remove",
        details: `Removed ${memberUser?.name || "a member"} from team "${team.name}"`,
        entityType: "team",
        entityId: teamId,
        userId: user.id,
      },
    })

    revalidatePath("/team")

    return { success: true }
  } catch (error) {
    console.error("Error removing team member:", error)
    return { success: false, error: "An error occurred while removing the team member" }
  }
}

// Update a team member's role
export async function updateTeamMemberRole(
  teamId: string,
  memberId: string,
  role: string,
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, error: "You must be logged in to update team member roles" }
  }

  try {
    // Check if user is the owner or an admin of the team
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        OR: [
          { ownerId: user.id },
          {
            members: {
              some: {
                userId: user.id,
                role: "admin",
              },
            },
          },
        ],
      },
      include: {
        members: true,
      },
    })

    if (!team) {
      return { success: false, error: "Team not found or you do not have permission to update member roles" }
    }

    // Check if the member exists
    const member = team.members.find((m) => m.id === memberId)

    if (!member) {
      return { success: false, error: "Member not found" }
    }

    // Cannot update the owner's role
    if (member.userId === team.ownerId) {
      return { success: false, error: "Cannot update the team owner's role" }
    }

    // Update the member's role
    await prisma.teamMember.update({
      where: { id: memberId },
      data: { role },
    })

    // Get the member's user
    const memberUser = await prisma.user.findUnique({
      where: { id: member.userId },
    })

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: "update",
        details: `Updated ${memberUser?.name || "a member"}'s role to ${role} in team "${team.name}"`,
        entityType: "team",
        entityId: teamId,
        userId: user.id,
      },
    })

    revalidatePath("/team")

    return { success: true }
  } catch (error) {
    console.error("Error updating team member role:", error)
    return { success: false, error: "An error occurred while updating the team member's role" }
  }
}

// Send team invitation email
async function sendTeamInvitationEmail(
  email: string,
  senderName: string,
  teamName: string,
  token: string,
): Promise<void> {
  const invitationUrl = `${process.env.NEXT_PUBLIC_API_URL}/invitation/${token}`
  const subject = `You've been invited to join the ${teamName} team on TaskTogether`
  const text = `Hi there,\n\n${senderName} has invited you to join the ${teamName} team on TaskTogether. Click the link below to accept the invitation:\n\n${invitationUrl}\n\nThe invitation will expire in 72 hours.\n\nBest regards,\nThe TaskTogether Team`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>You've Been Invited!</h2>
      <p>${senderName} has invited you to join the ${teamName} team on TaskTogether.</p>
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

