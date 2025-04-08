import type React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { getCurrentUser } from "@/lib/auth-actions"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import DashboardHeader from "@/components/dashboard/dashboard-header"

// Export this layout to be used by other dashboard pages
export function DashboardSharedLayout({
  children,
  user,
}: {
  children: React.ReactNode
  user: any
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <Suspense fallback={<div className="w-[240px] bg-background border-r" />}>
          <DashboardSidebarWrapper />
        </Suspense>
        <div className="flex-1 flex flex-col w-full">
          <DashboardHeader user={user} />
          <main className="p-6 pt-0">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <Suspense fallback={<div className="w-[240px] bg-background border-r" />}>
          {/* Import the sidebar dynamically to avoid suspense issues */}
          <DashboardSidebarWrapper />
        </Suspense>
        <div className="flex-1 flex flex-col w-full">
          <DashboardHeader user={user} />
          <main className="p-6 pt-16 w-full">
            <Suspense fallback={<DemoMessageSkeleton />}>
              <DemoMessageWrapper />
            </Suspense>
            {children}
          </main>
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

async function DemoMessageWrapper() {
  const user = await getCurrentUser()

  if (!user) return null
  if (user.role === "demo") {
    return (
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-md text-sm">
        You&apos;re viewing the dashboard in demo mode.{" "}
        <a href="/register" className="font-medium underline">
          Sign up
        </a>{" "}
        to save your data.
      </div>
    )
  }

  return null
}

// Skeleton loaders
function DemoMessageSkeleton() {
  return <Skeleton className="mb-4 h-12 w-full rounded-md" />
}

