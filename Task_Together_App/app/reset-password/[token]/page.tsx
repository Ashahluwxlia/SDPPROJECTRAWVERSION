"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Layout, Loader2, Lock, CheckCircle, AlertTriangle } from "lucide-react"
import { MotionWrapper } from "@/components/motion-wrapper"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { resetPassword, verifyResetToken } from "@/lib/auth-actions"
import { motion } from "framer-motion"

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [isValidToken, setIsValidToken] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const isValid = await verifyResetToken(params.token)
        setIsValidToken(isValid)
      } catch (error) {
        console.error("Token verification error:", error)
        setIsValidToken(false)
      } finally {
        setIsVerifying(false)
      }
    }

    verifyToken()
  }, [params.token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData();
      formData.append("token", params.token);
      formData.append("password", password);
      
      const success = await resetPassword(formData)

      if (success) {
        setIsSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        setError("Failed to reset password. Please try again.")
      }
    } catch (err) {
      console.error("Password reset error:", err)
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-blue p-4">
        <div className="absolute inset-0 bg-dots opacity-20"></div>
        <Card className="w-full max-w-md border-none shadow-xl">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p>Verifying your reset link...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-blue p-4">
        <div className="absolute inset-0 bg-dots opacity-20"></div>
        <MotionWrapper type="scale" className="w-full max-w-md">
          <Card className="border-none shadow-xl">
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-4">
                <Link href="/" className="flex items-center gap-2">
                  <Layout className="h-6 w-6 text-primary" />
                  <span className="text-xl font-bold">TaskFlow</span>
                </Link>
              </div>
              <div className="flex justify-center mb-4">
                <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center">Invalid or Expired Link</CardTitle>
              <CardDescription className="text-center">
                This password reset link is invalid or has expired. Please request a new one.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center pb-6">
              <Button asChild>
                <Link href="/login">Back to Login</Link>
              </Button>
            </CardFooter>
          </Card>
        </MotionWrapper>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-blue p-4">
      <div className="absolute inset-0 bg-dots opacity-20"></div>

      <MotionWrapper type="scale" className="w-full max-w-md">
        <Card className="border-none shadow-xl">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-2">
              <Link href="/" className="flex items-center gap-2">
                <Layout className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">TaskFlow</span>
              </Link>
            </div>

            {isSuccess ? (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  className="flex justify-center mb-4"
                >
                  <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
                    <CheckCircle className="h-12 w-12 text-green-500" />
                  </div>
                </motion.div>
                <CardTitle className="text-2xl mb-2">Password Reset Successful!</CardTitle>
                <CardDescription>
                  Your password has been reset successfully. Redirecting you to login...
                </CardDescription>
              </div>
            ) : (
              <>
                <CardTitle className="text-2xl text-center">Reset Your Password</CardTitle>
                <CardDescription className="text-center">Enter your new password below</CardDescription>
              </>
            )}
          </CardHeader>

          {!isSuccess && (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="text-sm py-2">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Password must be at least 8 characters long</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting...
                    </>
                  ) : (
                    "Reset Password"
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
      </MotionWrapper>
    </div>
  )
}

