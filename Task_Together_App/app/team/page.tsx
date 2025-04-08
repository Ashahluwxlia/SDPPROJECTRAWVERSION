import { getCurrentUser } from "@/lib/auth-actions"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default async function TeamPage() {
  const user = await getCurrentUser()

  // In a real app, this data would come from the database
  const teamMembers = [
    {
      name: "Alex Johnson",
      role: "Product Manager",
      avatar: "/images/avatar-1.jpg",
      tasks: 8,
      email: "alex@tasktogether.com",
      department: "Product",
      joinedDate: "Jan 2023",
    },
    {
      name: "Sarah Williams",
      role: "UI Designer",
      avatar: "/images/avatar-2.jpg",
      tasks: 5,
      email: "sarah@tasktogether.com",
      department: "Design",
      joinedDate: "Mar 2023",
    },
    {
      name: "Michael Chen",
      role: "Developer",
      avatar: "/images/avatar-3.jpg",
      tasks: 12,
      email: "michael@tasktogether.com",
      department: "Engineering",
      joinedDate: "Feb 2023",
    },
    {
      name: "Emily Rodriguez",
      role: "Marketing",
      avatar: "/placeholder.svg?height=100&width=100&text=ER",
      tasks: 3,
      email: "emily@tasktogether.com",
      department: "Marketing",
      joinedDate: "Apr 2023",
    },
    {
      name: "David Kim",
      role: "Developer",
      avatar: "/placeholder.svg?height=100&width=100&text=DK",
      tasks: 7,
      email: "david@tasktogether.com",
      department: "Engineering",
      joinedDate: "May 2023",
    },
    {
      name: "Lisa Wang",
      role: "UX Researcher",
      avatar: "/placeholder.svg?height=100&width=100&text=LW",
      tasks: 4,
      email: "lisa@tasktogether.com",
      department: "Design",
      joinedDate: "Jun 2023",
    },
    {
      name: "James Wilson",
      role: "QA Engineer",
      avatar: "/placeholder.svg?height=100&width=100&text=JW",
      tasks: 9,
      email: "james@tasktogether.com",
      department: "Engineering",
      joinedDate: "Feb 2023",
    },
    {
      name: "Olivia Martinez",
      role: "Content Writer",
      avatar: "/placeholder.svg?height=100&width=100&text=OM",
      tasks: 6,
      email: "olivia@tasktogether.com",
      department: "Marketing",
      joinedDate: "Jul 2023",
    },
  ]

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <DashboardSidebar />
      <div className="flex-1">
        <DashboardHeader user={user || undefined} />
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Team Members</h1>
            <p className="text-muted-foreground">Manage your team and their access</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Team Members</CardTitle>
              <CardDescription>You have {teamMembers.length} team members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {teamMembers.map((member, i) => (
                  <div key={i} className="flex flex-col items-center text-center p-4 border rounded-lg">
                    <Avatar className="h-16 w-16 mb-3">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-medium">{member.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{member.role}</p>
                    <Badge variant="outline" className="bg-primary/5 mb-2">
                      {member.tasks} active tasks
                    </Badge>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {member.department} • Joined {member.joinedDate}
                    </p>
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

