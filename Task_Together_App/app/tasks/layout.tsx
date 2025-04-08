import type React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { getCurrentUser } from "@/lib/auth-actions"
import { Suspense } from "react"
import DashboardHeader from "@/components/dashboard/dashboard-header"

export default async function TasksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  const { DashboardSharedLayout } = await import("../dashboard/layout")

  return <DashboardSharedLayout user={user}>{children}</DashboardSharedLayout>
}

// Separate components to handle suspense boundaries
async function DashboardSidebarWrapper() {
  const DashboardSidebar = (await import("@/components/dashboard/dashboard-sidebar")).default
  return <DashboardSidebar />
}

