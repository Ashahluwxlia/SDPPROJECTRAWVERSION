import type React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar"
import { getCurrentUser } from "@/lib/auth-actions"

export default async function DocumentationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get the current user - returns demo user if not logged in
  const user = await getCurrentUser()

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <DashboardSidebar />
        <SidebarInset>
          {user?.role === "demo" && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-md text-sm">
              You&apos;re viewing documentation in demo mode.{" "}
              <a href="/register" className="font-medium underline">
                Sign up
              </a>{" "}
              to save your documentation preferences.
            </div>
          )}
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

