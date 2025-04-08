"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { TeamMember } from "@/lib/types"
import { MoreHorizontal, Mail, UserPlus, Search, UserX, UserCheck, Shield } from "lucide-react"
import { inviteUser, updateUserRole } from "@/lib/auth-actions"
import { motion } from "framer-motion"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"

// Mock team members for demo mode
const mockTeamMembers: TeamMember[] = [
  {
    id: "1",
    userId: "1",
    teamId: "team-1",
    role: "admin",
    createdAt: new Date("2023-01-15T00:00:00Z"),
    updatedAt: new Date("2023-01-15T00:00:00Z"),
    user: {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      avatar: "/placeholder-user.jpg"
    }
  },
  {
    id: "2",
    userId: "2",
    teamId: "team-1",
    role: "manager",
    createdAt: new Date("2023-02-20T00:00:00Z"),
    updatedAt: new Date("2023-02-20T00:00:00Z"),
    user: {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      avatar: "/placeholder-user.jpg"
    }
  },
  {
    id: "3",
    userId: "3",
    teamId: "team-1",
    role: "member",
    createdAt: new Date("2023-03-10T00:00:00Z"),
    updatedAt: new Date("2023-03-10T00:00:00Z"),
    user: {
      id: "3",
      name: "Alex Johnson",
      email: "alex@example.com",
      avatar: "/placeholder-user.jpg"
    }
  },
  {
    id: "4",
    userId: "4",
    teamId: "team-1",
    role: "member",
    createdAt: new Date("2023-04-05T00:00:00Z"),
    updatedAt: new Date("2023-04-05T00:00:00Z"),
    user: {
      id: "4",
      name: "Emily Chen",
      email: "emily@example.com",
      avatar: "/placeholder-user.jpg"
    }
  },
]

export function TeamManagement() {
  const { data: session } = useSession()
  const isDemoMode = !session || process.env.NEXT_PUBLIC_DEMO_MODE === "true"
  const params = useParams()
  const teamId = params?.teamId as string || "current-team-id"
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(isDemoMode ? mockTeamMembers : [])
  const [searchQuery, setSearchQuery] = useState("")
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("member")
  const [isInviting, setIsInviting] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(!isDemoMode)

  // Fetch real team members if not in demo mode
  useEffect(() => {
    if (!isDemoMode) {
      const fetchTeamMembers = async () => {
        try {
          // Replace with your actual API call to fetch team members
          const response = await fetch('/api/team/members')
          if (response.ok) {
            const data = await response.json()
            setTeamMembers(data)
          }
        } catch (error) {
          console.error("Error fetching team members:", error)
        } finally {
          setIsLoading(false)
        }
      }
      
      fetchTeamMembers()
    }
  }, [isDemoMode])

  const filteredMembers = teamMembers.filter(
    (member) =>
      member.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.user?.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) return

    setIsInviting(true)

    try {
      if (isDemoMode) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Add the new member to the list
        const newMember: TeamMember = {
          id: `member-${Date.now()}`,
          userId: `user-${Date.now()}`,
          teamId: teamId,
          role: inviteRole as "admin" | "manager" | "member",
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: `user-${Date.now()}`,
            name: inviteEmail.split("@")[0], // Use part of email as name
            email: inviteEmail,
            avatar: "/placeholder-user.jpg"
          }
        }

        setTeamMembers([...teamMembers, newMember])
        setInviteSuccess(true)

        // Reset form after a delay
        setTimeout(() => {
          setInviteEmail("")
          setInviteRole("member")
          setInviteSuccess(false)
          setIsInviteDialogOpen(false)
        }, 2000)
      } else {
        // Real API call
        const formData = new FormData()
        formData.append("email", inviteEmail)
        formData.append("role", inviteRole)
        formData.append("type", "team")
        formData.append("entityId", teamId)

        const success = await inviteUser(formData)

        if (success.success) {
          // Add the new member to the list
          const newMember: TeamMember = {
            id: `member-${Date.now()}`,
            userId: `user-${Date.now()}`,
            teamId: teamId,
            role: inviteRole as "admin" | "manager" | "member",
            createdAt: new Date(),
            updatedAt: new Date(),
            user: {
              id: `user-${Date.now()}`,
              name: inviteEmail.split("@")[0], // Use part of email as name
              email: inviteEmail,
              avatar: "/placeholder-user.jpg"
            }
          }

          setTeamMembers([...teamMembers, newMember])
          setInviteSuccess(true)

          // Reset form after a delay
          setTimeout(() => {
            setInviteEmail("")
            setInviteRole("member")
            setInviteSuccess(false)
            setIsInviteDialogOpen(false)
          }, 2000)
        }
      }
    } catch (error) {
      console.error("Error inviting user:", error)
    } finally {
      setIsInviting(false)
    }
  }

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      if (isDemoMode) {
        // Update the member's role in the list
        setTeamMembers(
          teamMembers.map((member) => {
            if (member.userId === userId) {
              return {
                ...member,
                role: newRole as "admin" | "manager" | "member",
              }
            }
            return member
          }),
        )
      } else {
        // Real API call
        const success = await updateUserRole(userId, teamId, newRole)

        if (success) {
          // Update the member's role in the list
          setTeamMembers(
            teamMembers.map((member) => {
              if (member.userId === userId) {
                return {
                  ...member,
                  role: newRole as "admin" | "manager" | "member",
                }
              }
              return member
            }),
          )
        }
      }
    } catch (error) {
      console.error("Error updating role:", error)
    }
  }

  const handleRemoveMember = (memberId: string) => {
    setTeamMembers(teamMembers.filter((member) => member.id !== memberId))
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "manager":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      default:
        return "bg-green-500/10 text-green-500 border-green-500/20"
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Manage your team and permissions</CardDescription>
        </div>
        <Button onClick={() => setIsInviteDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" /> Invite Member
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Loading team members...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserX className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
              <p>No members found</p>
            </div>
          ) : (
            filteredMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 border rounded-md"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.user?.avatar || ""} alt={member.user?.name || ""} />
                    <AvatarFallback>
                      {member.user?.name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{member.user?.name || "Unknown User"}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {member.user?.email || "No email"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getRoleBadgeColor(member.role)}>
                    <Shield className="h-3 w-3 mr-1" />
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </Badge>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleUpdateRole(member.userId, "admin")}>
                        Make Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateRole(member.userId, "manager")}>
                        Make Manager
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateRole(member.userId, "member")}>
                        Make Member
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => handleRemoveMember(member.id)}>
                        Remove from Team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>

      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>Send an invitation email to add someone to your team.</DialogDescription>
          </DialogHeader>

          {inviteSuccess ? (
            <div className="py-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Invitation Sent!</h3>
              <p className="text-muted-foreground">An invitation has been sent to {inviteEmail}</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {inviteRole === "admin"
                      ? "Admins have full access to all resources and can manage team members."
                      : inviteRole === "manager"
                        ? "Managers can create and edit resources but cannot manage team members."
                        : "Members can view and edit resources but cannot create new ones."}
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInviteUser} disabled={!inviteEmail.trim() || isInviting}>
                  {isInviting ? "Sending..." : "Send Invitation"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}

