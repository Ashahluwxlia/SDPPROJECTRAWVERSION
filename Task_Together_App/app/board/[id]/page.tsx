import { getBoard, getLists } from "@/lib/board-actions"
import { getCurrentUser } from "@/lib/auth-actions"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar"
import KanbanBoard from "@/components/board/kanban-board"
import BoardHeader from "@/components/board/board-header"
import { redirect } from "next/navigation"
import { Suspense } from "react"

interface BoardPageProps {
  params: {
    id: string
  }
}

// This is a Server Component
export default async function BoardPage({ params }: BoardPageProps) {
  // Get the current user server-side
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Get the board ID from params
  const boardId = params?.id
  if (!boardId) {
    redirect("/dashboard")
  }

  try {
    const board = await getBoard(boardId)

    if (!board) {
      redirect("/dashboard")
    }

    // Pre-fetch lists for the board
    const listsData = await getLists(boardId)
    const lists = listsData?.lists || []

    return (
      <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <DashboardSidebar />
        <div className="flex-1">
          <DashboardHeader user={user} />
          <BoardHeader board={board} />
          <main className="p-6 overflow-x-auto">
            <Suspense fallback={<div>Loading board...</div>}>
              <KanbanBoard boardId={boardId} initialLists={lists} />
            </Suspense>
          </main>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading board:", error)
    redirect("/dashboard?error=board-load-failed")
  }
}
