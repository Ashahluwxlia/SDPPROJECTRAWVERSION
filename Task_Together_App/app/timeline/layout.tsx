import type React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { getCurrentUser } from "@/lib/auth-actions"
import { Suspense } from "react"
import DashboardHeader from "@/components/dashboard/dashboard-header"

export default async function TimelineLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <Suspense fallback={<div className="w-[240px] bg-background border-r" />}>
          <DashboardSidebarWrapper />
        </Suspense>
        <div className="flex-1 flex flex-col">
          <DashboardHeader user={user} />
          <main className="p-6 pt-0">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}

// Separate components to handle suspense boundaries
async function DashboardSidebarWrapper() {
  const DashboardSidebar = (await import("@/components/dashboard/dashboard-sidebar")).default
  return <DashboardSidebar />
}

