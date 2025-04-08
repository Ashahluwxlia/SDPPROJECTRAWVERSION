import type React from "react"
import { getCurrentUser } from "@/lib/auth-actions"

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  const { DashboardSharedLayout } = await import("../dashboard/layout")

  return (
    <DashboardSharedLayout user={user}>
      {user?.role === "demo" && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-md text-sm">
          You&apos;re viewing settings in demo mode.{" "}
          <a href="/register" className="font-medium underline">
            Sign up
          </a>{" "}
          to save your preferences.
        </div>
      )}
      {children}
    </DashboardSharedLayout>
  )
}

