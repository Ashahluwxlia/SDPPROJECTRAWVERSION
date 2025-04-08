import { Redis } from "@upstash/redis"

type RedisConnectionInfo = {
  host: string
  port: string
  username?: string
  password: string
  useTls: boolean
}

/**
 * Parse a Redis connection string into its components
 * Handles both standard Redis URL format and redis-cli format
 */
export function parseRedisConnectionString(connectionString: string): RedisConnectionInfo {
  // Default to secure connection
  let useTls = true
  let host = ""
  let port = "6379" // Default Redis port
  let username = ""
  let password = ""

  try {
    // Check if it's a redis:// or rediss:// URL format
    if (connectionString.startsWith("redis://") || connectionString.startsWith("rediss://")) {
      const url = new URL(connectionString)
      host = url.hostname
      port = url.port || "6379"
      useTls = url.protocol === "rediss:"

      // Extract auth info from URL
      if (url.username) {
        username = decodeURIComponent(url.username)
      }

      if (url.password) {
        password = decodeURIComponent(url.password)
      }

      // Some Redis URLs put the password in the username field when no username is specified
      if (!password && username) {
        password = username
        username = ""
      }
    }
    // Handle redis-cli format: redis-cli -h host -p port -a password
    else if (connectionString.includes("-h") || connectionString.includes("-p") || connectionString.includes("-a")) {
      const parts = connectionString.split(" ")

      for (let i = 0; i < parts.length; i++) {
        if (parts[i] === "-h" && i + 1 < parts.length) {
          host = parts[i + 1]
        } else if (parts[i] === "-p" && i + 1 < parts.length) {
          port = parts[i + 1]
        } else if (parts[i] === "-a" && i + 1 < parts.length) {
          password = parts[i + 1]
        } else if (parts[i] === "--tls" || parts[i] === "--ssl") {
          useTls = true
        } else if (parts[i] === "--no-tls" || parts[i] === "--no-ssl") {
          useTls = false
        }
      }
    }
    // Handle Upstash format: host:port,username,password
    else if (connectionString.includes(",")) {
      const parts = connectionString.split(",")

      if (parts.length >= 1) {
        const hostPort = parts[0].split(":")
        host = hostPort[0]
        if (hostPort.length > 1) {
          port = hostPort[1]
        }
      }

      if (parts.length >= 2) {
        username = parts[1]
      }

      if (parts.length >= 3) {
        password = parts[2]
      }
    }
    // Simple host:port format
    else if (connectionString.includes(":")) {
      const [hostPart, portPart] = connectionString.split(":")
      host = hostPart
      port = portPart
    }
    // Just a host
    else {
      host = connectionString
    }
  } catch (error) {
    console.error("Error parsing Redis connection string:", error)
    // Return default values if parsing fails
    return { host: "", port: "6379", password: "", useTls: true }
  }

  return { host, port, username, password, useTls }
}

// Redis client options with retry strategy
const REDIS_CLIENT_OPTIONS = {
  retryStrategy: (times: number) => {
    // Exponential backoff with max delay of 10 seconds
    const delay = Math.min(times * 100, 10000)
    return delay
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  connectTimeout: 10000, // 10 seconds
}

/**
 * Create a Redis client using environment variables
 * Tries to use Upstash REST API first, then falls back to connection string
 */
export function createRedisClient(): Redis {
  // First try to use Upstash REST API credentials
  const upstashRedisRestUrl = process.env.UPSTASH_REDIS_REST_URL
  const upstashRedisRestToken = process.env.UPSTASH_REDIS_REST_TOKEN

  if (upstashRedisRestUrl && upstashRedisRestToken) {
    return new Redis({
      url: upstashRedisRestUrl,
      token: upstashRedisRestToken,
      ...REDIS_CLIENT_OPTIONS,
    })
  }

  // Fall back to connection string
  const redisUrl = process.env.REDIS_URL || process.env.REDIS_CONNECTION_STRING

  if (!redisUrl) {
    throw new Error("Redis connection information not found in environment variables")
  }

  // Parse the connection string
  const connectionInfo = parseRedisConnectionString(redisUrl)

  // For Upstash Redis, we need to convert to REST API format
  return new Redis({
    url: `https://${connectionInfo.host}`,
    token: connectionInfo.password,
    ...REDIS_CLIENT_OPTIONS,
  })
}

// Singleton Redis client
let redisClient: Redis | null = null
let isConnecting = false
let connectionAttempts = 0
const MAX_CONNECTION_ATTEMPTS = 5

/**
 * Get the Redis client instance (singleton)
 * Includes retry logic and connection management
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    if (isConnecting) {
      // If already trying to connect, wait a bit and try again
      throw new Error("Redis connection in progress, please try again")
    }

    try {
      isConnecting = true
      connectionAttempts++

      redisClient = createRedisClient()
      
      // Reset connection attempts on successful connection
      connectionAttempts = 0
    } catch (error) {
      console.error(`Failed to initialize Redis client (attempt ${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS}):`, error)
      
      if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
        console.error("Maximum Redis connection attempts reached. Application will run with limited functionality.")
        throw new Error("Redis connection failed after multiple attempts")
      }
      
      throw error
    } finally {
      isConnecting = false
    }
  }
  return redisClient
}

/**
 * Safely execute a Redis operation with fallback
 * @param operation The Redis operation to execute
 * @param fallbackValue The value to return if Redis operation fails
 */
export async function safeRedisOperation<T>(
  operation: () => Promise<T>,
  fallbackValue: T
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    console.error("Redis operation failed:", error)
    return fallbackValue
  }
}

/**
 * Batch delete keys matching a pattern
 * @param pattern The key pattern to delete
 * @returns Number of keys deleted
 */
export async function batchDeleteKeys(pattern: string): Promise<number> {
  try {
    const redis = getRedisClient()
    
    // For Upstash Redis, we need to use a different approach
    // as it doesn't support SCAN directly
    const keys = await redis.keys(pattern)
    
    if (keys.length === 0) {
      return 0
    }
    
    // Delete in batches of 100
    const batchSize = 100
    let deletedCount = 0
    
    for (let i = 0; i < keys.length; i += batchSize) {
      const batch = keys.slice(i, i + batchSize)
      await redis.del(...batch)
      deletedCount += batch.length
    }
    
    return deletedCount
  } catch (error) {
    console.error("Error batch deleting keys:", error)
    return 0
  }
}

/**
 * Setup Redis connection at application startup
 */
export async function setupRedisConnection(): Promise<boolean> {
  try {
    const redis = getRedisClient()

    // Test the connection
    await redis.ping()
    console.log("✅ Redis connection established successfully")
    return true
  } catch (error) {
    console.error("❌ Failed to connect to Redis:", error)
    return false
  }
}

