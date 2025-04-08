import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { OfflineDetector } from "@/components/offline-detector"
import { SessionProvider } from "@/components/providers/session-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TaskTogether - Manage your tasks with ease",
  description: "A modern task management application for teams and individuals",
  generator: 'AshAhluwalia'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <OfflineDetector />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
