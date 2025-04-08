import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "./lib/auth"
import { rateLimit } from "./middleware/rate-limit"

// List of public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/reset-password",
  "/reset-password/[token]",
  "/invitation/[token]",
  "/features",
  "/testimonials",
  "/documentation",
  "/try",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
]

// List of routes accessible in demo mode
const demoRoutes = [
  "/dashboard",
  "/board",
  "/calendar",
  "/tasks",
  "/team",
  "/chat",
  "/inbox",
  "/notifications",
  "/profile",
  "/settings",
  "/activity",
  "/timeline",
  "/search",
]

// List of static assets that should be excluded from middleware
const staticAssets = ["/_next/static", "/_next/image", "/favicon.ico", "/public"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static assets
  if (staticAssets.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Apply rate limiting
  const rateLimitResponse = await rateLimit(request)
  if (rateLimitResponse.status === 429) {
    return rateLimitResponse
  }

  const token = request.cookies.get("auth_token")?.value
  const isInDemoMode = request.cookies.get("demo_mode")?.value === "true"

  // Check if the route is public
  const isPublicRoute = publicRoutes.some((route) => {
    if (route.includes("[") && route.includes("]")) {
      // Handle dynamic routes
      const routePattern = route.replace(/\[.*?\]/g, "[^/]+")
      const regex = new RegExp(`^${routePattern}$`)
      return regex.test(pathname)
    }
    return pathname === route
  })

  if (isPublicRoute) {
    const response = NextResponse.next()

    // Set demo mode cookie for try route and redirect to dashboard
    if (pathname === "/try") {
      response.cookies.set("demo_mode", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
        sameSite: "lax",
      })
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    return response
  }

  // Check if the route is accessible in demo mode
  const isDemoRoute = demoRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

  // Allow access to demo routes in demo mode
  if (isDemoRoute && isInDemoMode) {
    const response = NextResponse.next()
    // Ensure demo mode cookie is present and refreshed
    response.cookies.set("demo_mode", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
      sameSite: "lax",
    })
    return response
  }

  // For unauthenticated users trying to access demo routes, set demo mode and redirect
  if (isDemoRoute && !token) {
    const response = NextResponse.redirect(new URL("/dashboard", request.url))
    response.cookies.set("demo_mode", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
      sameSite: "lax",
    })
    return response
  }

  // Handle authentication for non-demo routes
  if (!token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(pathname))
    return NextResponse.redirect(url)
  }

  // Verify token for authenticated routes
  try {
    const payload = await verifyToken(token)
    if (!payload) {
      // Token is invalid, redirect to login
      const url = new URL("/login", request.url)
      url.searchParams.set("callbackUrl", encodeURI(pathname))
      // Clear the invalid token
      const response = NextResponse.redirect(url)
      response.cookies.delete("auth_token")
      return response
    }

    // User is authenticated, allow access
    return NextResponse.next()
  } catch (error) {
    console.error("Token verification error in middleware:", error)
    // Token verification failed, redirect to login
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(pathname))
    // Clear the invalid token
    const response = NextResponse.redirect(url)
    response.cookies.delete("auth_token")
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
