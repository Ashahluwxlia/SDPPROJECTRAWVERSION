import { type NextRequest, NextResponse } from "next/server"
import { getRedisClient } from "@/lib/redis"

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute in milliseconds
const MAX_REQUESTS_PER_WINDOW = 100 // Maximum requests per window

export async function rateLimit(req: NextRequest) {
  // Skip rate limiting for non-API routes
  if (!req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "anonymous"
    const redis = getRedisClient()

    // Create a unique key for this IP and endpoint
    const key = `rate-limit:${ip}:${req.nextUrl.pathname}`

    // Get current count
    const currentCount = await redis.get(key)
    const count = currentCount ? Number.parseInt(currentCount as string, 10) : 0

    // Check if rate limit exceeded
    if (count >= MAX_REQUESTS_PER_WINDOW) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "Too many requests, please try again later.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": MAX_REQUESTS_PER_WINDOW.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": (Date.now() + RATE_LIMIT_WINDOW).toString(),
          },
        },
      )
    }

    // Increment count
    await redis.incr(key)

    // Set expiration if this is the first request
    if (count === 0) {
      await redis.expire(key, RATE_LIMIT_WINDOW / 1000)
    }

    // Add rate limit headers
    const response = NextResponse.next()
    response.headers.set("X-RateLimit-Limit", MAX_REQUESTS_PER_WINDOW.toString())
    response.headers.set("X-RateLimit-Remaining", (MAX_REQUESTS_PER_WINDOW - count - 1).toString())

    return response
  } catch (error) {
    console.error("Rate limiting error:", error)
    // If rate limiting fails, allow the request to proceed
    return NextResponse.next()
  }
}

