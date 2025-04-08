"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Dashboard error:", error)

    // Check if user is in demo mode
    const isDemoMode = document.cookie.split(';').some(cookie => 
      cookie.trim().startsWith('demo_mode=true')
    )

    // Handle different error scenarios
    if (isDemoMode) {
      // In demo mode, always ensure the session is valid
      document.cookie = "demo_mode=true; path=/; max-age=604800; samesite=lax"
      // Force a hard reload of the dashboard to reset the application state
      window.location.href = "/dashboard"
      return
    } else if (error.message.includes("Redirect")) {
      router.push("/login")
    }
  }, [error, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>We encountered an error while loading your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This could be due to a temporary issue or a problem with your connection.
          </p>
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
            {error.message || "An unexpected error occurred"}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button onClick={reset} className="w-full">
            Try again
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              const isDemoMode = document.cookie.split(';').some(cookie => 
                cookie.trim().startsWith('demo_mode=true')
              )
              if (isDemoMode) {
                // Reset demo session and force a hard reload
                document.cookie = "demo_mode=true; path=/; max-age=604800; samesite=lax"
                window.location.href = "/dashboard"
              } else {
                router.push("/login")
              }
            }} 
            className="w-full"
          >
            {document.cookie.includes('demo_mode=true') ? 'Reset Demo Session' : 'Go to login'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

