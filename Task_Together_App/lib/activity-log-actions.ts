"use server"

import { prisma } from "./prisma"
import { getCurrentUser } from "./auth-actions"
import { getRedisClient } from "./redis"

// Define ActivityLog type to fix the linter error
type ActivityLog = {
  id: string
  userId: string
  boardId: string | null
  taskId: string | null
  action: string
  details: string | null
  createdAt: Date
  user?: {
    id: string
    name: string | null
    avatar: string | null
  } | null
  board?: {
    id: string
    name: string
  } | null
  task?: {
    id: string
    title: string
  } | null
}

// Get activity logs for a board with pagination
export async function getBoardActivityLogs(
  boardId: string,
  page = 1,
  limit = 20,
  isDemoMode = false
): Promise<{ logs: ActivityLog[]; total: number; pages: number }> {
  const user = await getCurrentUser()

  if (!user) {
    return { logs: [], total: 0, pages: 0 }
  }

  try {
    // Try to get from cache first
    const redis = getRedisClient()
    const cacheKey = `activity:board:${boardId}:${user.id}:${page}:${limit}:${isDemoMode ? 'demo' : 'real'}`
    const cachedData = await redis.get(cacheKey)

    if (cachedData) {
      console.log("Using cached activity logs")
      return JSON.parse(cachedData as string)
    }

    // Check if user has access to the board
    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        OR: [{ ownerId: user.id }, { members: { some: { id: user.id } } }],
      },
    })

    if (!board) {
      return { logs: [], total: 0, pages: 0 }
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get total count for pagination
    const total = await prisma.activityLog.count({
      where: { boardId },
    })

    const pages = Math.ceil(total / limit)

    const logs = await prisma.activityLog.findMany({
      where: { boardId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    })

    // Cache the result
    const result = { logs, total, pages }
    await redis.set(cacheKey, JSON.stringify(result), { ex: 60 * 5 }) // Cache for 5 minutes

    return result
  } catch (error) {
    console.error("Error fetching board activity logs:", error)
    return { logs: [], total: 0, pages: 0 }
  }
}

// Get activity logs for a task with pagination
export async function getTaskActivityLogs(
  taskId: string,
  page = 1,
  limit = 20,
  isDemoMode = false
): Promise<{ logs: ActivityLog[]; total: number; pages: number }> {
  const user = await getCurrentUser()

  if (!user) {
    return { logs: [], total: 0, pages: 0 }
  }

  try {
    // Try to get from cache first
    const redis = getRedisClient()
    const cacheKey = `activity:task:${taskId}:${user.id}:${page}:${limit}:${isDemoMode ? 'demo' : 'real'}`
    const cachedData = await redis.get(cacheKey)

    if (cachedData) {
      console.log("Using cached task activity logs")
      return JSON.parse(cachedData as string)
    }

    // Get the task to check access
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { list: { include: { board: true } } },
    })

    if (!task) {
      return { logs: [], total: 0, pages: 0 }
    }

    // Check if user has access to the board
    const board = await prisma.board.findFirst({
      where: {
        id: task.list.boardId,
        OR: [{ ownerId: user.id }, { members: { some: { id: user.id } } }],
      },
    })

    if (!board) {
      return { logs: [], total: 0, pages: 0 }
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get total count for pagination
    const total = await prisma.activityLog.count({
      where: { taskId },
    })

    const pages = Math.ceil(total / limit)

    const logs = await prisma.activityLog.findMany({
      where: { taskId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    })

    // Cache the result
    const result = { logs, total, pages }
    await redis.set(cacheKey, JSON.stringify(result), { ex: 60 * 5 }) // Cache for 5 minutes

    return result
  } catch (error) {
    console.error("Error fetching task activity logs:", error)
    return { logs: [], total: 0, pages: 0 }
  }
}

// Get user activity logs with pagination
export async function getUserActivityLogs(
  page = 1,
  limit = 20,
  isDemoMode = false
): Promise<{ logs: ActivityLog[]; total: number; pages: number }> {
  const user = await getCurrentUser()

  if (!user) {
    return { logs: [], total: 0, pages: 0 }
  }

  try {
    // Try to get from cache first
    const redis = getRedisClient()
    const cacheKey = `activity:user:${user.id}:${page}:${limit}:${isDemoMode ? 'demo' : 'real'}`
    const cachedData = await redis.get(cacheKey)

    if (cachedData) {
      console.log("Using cached user activity logs")
      return JSON.parse(cachedData as string)
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get total count for pagination
    const total = await prisma.activityLog.count({
      where: { userId: user.id },
    })

    const pages = Math.ceil(total / limit)

    const logs = await prisma.activityLog.findMany({
      where: { userId: user.id },
      include: {
        board: {
          select: {
            id: true,
            name: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    })

    // Cache the result
    const result = { logs, total, pages }
    await redis.set(cacheKey, JSON.stringify(result), { ex: 60 * 5 }) // Cache for 5 minutes

    return result
  } catch (error) {
    console.error("Error fetching user activity logs:", error)
    return { logs: [], total: 0, pages: 0 }
  }
}

