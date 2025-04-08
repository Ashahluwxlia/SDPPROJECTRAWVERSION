import { compare, hash } from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { prisma } from "./prisma"
import { getRedisClient, safeRedisOperation } from "@/lib/redis"
import type { User } from "@/lib/types"
import { v4 as uuidv4 } from "uuid"

// Make sure JWT_SECRET is properly set and consistent
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const TOKEN_EXPIRY = "7d" // 7 days

export type JwtPayload = {
  userId: string
  email: string
  name: string
  role: string
}

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10)
}

// Verify a password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword)
}

// Create a JWT token
export async function createToken(user: User): Promise<string> {
  try {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      name: user.name || "",
      role: user.role || "user",
    }

    // Ensure JWT_SECRET is properly encoded
    const secret = new TextEncoder().encode(JWT_SECRET)

    return await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(TOKEN_EXPIRY)
      .sign(secret)
  } catch (error) {
    console.error("Error creating token:", error)
    throw new Error("Failed to create authentication token")
  }
}

// Verify a JWT token
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    // Ensure we're using the same secret encoding as in createToken
    const secret = new TextEncoder().encode(JWT_SECRET)

    // Add better error handling and logging
    const { payload } = await jwtVerify(token, secret)
    return payload as JwtPayload
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

// Create a session
export async function createSession(userId: string): Promise<string> {
  try {
    const token = await new SignJWT({ sub: userId })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(TOKEN_EXPIRY)
      .sign(new TextEncoder().encode(JWT_SECRET))

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

    try {
      // Try to store session in Redis first
      const redis = getRedisClient()
      const sessionKey = `session:${token}`

      await safeRedisOperation(async () => {
        await redis.set(
          sessionKey,
          JSON.stringify({
            userId,
            expiresAt: expiresAt.toISOString(),
            sessionToken: uuidv4(),
          }),
        )

        // Set expiration in Redis
        await redis.expire(sessionKey, 60 * 60 * 24 * 7) // 7 days
        console.log("Session stored in Redis")
      }, null)

      // If Redis operation failed, fall back to database storage
      if (!(await redis.exists(sessionKey))) {
        console.log("Redis session storage failed, falling back to database")
        await prisma.session.create({
          data: {
            userId,
            id: token,
            sessionToken: uuidv4(),
            expiresAt,
          },
        })
      }
    } catch (error) {
      console.error("Failed to store session in Redis, falling back to database:", error)

      // Fall back to database storage
      await prisma.session.create({
        data: {
          userId,
          id: token,
          sessionToken: uuidv4(),
          expiresAt,
        },
      })
    }

    return token
  } catch (error) {
    console.error("Error creating session:", error)
    throw new Error("Failed to create session")
  }
}

// Validate a session
export async function validateSession(token: string): Promise<User | null> {
  try {
    // Try to get session from Redis first
    const redis = getRedisClient()
    const sessionKey = `session:${token}`

    const sessionData = await safeRedisOperation(async () => await redis.get(sessionKey), null)

    if (sessionData) {
      const session = JSON.parse(sessionData as string)

      // Check if session is expired
      if (new Date(session.expiresAt) < new Date()) {
        await safeRedisOperation(async () => await redis.del(sessionKey), null)
        return null
      }

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
      })

      return user
    }

    // Fall back to database
    console.log("Session not found in Redis, checking database")
    const session = await prisma.session.findUnique({
      where: { id: token },
      include: { user: true },
    })

    if (!session || session.expiresAt < new Date()) {
      return null
    }

    return session.user
  } catch (error) {
    console.error("Session validation failed:", error)
    return null
  }
}

// Delete a session
export async function deleteSession(token: string): Promise<boolean> {
  try {
    // Try to delete from Redis first
    const redis = getRedisClient()
    const sessionKey = `session:${token}`

    await safeRedisOperation(async () => await redis.del(sessionKey), null)

    // Also try to delete from database as a fallback
    try {
      await prisma.session.delete({
        where: { id: token },
      })
    } catch (dbError) {
      // Ignore if not found in database
      console.log("Session not found in database or already deleted")
    }

    return true
  } catch (error) {
    console.error("Redis session deletion failed, trying database:", error)

    // Fall back to database deletion
    try {
      await prisma.session.delete({
        where: { id: token },
      })
      return true
    } catch (dbError) {
      console.error("Failed to delete session from database:", dbError)
      return false
    }
  }
}
