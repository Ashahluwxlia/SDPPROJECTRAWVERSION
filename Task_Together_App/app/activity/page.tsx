import { getCurrentUser } from "@/lib/auth-actions"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, FileText, CheckCircle, Clock, Plus, ArrowRight } from "lucide-react"

export default async function ActivityPage() {
  const user = await getCurrentUser()

  // In a real app, this data would come from the database
  const activities = [
    {
      id: "1",
      user: {
        name: "John Doe",
        avatar: "/placeholder-user.jpg",
        initials: "JD",
      },
      action: "completed",
      task: "Design homepage mockup",
      time: "2 hours ago",
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
    },
    {
      id: "2",
      user: {
        name: "Sarah Smith",
        avatar: "/placeholder-user.jpg",
        initials: "SS",
      },
      action: "commented on",
      task: "API integration plan",
      time: "5 hours ago",
      icon: <MessageSquare className="h-4 w-4 text-blue-500" />,
    },
    {
      id: "3",
      user: {
        name: "Alex Johnson",
        avatar: "/placeholder-user.jpg",
        initials: "AJ",
      },
      action: "created",
      task: "Backend architecture document",
      time: "1 day ago",
      icon: <FileText className="h-4 w-4 text-purple-500" />,
    },
    {
      id: "4",
      user: {
        name: "Emily Chen",
        avatar: "/placeholder-user.jpg",
        initials: "EC",
      },
      action: "assigned",
      task: "Fix navigation bug",
      time: "1 day ago",
      icon: <Clock className="h-4 w-4 text-amber-500" />,
    },
    {
      id: "5",
      user: {
        name: "Michael Brown",
        avatar: "/placeholder-user.jpg",
        initials: "MB",
      },
      action: "updated",
      task: "User profile settings",
      time: "2 days ago",
      icon: <ArrowRight className="h-4 w-4 text-indigo-500" />,
    },
    {
      id: "6",
      user: {
        name: "Jessica Lee",
        avatar: "/placeholder-user.jpg",
        initials: "JL",
      },
      action: "created",
      task: "New marketing campaign",
      time: "2 days ago",
      icon: <Plus className="h-4 w-4 text-green-500" />,
    },
  ]

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <DashboardSidebar />
      <div className="flex-1">
        <DashboardHeader user={user || undefined} />
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Activity Feed</h1>
            <p className="text-muted-foreground">Recent actions from you and your team</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Activity</CardTitle>
              <CardDescription>Showing the most recent actions across all projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                      <AvatarFallback>{activity.user.initials}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-1">
                        {activity.icon}
                        <p className="text-sm">
                          <span className="font-medium">{activity.user.name}</span>{" "}
                          <span className="text-muted-foreground">{activity.action}</span>{" "}
                          <span className="font-medium">{activity.task}</span>
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}

