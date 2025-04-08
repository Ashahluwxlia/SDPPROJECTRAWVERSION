"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Layout, Mail, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion } from "framer-motion"
import { requestPasswordReset } from "@/lib/auth-actions"

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email) {
      setError("Please enter your email address")
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData();
      formData.append("email", email);
      await requestPasswordReset(formData)
      setIsSuccess(true)
    } catch (error) {
      console.error("Password reset error:", error)
      setError("Failed to send reset link. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-purple-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="border-none shadow-xl backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-2">
                <Link href="/" className="flex items-center gap-2">
                  <Layout className="h-6 w-6 text-primary" />
                  <span className="text-xl font-bold">TaskFlow</span>
                </Link>
              </div>
              <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
              <CardDescription className="text-center">
                Enter your email address and we'll send you a link to reset your password
              </CardDescription>
            </CardHeader>

            {isSuccess ? (
              <CardContent className="space-y-4">
                <Alert className="bg-green-500/10 text-green-500 border-green-500/20">
                  <AlertDescription>
                    If an account exists with that email, we've sent you instructions to reset your password. Please
                    check your inbox.
                  </AlertDescription>
                </Alert>
                <Button asChild className="w-full">
                  <Link href="/login">Back to Login</Link>
                </Button>
              </CardContent>
            ) : (
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive" className="text-sm py-2">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4">
                  <div className="text-center text-sm">
                    Remember your password?{" "}
                    <Link href="/login" className="text-primary hover:underline">
                      Back to Login
                    </Link>
                  </div>
                </CardFooter>
              </form>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

