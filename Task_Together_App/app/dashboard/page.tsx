import { getCurrentUser } from "@/lib/auth-actions"
import { getBoards } from "@/lib/board-actions"
import { getNotifications } from "@/lib/notifications"
import DashboardContent from "@/components/dashboard/dashboard-content"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const boards = await getBoards()
  const notifications = await getNotifications()

  return (
    <div className="flex-1">
      <DashboardContent user={user} boards={boards.boards} notifications={notifications} />
    </div>
  )
}

