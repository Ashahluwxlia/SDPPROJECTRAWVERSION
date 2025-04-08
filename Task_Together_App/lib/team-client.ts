"use client"

import {
  getTeams as getServerTeams,
  getTeam as getServerTeam,
  createTeam as createServerTeam,
  updateTeam as updateServerTeam,
  deleteTeam as deleteServerTeam,
  inviteToTeam as inviteServerToTeam,
  removeTeamMember as removeServerTeamMember,
  updateTeamMemberRole as updateServerTeamMemberRole,
} from "./team-actions"
import { Team } from "./types"

// Get all teams
export async function getTeams(): Promise<Team[]> {
  return getServerTeams()
}

// Get a specific team
export async function getTeam(id: string): Promise<Team | null> {
  return getServerTeam(id)
}

// Create a new team
export async function createTeam(data: {
  name: string
  description?: string
}) {
  const formData = new FormData()
  formData.append("name", data.name)
  if (data.description) formData.append("description", data.description)

  return createServerTeam(formData)
}

// Update a team
export async function updateTeam(data: {
  id: string
  name: string
  description?: string
}) {
  const formData = new FormData()
  formData.append("id", data.id)
  formData.append("name", data.name)
  if (data.description) formData.append("description", data.description)

  return updateServerTeam(formData)
}

// Delete a team
export async function deleteTeam(id: string) {
  return deleteServerTeam(id)
}

// Invite a user to a team
export async function inviteToTeam(data: {
  teamId: string
  email: string
  role?: string
}) {
  const formData = new FormData()
  formData.append("teamId", data.teamId)
  formData.append("email", data.email)
  if (data.role) formData.append("role", data.role)

  return inviteServerToTeam(formData)
}

// Remove a member from a team
export async function removeTeamMember(teamId: string, memberId: string) {
  return removeServerTeamMember(teamId, memberId)
}

// Update a team member's role
export async function updateTeamMemberRole(teamId: string, memberId: string, role: string) {
  return updateServerTeamMemberRole(teamId, memberId, role)
}

