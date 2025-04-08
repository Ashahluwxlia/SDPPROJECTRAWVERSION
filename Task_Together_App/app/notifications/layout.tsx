import type React from "react"
import { getCurrentUser } from "@/lib/auth-actions"

export default async function NotificationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  const { DashboardSharedLayout } = await import("../dashboard/layout")

  return <DashboardSharedLayout user={user}>{children}</DashboardSharedLayout>
}

