import { NextResponse } from "next/server"
import { getRedisClient, parseRedisConnectionString } from "@/lib/redis"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    redis: {
      status: "unknown",
      message: "",
      connectionInfo: {},
    },
    database: {
      status: "unknown",
      message: "",
    },
  }

  // Test Redis connection
  try {
    const redis = getRedisClient()
    await redis.ping()

    // Get connection info for diagnostics (without exposing sensitive data)
    const connectionString = process.env.REDIS_URL || process.env.REDIS_CONNECTION_STRING || ""
    const connectionInfo = parseRedisConnectionString(connectionString)

    diagnostics.redis = {
      status: "connected",
      message: "Redis connection is working",
      connectionInfo: {
        host: connectionInfo.host,
        port: connectionInfo.port,
        useTls: connectionInfo.useTls,
        username: connectionInfo.username ? "********" : "",
        password: connectionInfo.password ? "********" : "",
      },
    }
  } catch (error) {
    diagnostics.redis = {
      status: "error",
      message: error instanceof Error ? error.message : String(error),
      connectionInfo: {},
    }
  }

  // Test PostgreSQL connection
  try {
    // Simple query to test the connection
    await prisma.$queryRaw`SELECT 1`

    diagnostics.database = {
      status: "connected",
      message: "Database connection is working",
    }
  } catch (error) {
    diagnostics.database = {
      status: "error",
      message: error instanceof Error ? error.message : String(error),
    }
  }

  return NextResponse.json(diagnostics)
}

