"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  LayoutGrid,
  Clock,
  CalendarIcon,
  Users,
  MessageSquare,
  Inbox,
  CheckSquare,
  Star,
  Plus,
  ChevronDown,
  ChevronRight,
  LogOut,
  Bell,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"

interface User {
  name: string
  email: string
  avatar?: string
}

interface Board {
  id: number
  name: string
  isStarred?: boolean
}

interface Team {
  id: string
  name: string
  memberCount: number
}

export default function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [boardsExpanded, setBoardsExpanded] = useState(true)
  const [teamsExpanded, setTeamsExpanded] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<User | null>(null)
  const [userBoards, setUserBoards] = useState<Board[]>([])
  const [userTeams, setUserTeams] = useState<Team[]>([])

  // Demo data for non-authenticated users
  const demoUser = {
    name: "Demo User",
    email: "demo@example.com",
    avatar: "/placeholder-user.jpg",
  }

  const demoBoards = [
    { id: 1, name: "Product Development", isStarred: true },
    { id: 2, name: "Marketing Campaign", isStarred: false },
    { id: 3, name: "Website Redesign", isStarred: true },
    { id: 4, name: "Mobile App Development", isStarred: false },
    { id: 5, name: "Q2 Planning", isStarred: false },
  ]

  const demoTeams = [
    { id: "design", name: "Design Team", memberCount: 5 },
    { id: "engineering", name: "Engineering", memberCount: 9 },
    { id: "marketing", name: "Marketing", memberCount: 3 },
  ]

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true)
      
      if (session?.user) {
        try {
          // In a real app, this would fetch data from your API
          const [userResponse, boardsResponse, teamsResponse] = await Promise.all([
            fetch('/api/user/profile'),
            fetch('/api/boards'),
            fetch('/api/teams')
          ])
          
          if (userResponse.ok) {
            const userData = await userResponse.json()
            setUserData(userData)
          } else {
            setUserData(demoUser)
          }
          
          if (boardsResponse.ok) {
            const boardsData = await boardsResponse.json()
            setUserBoards(boardsData)
          } else {
            setUserBoards(demoBoards)
          }
          
          if (teamsResponse.ok) {
            const teamsData = await teamsResponse.json()
            setUserTeams(teamsData)
          } else {
            setUserTeams(demoTeams)
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          // Fallback to demo data on error
          setUserData(demoUser)
          setUserBoards(demoBoards)
          setUserTeams(demoTeams)
        }
      } else {
        // Use demo data for non-authenticated users
        setUserData(demoUser)
        setUserBoards(demoBoards)
        setUserTeams(demoTeams)
      }
      
      setIsLoading(false)
    }

    fetchUserData()
  }, [session])

  // Use either the fetched userData or demo data
  const currentUser = userData || demoUser
  const currentBoards = userBoards.length > 0 ? userBoards : demoBoards
  const currentTeams = userTeams.length > 0 ? userTeams : demoTeams

  const isActive = (path: string) => {
    if (path === "/board") {
      return pathname.startsWith("/board/")
    }
    return pathname === path
  }

  const handleSignOut = () => {
    toast({
      title: "Signing out",
      description: "You will be redirected to the login page.",
      duration: 2000,
    })

    // In a real app, this would call an API endpoint to sign out
    setTimeout(() => {
      router.push("/login")
    }, 1000)
  }

  const handleCreateBoard = () => {
    router.push("/board/new")
    toast({
      title: "Creating new board",
      description: "Setting up your new board...",
      duration: 2000,
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-full w-64 flex-col border-r bg-background animate-pulse">
        <div className="flex h-14 items-center border-b px-4">
          <div className="h-8 w-8 bg-muted rounded-md"></div>
          <div className="h-6 w-32 bg-muted rounded ml-2"></div>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <div className="space-y-1 px-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded-md"></div>
            ))}
          </div>
          <div className="mt-4 px-3">
            <div className="h-6 w-24 bg-muted rounded mb-2"></div>
            <div className="space-y-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-muted rounded-md"></div>
              ))}
            </div>
          </div>
          <div className="mt-4 px-3">
            <div className="h-6 w-24 bg-muted rounded mb-2"></div>
            <div className="space-y-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 bg-muted rounded-md"></div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-auto border-t p-4">
          <div className="h-10 bg-muted rounded-md"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg">TaskTogether</span>
        </Link>
      </div>

      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              isActive("/dashboard") ? "bg-accent text-accent-foreground" : "transparent",
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/board/1"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              isActive("/board") ? "bg-accent text-accent-foreground" : "transparent",
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            <span>Boards</span>
          </Link>

          <Link
            href="/timeline"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              isActive("/timeline") ? "bg-accent text-accent-foreground" : "transparent",
            )}
          >
            <Clock className="h-4 w-4" />
            <span>Timeline</span>
          </Link>

          <Link
            href="/calendar"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              isActive("/calendar") ? "bg-accent text-accent-foreground" : "transparent",
            )}
          >
            <CalendarIcon className="h-4 w-4" />
            <span>Calendar</span>
          </Link>

          <Link
            href="/team"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              isActive("/team") ? "bg-accent text-accent-foreground" : "transparent",
            )}
          >
            <Users className="h-4 w-4" />
            <span>Team</span>
          </Link>

          <Link
            href="/chat"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              isActive("/chat") ? "bg-accent text-accent-foreground" : "transparent",
            )}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Chat</span>
            <Badge className="ml-auto" variant="secondary">
              3
            </Badge>
          </Link>

          <Link
            href="/inbox"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              isActive("/inbox") ? "bg-accent text-accent-foreground" : "transparent",
            )}
          >
            <Inbox className="h-4 w-4" />
            <span>Inbox</span>
            <Badge className="ml-auto" variant="secondary">
              5
            </Badge>
          </Link>

          <Link
            href="/tasks"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              isActive("/tasks") ? "bg-accent text-accent-foreground" : "transparent",
            )}
          >
            <CheckSquare className="h-4 w-4" />
            <span>My Tasks</span>
          </Link>

          <Link
            href="/notifications"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              isActive("/notifications") ? "bg-accent text-accent-foreground" : "transparent",
            )}
          >
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
            <Badge className="ml-auto" variant="secondary">
              2
            </Badge>
          </Link>
        </nav>

        <div className="mt-4 px-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Boards</h2>
            <Button variant="ghost" size="icon" onClick={() => setBoardsExpanded(!boardsExpanded)}>
              {boardsExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>

          {boardsExpanded && (
            <div className="mt-2 space-y-1">
              {currentBoards.map((board) => (
                <Link
                  key={board.id}
                  href={`/board/${board.id}`}
                  className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  <span>{board.name}</span>
                  {board.isStarred && <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />}
                </Link>
              ))}

              <Button
                variant="ghost"
                className="w-full justify-start gap-2 px-3 py-2 text-sm"
                onClick={handleCreateBoard}
              >
                <Plus className="h-4 w-4" />
                <span>Create New Board</span>
              </Button>
            </div>
          )}
        </div>

        <div className="mt-4 px-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Teams</h2>
            <Button variant="ghost" size="icon" onClick={() => setTeamsExpanded(!teamsExpanded)}>
              {teamsExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>

          {teamsExpanded && (
            <div className="mt-2 space-y-1">
              {currentTeams.map((team) => (
                <Link
                  key={team.id}
                  href={`/team/${team.id}`}
                  className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  <span>{team.name}</span>
                  <Badge variant="outline" className="ml-auto">
                    {team.memberCount}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start px-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                  <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-medium">{currentUser.name}</span>
                  <span className="text-xs text-muted-foreground">{currentUser.email}</span>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <ThemeToggle variant="menu" />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

