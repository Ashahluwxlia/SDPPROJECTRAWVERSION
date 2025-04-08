"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Clock, Users, ArrowRight, Calendar } from "lucide-react"
import Link from "next/link"
import TaskSummary from "@/components/dashboard/task-summary"
import RecentActivityFeed from "@/components/dashboard/recent-activity-feed"
import { DashboardAnalytics } from "@/components/dashboard/dashboard-analytics"
import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

interface User {
  name: string | null
  email: string
  avatar?: string | null
}

interface DashboardContentProps {
  user?: User
  boards?: any[]
  notifications?: any[]
}

export default function DashboardContent({ user, boards = [], notifications = [] }: DashboardContentProps) {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<User | null>(null)
  const [userBoards, setUserBoards] = useState<any[]>([])
  const [userNotifications, setUserNotifications] = useState<any[]>([])

  // Demo data for non-authenticated users
  const demoUser = {
    name: "Demo User",
    email: "demo@example.com",
    avatar: "/placeholder-user.jpg",
  }

  const demoBoards = [
    { id: 1, name: "Project Alpha", tasks: 12, members: 5 },
    { id: 2, name: "Marketing Campaign", tasks: 8, members: 3 },
    { id: 3, name: "Website Redesign", tasks: 15, members: 7 },
  ]

  const demoNotifications = [
    { id: 1, message: "New comment on 'Homepage Design'", time: "2 hours ago", read: false },
    { id: 2, message: "Task 'API Integration' is due tomorrow", time: "5 hours ago", read: false },
    { id: 3, message: "You were assigned to 'User Testing'", time: "1 day ago", read: true },
  ]

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true)
      
      if (session?.user) {
        try {
          // In a real app, this would fetch data from your API
          const [userResponse, boardsResponse, notificationsResponse] = await Promise.all([
            fetch('/api/user/profile'),
            fetch('/api/boards'),
            fetch('/api/notifications')
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
          
          if (notificationsResponse.ok) {
            const notificationsData = await notificationsResponse.json()
            setUserNotifications(notificationsData)
          } else {
            setUserNotifications(demoNotifications)
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          // Fallback to demo data on error
          setUserData(demoUser)
          setUserBoards(demoBoards)
          setUserNotifications(demoNotifications)
        }
      } else {
        // Use demo data for non-authenticated users
        setUserData(demoUser)
        setUserBoards(demoBoards)
        setUserNotifications(demoNotifications)
      }
      
      setIsLoading(false)
    }

    fetchUserData()
  }, [session])

  // Use either the passed user prop or the fetched userData
  const currentUser = user || userData || demoUser
  const currentBoards = boards.length > 0 ? boards : userBoards
  const currentNotifications = notifications.length > 0 ? notifications : userNotifications

  if (isLoading) {
    return (
      <div className="p-6 space-y-8 animate-pulse">
        <div>
          <div className="h-8 w-64 bg-muted rounded mb-2"></div>
          <div className="h-4 w-96 bg-muted rounded"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="bg-muted/20">
              <CardContent className="p-6">
                <div className="h-5 w-32 bg-muted rounded mb-4"></div>
                <div className="h-8 w-16 bg-muted rounded mb-2"></div>
                <div className="h-4 w-24 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-muted rounded"></div>
          <div className="h-80 bg-muted rounded"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-muted rounded"></div>
          <div className="h-80 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <main className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {currentUser.name?.split(" ")[0]}</h1>
        <p className="text-muted-foreground">
          {session?.user 
            ? "Here's what's happening with your projects today." 
            : "Demo mode: Here's a sample dashboard with demo data."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">24</div>
              <div className="bg-primary/10 p-2 rounded-full">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500 font-medium">+5</span> from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">8</div>
              <div className="bg-blue-500/10 p-2 rounded-full">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500 font-medium">+2</span> from yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">12</div>
              <div className="bg-purple-500/10 p-2 rounded-full">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500 font-medium">+1</span> new this month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Task Summary</CardTitle>
              <Link href="/tasks">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            <CardDescription>Your tasks across all projects</CardDescription>
          </CardHeader>
          <CardContent>
            <TaskSummary />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Link href="/activity">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            <CardDescription>Latest updates from your team</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivityFeed />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Analytics</CardTitle>
              <Tabs defaultValue="week">
                <TabsList>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                  <TabsTrigger value="year">Year</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <CardDescription>Task completion and productivity metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardAnalytics />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming</CardTitle>
              <Link href="/calendar">
                <Button variant="outline" size="sm">
                  View Calendar
                </Button>
              </Link>
            </div>
            <CardDescription>Tasks and events due soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Team Meeting</p>
                  <p className="text-xs text-muted-foreground">Today, 2:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-amber-500/10 p-2 rounded-full">
                  <Clock className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Design Review</p>
                  <p className="text-xs text-muted-foreground">Tomorrow, 10:00 AM</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-red-500/10 p-2 rounded-full">
                  <CheckCircle className="h-4 w-4 text-red-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">API Integration Deadline</p>
                  <p className="text-xs text-muted-foreground">Friday, 5:00 PM</p>
                </div>
              </div>
              <div className="pt-2">
                <Link href="/calendar">
                  <Button variant="ghost" size="sm" className="w-full justify-between">
                    View all events
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Team Members</CardTitle>
              <Link href="/team">
                <Button variant="outline" size="sm">
                  View All Members
                </Button>
              </Link>
            </div>
            <CardDescription>People you're working with</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: "Alex Johnson", role: "Product Manager", avatar: "/images/avatar-1.jpg", tasks: 8 },
                { name: "Sarah Williams", role: "UI Designer", avatar: "/images/avatar-2.jpg", tasks: 5 },
                { name: "Michael Chen", role: "Developer", avatar: "/images/avatar-3.jpg", tasks: 12 },
                {
                  name: "Emily Rodriguez",
                  role: "Marketing",
                  avatar: "/placeholder.svg?height=100&width=100&text=ER",
                  tasks: 3,
                },
              ].map((member, i) => (
                <div key={i} className="flex flex-col items-center text-center p-4 border rounded-lg">
                  <Avatar className="h-16 w-16 mb-3">
                    <AvatarImage src={member.avatar} alt={member.name || ""} />
                    <AvatarFallback className="text-2xl">
                      {member.name
                        ? member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                        : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-medium">{member.name || "Unknown"}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{member.role}</p>
                  <Badge variant="outline" className="bg-primary/5">
                    {member.tasks} active tasks
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

