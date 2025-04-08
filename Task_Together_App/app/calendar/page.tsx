import { getCurrentUser } from "@/lib/auth-actions"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarView } from "@/components/calendar-view"

export default async function CalendarPage() {
  const user = await getCurrentUser()

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <DashboardSidebar />
      <div className="flex-1">
        <DashboardHeader user={user || undefined} />
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Calendar</h1>
            <p className="text-muted-foreground">View and manage your schedule</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Task Calendar</CardTitle>
              <CardDescription>View all your tasks and deadlines in calendar format</CardDescription>
            </CardHeader>
            <CardContent>
              <CalendarView />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}

