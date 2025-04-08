"use client"
import { motion } from "framer-motion"
import { AuthForm } from "@/components/auth/auth-form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { loginUser } from "@/lib/auth-client"

export default function LoginPageClient() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleDemoAccess = async () => {
    setIsLoading(true)
    try {
      // Use the auth-client to login with demo mode
      const result = await loginUser("demo@example.com", "demo-password", true)

      if (result.success) {
        toast.success("Demo mode activated! Exploring the dashboard...")
        router.push("/dashboard")
      } else {
        toast.error("Failed to activate demo mode. Please try again.")
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-purple-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
              <CardDescription className="text-center">Sign in to your account to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <AuthForm mode="login" />
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 border-t pt-4">
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={handleDemoAccess} disabled={isLoading}>
                {isLoading ? "Loading demo..." : "Try Dashboard Demo"}
              </Button>
              <div className="text-center text-sm">
                Don't have an account?{" "}
                <Link href="/register" className="underline underline-offset-4 hover:text-primary">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
