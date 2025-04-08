"use server"

import { cookies } from "next/headers"
import { cache } from "react"

const COOKIE_NAME = "auth_token"
const DEMO_COOKIE_NAME = "demo_mode"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 1 week

interface CookieOptions {
  httpOnly: boolean
  secure: boolean
  maxAge: number
  path: string
  sameSite: "lax" | "strict" | "none"
}

const defaultCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: COOKIE_MAX_AGE,
  path: "/",
  sameSite: "lax",
}

/**
 * Set the authentication cookie
 * @param token The authentication token
 * @param isDemoMode Whether the user is in demo mode
 */
export async function setAuthCookie(token: string, isDemoMode = false): Promise<void> {
  try {
    const cookieStore = await cookies()

    // Set the main auth token
    cookieStore.set({
      name: COOKIE_NAME,
      value: token,
      ...defaultCookieOptions,
    })

    // Set or clear the demo mode flag
    if (isDemoMode) {
      cookieStore.set({
        name: DEMO_COOKIE_NAME,
        value: "true",
        ...defaultCookieOptions,
      })
    } else {
      // If not in demo mode, ensure the demo cookie is removed
      cookieStore.delete(DEMO_COOKIE_NAME)
    }

    console.log(`Auth cookie set successfully. Demo mode: ${isDemoMode}`)
  } catch (error) {
    console.error("Error setting auth cookie:", error)
    throw new Error("Failed to set authentication cookie")
  }
}

/**
 * Get the authentication token from cookies
 * @returns The authentication token or undefined if not found
 */
export const getAuthToken = cache(async (): Promise<string | undefined> => {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    return token
  } catch (error) {
    console.error("Error getting auth token:", error)
    return undefined
  }
})

/**
 * Check if the user is in demo mode
 * @returns True if the user is in demo mode, false otherwise
 */
export const isDemoMode = cache(async (): Promise<boolean> => {
  try {
    const cookieStore = await cookies()
    return cookieStore.get(DEMO_COOKIE_NAME)?.value === "true"
  } catch (error) {
    console.error("Error checking demo mode:", error)
    return false
  }
})

/**
 * Remove the authentication cookies
 */
export async function removeAuthCookie(): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete(COOKIE_NAME)
    cookieStore.delete(DEMO_COOKIE_NAME)
    console.log("Auth cookies removed successfully")
  } catch (error) {
    console.error("Error removing auth cookie:", error)
    throw new Error("Failed to remove authentication cookie")
  }
}

/**
 * Get all authentication-related cookies (useful for debugging)
 * @returns An object containing all authentication-related cookies
 */
export async function getAuthCookies(): Promise<Record<string, string>> {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get(COOKIE_NAME)
    const demoMode = cookieStore.get(DEMO_COOKIE_NAME)

    return {
      authToken: authToken?.value || "",
      demoMode: demoMode?.value || "false",
    }
  } catch (error) {
    console.error("Error getting auth cookies:", error)
    return { authToken: "", demoMode: "false" }
  }
}

/**
 * Set a temporary authentication token (for password reset, email verification, etc.)
 * @param token The temporary token
 * @param maxAge The maximum age of the token in seconds (default: 1 hour)
 */
export async function setTemporaryAuthToken(token: string, maxAge = 3600): Promise<void> {
  try {
    const cookieStore = await cookies()

    cookieStore.set({
      name: "temp_auth_token",
      value: token,
      ...defaultCookieOptions,
      maxAge: maxAge, // Override with custom max age
    })
  } catch (error) {
    console.error("Error setting temporary auth token:", error)
    throw new Error("Failed to set temporary authentication token")
  }
}

/**
 * Clear all authentication-related cookies
 */
export async function clearAllAuthCookies(): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete(COOKIE_NAME)
    cookieStore.delete(DEMO_COOKIE_NAME)
    cookieStore.delete("temp_auth_token")
  } catch (error) {
    console.error("Error clearing all auth cookies:", error)
    throw new Error("Failed to clear all authentication cookies")
  }
}

/**
 * Check if the user is authenticated
 * @returns True if the user is authenticated (has a valid token or is in demo mode)
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const token = await getAuthToken()
    const demoMode = await isDemoMode()

    return !!token || demoMode
  } catch (error) {
    console.error("Error checking authentication:", error)
    return false
  }
}

/**
 * Get the user's authentication status
 * @returns An object containing the user's authentication status
 */
export async function getAuthStatus(): Promise<{
  isAuthenticated: boolean
  isDemoMode: boolean
  hasToken: boolean
}> {
  try {
    const token = await getAuthToken()
    const demoMode = await isDemoMode()

    return {
      isAuthenticated: !!token || demoMode,
      isDemoMode: demoMode,
      hasToken: !!token,
    }
  } catch (error) {
    console.error("Error getting auth status:", error)
    return {
      isAuthenticated: false,
      isDemoMode: false,
      hasToken: false,
    }
  }
}
