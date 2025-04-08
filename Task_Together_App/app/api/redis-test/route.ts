import { NextResponse } from "next/server"
import { getRedisClient, parseRedisConnectionString } from "@/lib/redis"

export async function GET() {
  try {
    const redis = getRedisClient()

    // Test the connection
    const pingResult = await redis.ping()

    // Get connection info for diagnostics (without exposing sensitive data)
    const connectionString = process.env.REDIS_URL || process.env.REDIS_CONNECTION_STRING || ""
    const connectionInfo = parseRedisConnectionString(connectionString)

    // Mask the password for security
    const maskedConnectionInfo = {
      ...connectionInfo,
      password: connectionInfo.password ? "********" : "",
    }

    // Set a test value
    const testKey = "redis-test-" + Date.now()
    await redis.set(testKey, "Redis connection is working!")
    const testValue = await redis.get(testKey)

    // Clean up
    await redis.del(testKey)

    return NextResponse.json({
      status: "success",
      message: "Redis connection is working!",
      ping: pingResult,
      connectionInfo: maskedConnectionInfo,
      testValue,
    })
  } catch (error) {
    console.error("Redis test failed:", error)

    return NextResponse.json(
      {
        status: "error",
        message: "Redis connection failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

