import { getCurrentUser } from "@/lib/auth-actions"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar"
import { InboxInterface } from "@/components/inbox/inbox-interface"

export default async function InboxPage() {
  const user = await getCurrentUser()

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader user={user || undefined} />
        <main className="flex-1">
          {user && <InboxInterface currentUser={user} />}
        </main>
      </div>
    </div>
  )
}

