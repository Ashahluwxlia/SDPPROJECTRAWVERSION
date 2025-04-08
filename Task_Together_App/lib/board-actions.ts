"use server"

import { prisma } from "./prisma"
import { getCurrentUser } from "./auth-actions"
import { revalidatePath } from "next/cache"
import { sendEmail } from "./email"
import { getRedisClient, safeRedisOperation, batchDeleteKeys } from "@/lib/redis"
import type { Board, List, Task } from "./types"
import { isDemoMode } from "./auth.server"

// Function to send task assignment email
async function sendTaskAssignmentEmail(
  to: string,
  toName: string,
  taskTitle: string,
  boardName: string,
  assignedBy: string,
) {
  const subject = `You have been assigned to a task: ${taskTitle}`
  const html = `
    <p>Hello ${toName},</p>
    <p>You have been assigned to the task "${taskTitle}" on the board "${boardName}" by ${assignedBy}.</p>
    <p>Please check your dashboard for more details.</p>
  `

  await sendEmail({
    to,
    subject,
    html,
    text: `Hello ${toName},\n\nYou have been assigned to the task "${taskTitle}" on the board "${boardName}" by ${assignedBy}.\n\nPlease check your dashboard for more details.`,
  })
}

// Function to send mention notification email
async function sendMentionNotificationEmail(
  to: string,
  toName: string,
  taskTitle: string,
  boardName: string,
  mentionedBy: string,
) {
  const subject = `You have been mentioned in a comment on task: ${taskTitle}`
  const html = `
    <p>Hello ${toName},</p>
    <p>You have been mentioned in a comment on the task "${taskTitle}" on the board "${boardName}" by ${mentionedBy}.</p>
    <p>Please check your dashboard for more details.</p>
  `

  await sendEmail({
    to,
    subject,
    html,
    text: `Hello ${toName},\n\nYou have been mentioned in a comment on the task "${taskTitle}" on the board "${boardName}" by ${mentionedBy}.\n\nPlease check your dashboard for more details.`,
  })
}

// Get all boards for the current user with pagination
export async function getBoards(page = 1, limit = 10): Promise<{ boards: Board[]; total: number; pages: number }> {
  const user = await getCurrentUser()

  if (!user) {
    return { boards: [], total: 0, pages: 0 }
  }

  try {
    // Check if we're in demo mode
    const demoMode = await isDemoMode()
    
    if (demoMode) {
      // Return mock data for demo users
      const mockBoards: Board[] = [
        {
          id: "demo-board-1",
          name: "Product Development",
          description: "Track the development of our product",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ownerId: user.id,
          background: "#f5f5f5",
          isStarred: true,
        },
        {
          id: "demo-board-2",
          name: "Marketing Campaign",
          description: "Plan and execute our marketing campaign",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ownerId: user.id,
          background: "#e3f2fd",
          isStarred: false,
        },
        {
          id: "demo-board-3",
          name: "Website Redesign",
          description: "Redesign our company website",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ownerId: user.id,
          background: "#f3e5f5",
          isStarred: false,
        },
      ]
      
      // Apply pagination to mock data
      const start = (page - 1) * limit
      const end = start + limit
      const paginatedBoards = mockBoards.slice(start, end)
      
      return {
        boards: paginatedBoards,
        total: mockBoards.length,
        pages: Math.ceil(mockBoards.length / limit),
      }
    }

    // Try to get from cache first
    const redis = getRedisClient()
    const cacheKey = `boards:${user.id}:${page}:${limit}`
    const cachedData = await redis.get(cacheKey)

    if (cachedData) {
      console.log("Using cached boards data")
      return JSON.parse(cachedData as string)
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get total count for pagination
    const total = await prisma.board.count({
      where: {
        OR: [{ ownerId: user.id }, { members: { some: { id: user.id } } }],
      },
    })

    const pages = Math.ceil(total / limit)

    // Get boards with pagination
    const boards = await prisma.board.findMany({
      where: {
        OR: [{ ownerId: user.id }, { members: { some: { id: user.id } } }],
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
    })

    // Cache the result
    const result = { 
      boards: boards.map(board => ({
        id: board.id,
        name: board.name,
        description: board.description || undefined,
        createdAt: board.createdAt.toISOString(),
        updatedAt: board.updatedAt.toISOString(),
        ownerId: board.ownerId,
        background: board.background || undefined,
        isStarred: board.isStarred || false
      })), 
      total, 
      pages 
    }
    await redis.set(cacheKey, JSON.stringify(result), { ex: 60 * 5 }) // Cache for 5 minutes

    return result
  } catch (error) {
    console.error("Error fetching boards:", error)
    return { boards: [], total: 0, pages: 0 }
  }
}

// Get a specific board
export async function getBoard(id: string): Promise<Board | null> {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  try {
    // Check if we're in demo mode
    const demoMode = await isDemoMode()
    
    if (demoMode) {
      // Return mock data for demo users
      const mockBoards: Board[] = [
        {
          id: "demo-board-1",
          name: "Product Development",
          description: "Track the development of our product",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ownerId: user.id,
          background: "#f5f5f5",
          isStarred: true,
        },
        {
          id: "demo-board-2",
          name: "Marketing Campaign",
          description: "Plan and execute our marketing campaign",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ownerId: user.id,
          background: "#e3f2fd",
          isStarred: false,
        },
        {
          id: "demo-board-3",
          name: "Website Redesign",
          description: "Redesign our company website",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ownerId: user.id,
          background: "#f3e5f5",
          isStarred: false,
        },
      ]
      
      // Find the board in the mock data
      const board = mockBoards.find((b) => b.id === id)
      return board || null
    }

    // Try to get from cache first
    const redis = getRedisClient()
    const cacheKey = `board:${id}:${user.id}`
    
    const cachedData = await safeRedisOperation(
      async () => await redis.get(cacheKey),
      null
    )

    if (cachedData) {
      console.log("Using cached board data")
      const parsedData = JSON.parse(cachedData as string) as Board
      return parsedData
    }

    const board = await prisma.board.findFirst({
      where: {
        id,
        OR: [{ ownerId: user.id }, { members: { some: { id: user.id } } }],
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    })

    // Cache the result
    if (board) {
      const transformedBoard = {
        id: board.id,
        name: board.name,
        description: board.description || undefined,
        createdAt: board.createdAt.toISOString(),
        updatedAt: board.updatedAt.toISOString(),
        ownerId: board.ownerId,
        background: board.background || undefined,
        isStarred: board.isStarred || false
      }
      await safeRedisOperation(
        async () => await redis.set(cacheKey, JSON.stringify(transformedBoard), { ex: 60 * 5 }), // Cache for 5 minutes
        null
      )
      return transformedBoard
    }

    return board
  } catch (error) {
    console.error("Error fetching board:", error)
    return null
  }
}

// Create a new board
export async function createBoard(formData: FormData): Promise<{ success: boolean; boardId?: string; error?: string }> {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, error: "You must be logged in to create a board" }
  }

  try {
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const background = formData.get("background") as string

    if (!name) {
      return { success: false, error: "Board name is required" }
    }

    // Check if we're in demo mode
    const demoMode = await isDemoMode()
    
    if (demoMode) {
      // For demo mode, just return a success response with a mock board ID
      return { 
        success: true, 
        boardId: `demo-board-${Date.now()}` 
      }
    }

    const board = await prisma.board.create({
      data: {
        name,
        description,
        background: background || "#f5f5f5",
        owner: { connect: { id: user.id } },
        members: { connect: { id: user.id } },
      },
    })

    // Create default lists
    await prisma.list.createMany({
      data: [
        { name: "To Do", position: 0, boardId: board.id },
        { name: "In Progress", position: 1, boardId: board.id },
        { name: "Review", position: 2, boardId: board.id },
        { name: "Done", position: 3, boardId: board.id },
      ],
    })

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: "create",
        details: `Created board "${name}"`,
        entityType: "board",
        entityId: board.id,
        userId: user.id,
        boardId: board.id,
      },
    })

    // Invalidate cache
    try {
      const redis = getRedisClient()
      await redis.del(`boards:${user.id}:*`) // Delete all cached board lists for this user
    } catch (cacheError) {
      console.error("Cache invalidation error:", cacheError)
    }

    revalidatePath("/dashboard")

    return { success: true, boardId: board.id }
  } catch (error) {
    console.error("Error creating board:", error)
    return { success: false, error: "An error occurred while creating the board" }
  }
}

// Update a board
export async function updateBoard(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, error: "You must be logged in to update a board" }
  }

  try {
    const id = formData.get("id") as string
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const background = formData.get("background") as string
    const isStarred = formData.get("isStarred") === "true"

    if (!id || !name) {
      return { success: false, error: "Board ID and name are required" }
    }

    // Check if we're in demo mode
    const demoMode = await isDemoMode()
    
    if (demoMode) {
      // For demo mode, just return a success response
      return { success: true }
    }

    // Check if user has access to the board
    const board = await prisma.board.findFirst({
      where: {
        id,
        OR: [{ ownerId: user.id }, { members: { some: { id: user.id } } }],
      },
    })

    if (!board) {
      return { success: false, error: "Board not found or access denied" }
    }

    // Update the board
    await prisma.board.update({
      where: { id },
      data: {
        name,
        description,
        background,
        isStarred,
      },
    })

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: "update",
        details: `Updated board "${name}"`,
        entityType: "board",
        entityId: id,
        userId: user.id,
        boardId: id,
      },
    })

    // Invalidate cache
    try {
      const redis = getRedisClient()
      await redis.del(`board:${id}:${user.id}`) // Delete specific board cache
      await redis.del(`boards:${user.id}:*`) // Delete all cached board lists for this user
    } catch (cacheError) {
      console.error("Cache invalidation error:", cacheError)
    }

    revalidatePath(`/board/${id}`)
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error updating board:", error)
    return { success: false, error: "An error occurred while updating the board" }
  }
}

// Delete a board
export async function deleteBoard(id: string): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, error: "You must be logged in to delete a board" }
  }

  try {
    // Check if we're in demo mode
    const demoMode = await isDemoMode()
    
    if (demoMode) {
      // For demo mode, just return a success response
      return { success: true }
    }

    // Check if user is the owner of the board
    const board = await prisma.board.findFirst({
      where: {
        id,
        ownerId: user.id,
      },
    })

    if (!board) {
      return { success: false, error: "Board not found or you are not the owner" }
    }

    // Delete the board
    await prisma.board.delete({
      where: { id },
    })

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: "delete",
        details: `Deleted board "${board.name}"`,
        entityType: "board",
        entityId: id,
        userId: user.id,
      },
    })

    // Invalidate cache
    try {
      const redis = getRedisClient()
      await redis.del(`board:${id}:${user.id}`) // Delete specific board cache
      await redis.del(`boards:${user.id}:*`) // Delete all cached board lists for this user
    } catch (cacheError) {
      console.error("Cache invalidation error:", cacheError)
    }

    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error deleting board:", error)
    return { success: false, error: "An error occurred while deleting the board" }
  }
}

// Get all lists for a board with pagination
export async function getLists(
  boardId: string,
  page = 1,
  limit = 10,
): Promise<{ lists: List[]; total: number; pages: number }> {
  const user = await getCurrentUser()

  if (!user) {
    return { lists: [], total: 0, pages: 0 }
  }

  try {
    // Check if we're in demo mode
    const demoMode = await isDemoMode()
    
    if (demoMode) {
      // Return mock data for demo users
      const mockLists: List[] = [
        {
          id: "demo-list-1",
          name: "To Do",
          boardId: "demo-board-1",
          position: 0,
          tasks: [
            {
              id: "demo-task-1",
              title: "Research competitors",
              description: "Analyze top 5 competitors and their features",
              listId: "demo-list-1",
              position: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              priority: "High",
              dueDate: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
              assignee: {
                id: user.id,
                name: user.name || "",
                avatar: user.avatar || "",
              },
              labels: [
                { id: "demo-label-1", name: "Research", color: "#61bd4f" },
                { id: "demo-label-2", name: "Important", color: "#f2d600" },
              ],
              comments: [
                {
                  id: "demo-comment-1",
                  text: "I'll start with the top 3 competitors first.",
                  createdAt: new Date().toISOString(),
                  user: {
                    id: user.id,
                    name: user.name || "",
                    avatar: user.avatar || "",
                  },
                },
              ],
            },
          ],
        },
        {
          id: "demo-list-2",
          name: "In Progress",
          boardId: "demo-board-1",
          position: 1,
          tasks: [],
        },
        {
          id: "demo-list-3",
          name: "Review",
          boardId: "demo-board-1",
          position: 2,
          tasks: [],
        },
        {
          id: "demo-list-4",
          name: "Done",
          boardId: "demo-board-1",
          position: 3,
          tasks: [],
        },
      ]
      
      // Filter lists for the specified board
      const filteredLists = mockLists.filter((l) => l.boardId === boardId)
      
      // Apply pagination to mock data
      const start = (page - 1) * limit
      const end = start + limit
      const paginatedLists = filteredLists.slice(start, end)
      
      return {
        lists: paginatedLists,
        total: filteredLists.length,
        pages: Math.ceil(filteredLists.length / limit),
      }
    }

    // Try to get from cache first
    const redis = getRedisClient()
    const cacheKey = `lists:${boardId}:${user.id}:${page}:${limit}`
    const cachedData = await redis.get(cacheKey)

    if (cachedData) {
      console.log("Using cached lists data")
      return JSON.parse(cachedData as string)
    }

    // Check if user has access to the board
    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        OR: [{ ownerId: user.id }, { members: { some: { id: user.id } } }],
      },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    })

    if (!board) {
      return { lists: [], total: 0, pages: 0 }
    }

    // Get total count for pagination
    const total = await prisma.list.count({
      where: { boardId },
    })

    const pages = Math.ceil(total / limit)

    // For lists, we typically want all of them for a board view, so we'll ignore pagination here
    // but keep the pagination structure for consistency
    const lists = await prisma.list.findMany({
      where: { boardId },
      include: {
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            labels: true,
            tags: true,
            comments: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
              },
            },
            attachments: true,
          },
          orderBy: { position: "asc" },
        },
      },
      orderBy: { position: "asc" },
    })

    // Cache the result
    const result = { 
      lists: lists.map(list => ({
        ...list,
        tasks: list.tasks.map(task => ({
          ...task,
          description: task.description || undefined,
          dueDate: task.dueDate?.toISOString(),
          createdAt: task.createdAt.toISOString(),
          updatedAt: task.updatedAt.toISOString(),
          priority: (task.priority as "High" | "Low" | "Medium" | "Critical" | undefined) || undefined,
          status: (task.status as "In Progress" | "Review" | "To-Do" | "Completed" | undefined) || undefined,
          category: task.category || undefined,
          recurringPattern: (task.recurringPattern as "Daily" | "Weekly" | "Monthly" | undefined) || undefined,
          reminderDate: task.reminderDate?.toISOString(),
          completedAt: task.completedAt?.toISOString(),
          completedBy: task.completedBy || undefined,
          attachments: task.attachments.map(attachment => ({
            ...attachment,
            size: attachment.size ? parseInt(attachment.size) : undefined,
            uploadedAt: attachment.uploadedAt?.toISOString()
          })),
          labels: task.labels || [],
          tags: task.tags.map(tag => tag.name),
          comments: task.comments.map(comment => ({
            id: comment.id,
            text: comment.text,
            createdAt: comment.createdAt.toISOString(),
            mentions: comment.mentions ? comment.mentions.split(',') : undefined,
            user: {
              id: comment.user.id,
              name: comment.user.name,
              avatar: comment.user.avatar || undefined
            }
          })),
          assignee: task.assignee ? {
            id: task.assignee.id,
            name: task.assignee.name,
            avatar: task.assignee.avatar || undefined
          } : undefined
        }))
      })), 
      total, 
      pages 
    }
    await redis.set(cacheKey, JSON.stringify(result), { ex: 60 * 5 }) // Cache for 5 minutes

    return result
  } catch (error) {
    console.error("Error fetching lists:", error)
    return { lists: [], total: 0, pages: 0 }
  }
}

// Get tasks with pagination
export async function getTasks(
  listId: string,
  page = 1,
  limit = 20,
): Promise<{ tasks: Task[]; total: number; pages: number }> {
  const user = await getCurrentUser()

  if (!user) {
    return { tasks: [], total: 0, pages: 0 }
  }

  try {
    // Try to get from cache first
    const redis = getRedisClient()
    const cacheKey = `tasks:${listId}:${user.id}:${page}:${limit}`
    const cachedData = await redis.get(cacheKey)

    if (cachedData) {
      console.log("Using cached tasks data")
      return JSON.parse(cachedData as string)
    }

    // Get the list to check board access
    const list = await prisma.list.findUnique({
      where: { id: listId },
      include: { board: true },
    })

    if (!list) {
      return { tasks: [], total: 0, pages: 0 }
    }

    // Check if user has access to the board
    const board = await prisma.board.findFirst({
      where: {
        id: list.boardId,
        OR: [{ ownerId: user.id }, { members: { some: { id: user.id } } }],
      },
    })

    if (!board) {
      return { tasks: [], total: 0, pages: 0 }
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get total count for pagination
    const total = await prisma.task.count({
      where: { listId },
    })

    const pages = Math.ceil(total / limit)

    // Get tasks with pagination
    const tasks = await prisma.task.findMany({
      where: { listId },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        labels: true,
        tags: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        attachments: true,
      },
      orderBy: { position: "asc" },
      skip,
      take: limit,
    })

    // Cache the result
    const result = { 
      tasks: tasks.map(task => ({
        ...task,
        description: task.description || undefined,
        dueDate: task.dueDate?.toISOString(),
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
        priority: (task.priority as "High" | "Low" | "Medium" | "Critical" | undefined) || undefined,
        status: (task.status as "In Progress" | "Review" | "To-Do" | "Completed" | undefined) || undefined,
        category: task.category || undefined,
        recurringPattern: (task.recurringPattern as "Daily" | "Weekly" | "Monthly" | undefined) || undefined,
        reminderDate: task.reminderDate?.toISOString(),
        completedAt: task.completedAt?.toISOString(),
        completedBy: task.completedBy || undefined,
        attachments: task.attachments.map(attachment => ({
          ...attachment,
          size: attachment.size ? parseInt(attachment.size) : undefined,
          uploadedAt: attachment.uploadedAt?.toISOString()
        })),
        labels: task.labels || [],
        tags: task.tags.map(tag => tag.name),
        comments: task.comments.map(comment => ({
          id: comment.id,
          text: comment.text,
          createdAt: comment.createdAt.toISOString(),
          mentions: comment.mentions ? comment.mentions.split(',') : undefined,
          user: {
            id: comment.user.id,
            name: comment.user.name,
            avatar: comment.user.avatar || undefined
          }
        })),
        assignee: task.assignee ? {
          id: task.assignee.id,
          name: task.assignee.name,
          avatar: task.assignee.avatar || undefined
        } : undefined
      })), 
      total, 
      pages 
    }
    await redis.set(cacheKey, JSON.stringify(result), { ex: 60 * 5 }) // Cache for 5 minutes

    return result
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return { tasks: [], total: 0, pages: 0 }
  }
}

// Create a new list
export async function createList(formData: FormData): Promise<{ success: boolean; list?: List; error?: string }> {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, error: "You must be logged in to create a list" }
  }

  try {
    const name = formData.get("name") as string
    const boardId = formData.get("boardId") as string

    if (!name || !boardId) {
      return { success: false, error: "List name and board ID are required" }
    }

    // Check if we're in demo mode
    const demoMode = await isDemoMode()
    
    if (demoMode) {
      return { 
        success: true, 
        list: {
          id: `demo-list-${Date.now()}`,
          name,
          boardId,
          position: 0,
          tasks: []
        }
      }
    }

    // Check if user has access to the board
    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        OR: [{ ownerId: user.id }, { members: { some: { id: user.id } } }],
      },
    })

    if (!board) {
      return { success: false, error: "Board not found or access denied" }
    }

    // Get the highest position
    const highestPositionList = await prisma.list.findFirst({
      where: { boardId },
      orderBy: { position: "desc" },
    })

    const position = highestPositionList ? highestPositionList.position + 1 : 0

    // Create the list
    const list = await prisma.list.create({
      data: {
        name,
        boardId,
        position,
      },
      include: {
        tasks: {
          include: {
            assignee: true,
            labels: true,
            tags: true,
            attachments: true,
            comments: {
              include: {
                user: true
              }
            }
          }
        }
      }
    })

    // Transform the list to match List type
    const transformedList: List = {
      id: list.id,
      name: list.name,
      boardId: list.boardId,
      position: list.position,
      tasks: list.tasks.map(task => ({
        ...task,
        description: task.description || undefined,
        dueDate: task.dueDate?.toISOString(),
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
        priority: (task.priority as "High" | "Low" | "Medium" | "Critical" | undefined) || undefined,
        status: (task.status as "In Progress" | "Review" | "To-Do" | "Completed" | undefined) || undefined,
        category: task.category || undefined,
        recurringPattern: (task.recurringPattern as "Daily" | "Weekly" | "Monthly" | undefined) || undefined,
        reminderDate: task.reminderDate?.toISOString(),
        completedAt: task.completedAt?.toISOString(),
        completedBy: task.completedBy || undefined,
        attachments: task.attachments.map(attachment => ({
          ...attachment,
          size: attachment.size ? parseInt(attachment.size) : undefined,
          uploadedAt: attachment.uploadedAt?.toISOString()
        })),
        labels: task.labels || [],
        tags: task.tags.map(tag => tag.name),
        comments: task.comments.map(comment => ({
          id: comment.id,
          text: comment.text,
          createdAt: comment.createdAt.toISOString(),
          mentions: comment.mentions ? comment.mentions.split(',') : undefined,
          user: {
            id: comment.user.id,
            name: comment.user.name,
            avatar: comment.user.avatar || undefined
          }
        })),
        assignee: task.assignee ? {
          id: task.assignee.id,
          name: task.assignee.name,
          avatar: task.assignee.avatar || undefined
        } : undefined
      }))
    }

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: "create",
        details: `Created list "${name}"`,
        entityType: "list",
        entityId: list.id,
        userId: user.id,
        boardId,
      },
    })

    // Invalidate cache
    try {
      const redis = getRedisClient()
      await redis.del(`lists:${boardId}:${user.id}:*`) // Delete all cached lists for this board
    } catch (cacheError) {
      console.error("Cache invalidation error:", cacheError)
    }

    revalidatePath(`/board/${boardId}`)

    return { success: true, list: transformedList }
  } catch (error) {
    console.error("Error creating list:", error)
    return { success: false, error: "An error occurred while creating the list" }
  }
}

// Update a list
export async function updateList(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, error: "You must be logged in to update a list" }
  }

  try {
    const id = formData.get("id") as string
    const name = formData.get("name") as string
    const position = Number.parseInt(formData.get("position") as string)

    if (!id || !name) {
      return { success: false, error: "List ID and name are required" }
    }

    const demoMode = await isDemoMode()
    if (demoMode) {
      return { success: true }
    }

    // Get the list to check board access
    const list = await prisma.list.findUnique({
      where: { id },
      include: { board: true },
    })

    if (!list) {
      return { success: false, error: "List not found" }
    }

    // Check if user has access to the board
    const board = await prisma.board.findFirst({
      where: {
        id: list.boardId,
        OR: [{ ownerId: user.id }, { members: { some: { id: user.id } } }],
      },
    })

    if (!board) {
      return { success: false, error: "Board not found or access denied" }
    }

    // Update the list
    await prisma.list.update({
      where: { id },
      data: {
        name,
        position: isNaN(position) ? undefined : position,
      },
    })

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: "update",
        details: `Updated list "${name}"`,
        entityType: "list",
        entityId: id,
        userId: user.id,
        boardId: list.boardId,
      },
    })

    // Invalidate cache
    try {
      const redis = getRedisClient()
      await redis.del(`lists:${list.boardId}:${user.id}:*`) // Delete all cached lists for this board
    } catch (cacheError) {
      console.error("Cache invalidation error:", cacheError)
    }

    revalidatePath(`/board/${list.boardId}`)

    return { success: true }
  } catch (error) {
    console.error("Error updating list:", error)
    return { success: false, error: "An error occurred while updating the list" }
  }
}

// Delete a list
export async function deleteList(id: string): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, error: "You must be logged in to delete a list" }
  }

  try {
    const demoMode = await isDemoMode()
    if (demoMode) {
      return { success: true }
    }

    // Get the list to check board access
    const list = await prisma.list.findUnique({
      where: { id },
      include: { board: true },
    })

    if (!list) {
      return { success: false, error: "List not found" }
    }

    // Check if user has access to the board
    const board = await prisma.board.findFirst({
      where: {
        id: list.boardId,
        OR: [{ ownerId: user.id }, { members: { some: { id: user.id } } }],
      },
    })

    if (!board) {
      return { success: false, error: "Board not found or access denied" }
    }

    // Delete the list
    await prisma.list.delete({
      where: { id },
    })

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: "delete",
        details: `Deleted list "${list.name}"`,
        entityType: "list",
        entityId: id,
        userId: user.id,
        boardId: list.boardId,
      },
    })

    // Invalidate cache
    try {
      const redis = getRedisClient()
      await redis.del(`lists:${list.boardId}:${user.id}:*`) // Delete all cached lists for this board
    } catch (cacheError) {
      console.error("Cache invalidation error:", cacheError)
    }

    revalidatePath(`/board/${list.boardId}`)

    return { success: true }
  } catch (error) {
    console.error("Error deleting list:", error)
    return { success: false, error: "An error occurred while deleting the list" }
  }
}

// Create a new task
export async function createTask(formData: FormData): Promise<{ success: boolean; task?: Task; error?: string }> {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, error: "You must be logged in to create a task" }
  }

  try {
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const listId = formData.get("listId") as string
    const priority = formData.get("priority") as string
    const dueDate = formData.get("dueDate") as string
    const assigneeId = (formData.get("assigneeId") as string) || user.id

    if (!title || !listId) {
      return { success: false, error: "Task title and list ID are required" }
    }

    const demoMode = await isDemoMode()
    if (demoMode) {
      return {
        success: true,
        task: {
          id: `demo-task-${Date.now()}`,
          title,
          description: description || "",
          listId,
          position: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          priority: (priority || "medium") as "Critical" | "High" | "Medium" | "Low",
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
          assignee: {
            id: user.id,
            name: user.name || "",
            avatar: user.avatar || "",
          },
          labels: [],
          tags: [],
          comments: [],
          attachments: [],
        }
      }
    }

    // Get the list to check board access
    const list = await prisma.list.findUnique({
      where: { id: listId },
      include: { board: true },
    })

    if (!list) {
      return { success: false, error: "List not found" }
    }

    // Check if user has access to the board
    const board = await prisma.board.findFirst({
      where: {
        id: list.boardId,
        OR: [{ ownerId: user.id }, { members: { some: { id: user.id } } }],
      },
    })

    if (!board) {
      return { success: false, error: "Board not found or access denied" }
    }

    // Get the highest position
    const highestPositionTask = await prisma.task.findFirst({
      where: { listId },
      orderBy: { position: "desc" },
    })

    const position = highestPositionTask ? highestPositionTask.position + 1 : 0

    // Create the task
    const task = await prisma.task.create({
      data: {
        title,
        description: description || undefined,
        listId,
        position,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        assigneeId,
      },
      include: {
        assignee: true,
        labels: true,
        tags: true,
        attachments: true,
        comments: {
          include: {
            user: true
          }
        }
      },
    })

    // Transform the task to match the Task type
    const transformedTask: Task = {
      id: task.id,
      title: task.title,
      description: task.description || undefined,
      listId: task.listId,
      position: task.position,
      dueDate: task.dueDate?.toISOString(),
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      priority: (task.priority as "High" | "Low" | "Medium" | "Critical" | undefined) || undefined,
      status: (task.status as "In Progress" | "Review" | "To-Do" | "Completed" | undefined) || undefined,
      category: task.category || undefined,
      recurringPattern: (task.recurringPattern as "Daily" | "Weekly" | "Monthly" | undefined) || undefined,
      reminderDate: task.reminderDate?.toISOString(),
      completedAt: task.completedAt?.toISOString(),
      completedBy: task.completedBy || undefined,
      attachments: task.attachments.map(attachment => ({
        id: attachment.id,
        name: attachment.name,
        url: attachment.url,
        size: attachment.size ? parseInt(attachment.size) : undefined,
        type: attachment.type,
        uploadedAt: attachment.uploadedAt?.toISOString()
      })),
      labels: task.labels || [],
      tags: task.tags.map(tag => tag.name),
      comments: task.comments.map(comment => ({
        id: comment.id,
        text: comment.text,
        createdAt: comment.createdAt.toISOString(),
        mentions: comment.mentions ? comment.mentions.split(',') : undefined,
        user: {
          id: comment.user.id,
          name: comment.user.name,
          avatar: comment.user.avatar || undefined
        }
      })),
      assignee: task.assignee ? {
        id: task.assignee.id,
        name: task.assignee.name,
        avatar: task.assignee.avatar || undefined
      } : undefined
    }

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: "create",
        details: `Created task "${title}"`,
        entityType: "task",
        entityId: task.id,
        userId: user.id,
        boardId: list.boardId,
        taskId: task.id,
      },
    })

    // Create task history entry
    await prisma.taskHistoryEntry.create({
      data: {
        action: "created",
        userId: user.id,
        taskId: task.id,
        details: `Task created by ${user.name}`
      },
    })

    // Send notification if assigned to someone else
    if (assigneeId && assigneeId !== user.id) {
      const assignee = await prisma.user.findUnique({
        where: { id: assigneeId },
      })

      if (assignee) {
        // Create notification
        await prisma.notification.create({
          data: {
            type: "assignment",
            title: "Task Assigned",
            message: `${user.name} assigned you to "${title}"`,
            taskId: task.id,
            boardId: list.boardId,
            userId: assigneeId,
          },
        })

        // Send email notification
        await sendTaskAssignmentEmail(assignee.email, assignee.name, title, board.name, user.name)
      }
    }

    // Invalidate cache
    try {
      const redis = getRedisClient()
      await redis.del(`tasks:${listId}:${user.id}:*`) // Delete all cached tasks for this list
      await redis.del(`lists:${list.boardId}:${user.id}:*`) // Delete all cached lists for this board
    } catch (cacheError) {
      console.error("Cache invalidation error:", cacheError)
    }

    // Send real-time update via WebSocket
    try {
      const eventData = {
        type: "TASK_CREATED",
        payload: {
          task: transformedTask,
          listId,
          boardId: list.boardId,
        },
      }

      // Publish to Redis for WebSocket server to pick up
      const redis = getRedisClient()
      await safeRedisOperation(
        async () => await redis.set("board-updates-latest", JSON.stringify(eventData)),
        null
      )
    } catch (wsError) {
      console.error("WebSocket notification error:", wsError)
    }

    revalidatePath(`/board/${list.boardId}`)

    return { success: true, task: transformedTask }
  } catch (error) {
    console.error("Error creating task:", error)
    return { success: false, error: "An error occurred while creating the task" }
  }
}

// Update a task
export async function updateTask(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, error: "You must be logged in to update a task" }
  }

  try {
    const id = formData.get("id") as string
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const priority = formData.get("priority") as string
    const dueDate = formData.get("dueDate") as string
    const assigneeId = formData.get("assigneeId") as string
    const isPinned = formData.get("isPinned") === "true"
    const isRecurring = formData.get("isRecurring") === "true"
    const recurringPattern = formData.get("recurringPattern") as string
    const reminderDate = formData.get("reminderDate") as string
    const category = formData.get("category") as string

    if (!id || !title) {
      return { success: false, error: "Task ID and title are required" }
    }

    const demoMode = await isDemoMode()
    if (demoMode) {
      return { success: true }
    }

    // Get the task to check access
    const task = await prisma.task.findUnique({
      where: { id },
      include: { list: { include: { board: true } } },
    })

    if (!task) {
      return { success: false, error: "Task not found" }
    }

    // Check if user has access to the board
    const board = await prisma.board.findFirst({
      where: {
        id: task.list.boardId,
        OR: [{ ownerId: user.id }, { members: { some: { id: user.id } } }],
      },
      include: {
        members: true
      }
    })

    if (!board) {
      return { success: false, error: "Board not found or access denied" }
    }

    // Track changes for history
    const changes = []

    if (title !== task.title) {
      changes.push({
        field: "title",
        oldValue: task.title,
        newValue: title,
      })
    }

    if (description !== task.description) {
      changes.push({
        field: "description",
        oldValue: task.description || "",
        newValue: description || "",
      })
    }

    if (priority !== task.priority) {
      changes.push({
        field: "priority",
        oldValue: task.priority || "",
        newValue: priority || "",
      })
    }

    const oldDueDate = task.dueDate ? task.dueDate.toISOString().split("T")[0] : ""
    if (dueDate !== oldDueDate) {
      changes.push({
        field: "dueDate",
        oldValue: oldDueDate,
        newValue: dueDate || "",
      })
    }

    if (assigneeId !== task.assigneeId) {
      const oldAssignee = task.assigneeId ? await prisma.user.findUnique({ where: { id: task.assigneeId } }) : null
      const newAssignee = assigneeId ? await prisma.user.findUnique({ where: { id: assigneeId } }) : null

      changes.push({
        field: "assignee",
        oldValue: oldAssignee?.name || "Unassigned",
        newValue: newAssignee?.name || "Unassigned",
      })
    }

    // Update the task
    await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        priority,
          dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId: assigneeId || null,
        isPinned,
        isRecurring,
        recurringPattern: isRecurring ? recurringPattern : null,
        reminderDate: reminderDate ? new Date(reminderDate) : null,
        category: category || null,
      },
    })

    // Create task history entries for each change
    for (const change of changes) {
      await prisma.taskHistoryEntry.create({
        data: {
          action: "updated",
          userId: user.id,
          taskId: id,
          details: `${change.field} changed from "${change.oldValue}" to "${change.newValue}"`
        },
      })
    }

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: "update",
        details: `Updated task "${title}"`,
        entityType: "task",
        entityId: id,
        userId: user.id,
        boardId: task.list.boardId,
        taskId: id,
      },
    })

    // Send notification if assigned to someone else
    if (assigneeId && assigneeId !== task.assigneeId && assigneeId !== user.id) {
      const assignee = await prisma.user.findUnique({
        where: { id: assigneeId },
      })

      if (assignee) {
        // Create notification
        await prisma.notification.create({
          data: {
            type: "assignment",
            title: "Task Assigned",
            message: `${user.name} assigned you to "${title}"`,
            taskId: id,
            boardId: task.list.boardId,
            userId: assigneeId,
          },
        })

        // Send email notification
        await sendTaskAssignmentEmail(assignee.email, assignee.name, title, board.name, user.name)
      }
    }

    // Invalidate cache
    try {
      const redis = getRedisClient()
      await safeRedisOperation(
        async () => {
          await batchDeleteKeys(`tasks:${task.listId}:${user.id}:*`) // Delete all cached tasks for this list
          await batchDeleteKeys(`lists:${task.list.boardId}:${user.id}:*`) // Delete all cached lists for this board
        },
        null
      )
    } catch (cacheError) {
      console.error("Cache invalidation error:", cacheError)
    }

    // Send real-time update via WebSocket
    try {
      const eventData = {
        type: "TASK_UPDATED",
        payload: {
          taskId: id,
          changes,
          listId: task.listId,
          boardId: task.list.boardId,
        },
      }

      // Publish to Redis for WebSocket server to pick up
      const redis = getRedisClient()
      await safeRedisOperation(
        async () => await redis.set("board-updates-latest", JSON.stringify(eventData)),
        null
      )
    } catch (wsError) {
      console.error("WebSocket notification error:", wsError)
    }

    revalidatePath(`/board/${task.list.boardId}`)

    return { success: true }
  } catch (error) {
    console.error("Error updating task:", error)
    return { success: false, error: "An error occurred while updating the task" }
  }
}

// Delete a task
export async function deleteTask(id: string): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, error: "You must be logged in to delete a task" }
  }

  try {
    // Get the task to check access
    const task = await prisma.task.findUnique({
      where: { id },
      include: { list: { include: { board: true } } },
    })

    if (!task) {
      return { success: false, error: "Task not found" }
    }

    // Check if user has access to the board
    const board = await prisma.board.findFirst({
      where: {
        id: task.list.boardId,
        OR: [{ ownerId: user.id }, { members: { some: { id: user.id } } }],
      },
    })

    if (!board) {
      return { success: false, error: "Board not found or access denied" }
    }

    // Delete the task
    await prisma.task.delete({
      where: { id },
    })

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: "delete",
        details: `Deleted task "${task.title}"`,
        entityType: "task",
        entityId: id,
        userId: user.id,
        boardId: task.list.boardId,
      },
    })

    // Invalidate cache
    try {
      const redis = getRedisClient()
      await redis.del(`tasks:${task.listId}:${user.id}:*`) // Delete all cached tasks for this list
      await redis.del(`lists:${task.list.boardId}:${user.id}:*`) // Delete all cached lists for this board
    } catch (cacheError) {
      console.error("Cache invalidation error:", cacheError)
    }

    // Send real-time update via WebSocket
    try {
      const eventData = {
        type: "TASK_DELETED",
        payload: {
          taskId: id,
          listId: task.listId,
          boardId: task.list.boardId,
        },
      }

      // Publish to Redis for WebSocket server to pick up
      const redis = getRedisClient()
      await redis.publish("board-updates", JSON.stringify(eventData))
    } catch (wsError) {
      console.error("WebSocket notification error:", wsError)
    }

    revalidatePath(`/board/${task.list.boardId}`)

    return { success: true }
  } catch (error) {
    console.error("Error deleting task:", error)
    return { success: false, error: "An error occurred while deleting the task" }
  }
}

// Update task status (move to another list)
export async function updateTaskStatus(
  taskId: string,
  newListId: string,
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, error: "You must be logged in to update task status" }
  }

  try {
    const demoMode = await isDemoMode()
    if (demoMode) {
      return { success: true }
    }

    // Get the task to check access
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { list: { include: { board: true } } },
    })

    if (!task) {
      return { success: false, error: "Task not found" }
    }

    // Check if user has access to the board
    const board = await prisma.board.findFirst({
      where: {
        id: task.list.boardId,
        OR: [{ ownerId: user.id }, { members: { some: { id: user.id } } }],
      },
    })

    if (!board) {
      return { success: false, error: "Board not found or access denied" }
    }

    // Get the new list
    const newList = await prisma.list.findUnique({
      where: { id: newListId },
    })

    if (!newList) {
      return { success: false, error: "New list not found" }
    }

    // Check if the new list belongs to the same board
    if (newList.boardId !== task.list.boardId) {
      return { success: false, error: "Cannot move task to a list in a different board" }
    }

    // Get the highest position in the new list
    const highestPositionTask = await prisma.task.findFirst({
      where: { listId: newListId },
      orderBy: { position: "desc" },
    })

    const position = highestPositionTask ? highestPositionTask.position + 1 : 0

    // Update the task
    await prisma.task.update({
      where: { id: taskId },
      data: {
        listId: newListId,
        position,
      },
    })

    // Create task history entry
    await prisma.taskHistoryEntry.create({
      data: {
        action: "moved",
        userId: user.id,
        taskId,
        details: `Task moved from "${task.list.name}" to "${newList.name}"`
      },
    })

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: "move",
        details: `Moved task "${task.title}" from "${task.list.name}" to "${newList.name}"`,
        entityType: "task",
        entityId: taskId,
        userId: user.id,
        boardId: task.list.boardId,
        taskId,
      },
    })

    // Invalidate cache
    try {
      const redis = getRedisClient()
      await safeRedisOperation(
        async () => {
          await batchDeleteKeys(`tasks:${task.listId}:${user.id}:*`) // Delete all cached tasks for old list
          await batchDeleteKeys(`tasks:${newListId}:${user.id}:*`) // Delete all cached tasks for new list
          await batchDeleteKeys(`lists:${task.list.boardId}:${user.id}:*`) // Delete all cached lists for this board
        },
        null
      )
    } catch (cacheError) {
      console.error("Cache invalidation error:", cacheError)
    }

    // Send real-time update via WebSocket
    try {
      const eventData = {
        type: "TASK_MOVED",
        payload: {
          taskId,
          oldListId: task.listId,
          newListId,
          boardId: task.list.boardId,
        },
      }

      // Publish to Redis for WebSocket server to pick up
      const redis = getRedisClient()
      await safeRedisOperation(
        async () => await redis.set("board-updates-latest", JSON.stringify(eventData)),
        null
      )
    } catch (wsError) {
      console.error("WebSocket notification error:", wsError)
    }

    revalidatePath(`/board/${task.list.boardId}`)

    return { success: true }
  } catch (error) {
    console.error("Error updating task status:", error)
    return { success: false, error: "An error occurred while updating task status" }
  }
}

// Add a comment to a task
export async function addComment(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, error: "You must be logged in to add a comment" }
  }

  try {
    const taskId = formData.get("taskId") as string
    const text = formData.get("text") as string

    if (!taskId || !text) {
      return { success: false, error: "Task ID and comment text are required" }
    }

    // Get the task to check access
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { list: { include: { board: true } } },
    })

    if (!task) {
      return { success: false, error: "Task not found" }
    }

    // Check if user has access to the board
    const board = await prisma.board.findFirst({
      where: {
        id: task.list.boardId,
        OR: [{ ownerId: user.id }, { members: { some: { id: user.id } } }],
      },
      include: {
        members: true
      }
    })

    if (!board) {
      return { success: false, error: "Board not found or access denied" }
    }

    // Extract mentions from the comment
    const mentionRegex = /@(\w+)/g
    const mentions = []
    let match

    while ((match = mentionRegex.exec(text)) !== null) {
      const mentionedName = match[1]

      // Find users with matching names
      const mentionedUsers = await prisma.user.findMany({
        where: {
          name: {
            contains: mentionedName,
            mode: "insensitive",
          },
          OR: [{ id: board.ownerId }, { id: { in: board.members.map((m: { id: string }) => m.id) } }],
        },
      })

      if (mentionedUsers.length > 0) {
        mentions.push(...mentionedUsers.map((u: { id: string }) => u.id))
      }
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        text,
        userId: user.id,
        taskId,
        mentions: mentions.length > 0 ? mentions.join(",") : undefined,
      },
    })

    // Create task history entry
    await prisma.taskHistoryEntry.create({
      data: {
        action: "commented",
        userId: user.id,
        taskId,
        details: `Comment added by ${user.name}`
      },
    })

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: "comment",
        details: `Commented on task "${task.title}"`,
        entityType: "task",
        entityId: taskId,
        userId: user.id,
        boardId: task.list.boardId,
        taskId,
      },
    })

    // Send notifications to mentioned users
    if (mentions.length > 0) {
      for (const mentionedUserId of mentions) {
        if (mentionedUserId !== user.id) {
          // Create notification
          await prisma.notification.create({
            data: {
              type: "mention",
              title: "You were mentioned",
              message: `${user.name} mentioned you in a comment on "${task.title}"`,
              taskId,
              boardId: task.list.boardId,
              userId: mentionedUserId,
            },
          })

          // Send email notification
          const mentionedUser = await prisma.user.findUnique({
            where: { id: mentionedUserId },
          })

          if (mentionedUser) {
            await sendMentionNotificationEmail(
              mentionedUser.email,
              mentionedUser.name,
              task.title,
              board.name,
              user.name,
            )
          }
        }
      }
    }

    // Invalidate cache
    try {
      const redis = getRedisClient()
      await redis.del(`tasks:${task.listId}:${user.id}:*`) // Delete all cached tasks for this list
    } catch (cacheError) {
      console.error("Cache invalidation error:", cacheError)
    }

    // Send real-time update via WebSocket
    try {
      const eventData = {
        type: "COMMENT_ADDED",
        payload: {
          comment: {
            id: comment.id,
            text: comment.text,
            userId: user.id,
            userName: user.name,
            userAvatar: user.avatar,
            createdAt: new Date(),
          },
          taskId,
          boardId: task.list.boardId,
        },
      }

      // Publish to Redis for WebSocket server to pick up
      const redis = getRedisClient()
      await redis.publish("board-updates", JSON.stringify(eventData))
    } catch (wsError) {
      console.error("WebSocket notification error:", wsError)
    }

    revalidatePath(`/board/${task.list.boardId}`)

    return { success: true }
  } catch (error) {
    console.error("Error adding comment:", error)
    return { success: false, error: "An error occurred while adding the comment" }
  }
}

// Upload attachment to a task
export async function uploadAttachment(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, error: "You must be logged in to upload attachments" }
  }

  try {
    const taskId = formData.get("taskId") as string
    const file = formData.get("file") as File

    if (!taskId || !file) {
      return { success: false, error: "Task ID and file are required" }
    }

    // Get the task to check access
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { list: { include: { board: true } } },
    })

    if (!task) {
      return { success: false, error: "Task not found" }
    }

    // Check if user has access to the board
    const board = await prisma.board.findFirst({
      where: {
        id: task.list.boardId,
        OR: [{ ownerId: user.id }, { members: { some: { id: user.id } } }],
      },
    })

    if (!board) {
      return { success: false, error: "Board not found or access denied" }
    }

    // In a real implementation, you would upload the file to a storage service
    // For this example, we'll just create a record in the database
    const attachment = await prisma.attachment.create({
      data: {
        name: file.name,
        size: file.size.toString(),
        type: file.type,
        url: `/uploads/${Date.now()}_${file.name}`, // This would be the URL from your storage service
        taskId,
        uploadedById: user.id,
      },
    })

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: "attachment",
        details: `Added attachment "${file.name}" to task "${task.title}"`,
        entityType: "task",
        entityId: taskId,
        userId: user.id,
        boardId: task.list.boardId,
        taskId,
      },
    })

    // Invalidate cache
    try {
      const redis = getRedisClient()
      await redis.del(`tasks:${task.listId}:${user.id}:*`) // Delete all cached tasks for this list
    } catch (cacheError) {
      console.error("Cache invalidation error:", cacheError)
    }

    // Send real-time update via WebSocket
    try {
      const eventData = {
        type: "ATTACHMENT_ADDED",
        payload: {
          attachment: {
            id: attachment.id,
            name: attachment.name,
            size: attachment.size,
            type: attachment.type,
            url: attachment.url,
          },
          taskId,
          boardId: task.list.boardId,
        },
      }

      // Publish to Redis for WebSocket server to pick up
      const redis = getRedisClient()
      await safeRedisOperation(
        async () => await redis.set("board-updates-latest", JSON.stringify(eventData)),
        null
      )
    } catch (wsError) {
      console.error("WebSocket notification error:", wsError)
    }

    revalidatePath(`/board/${task.list.boardId}`)

    return { success: true }
  } catch (error) {
    console.error("Error uploading attachment:", error)
    return { success: false, error: "An error occurred while uploading the attachment" }
  }
}

export async function searchTasks(
  query: string,
  page = 1,
  limit = 20,
): Promise<{ tasks: any[]; total: number; pages: number }> {
  const user = await getCurrentUser();

  if (!user || !query.trim()) {
    return { tasks: [], total: 0, pages: 0 };
  }

  try {
    const demoMode = await isDemoMode();
    if (demoMode) {
      // Mock search results for demo mode
      const mockTasks = [
        {
          id: "demo-task-1",
          title: "Research competitors",
          description: "Analyze top 5 competitors in the market",
          priority: "High",
          dueDate: new Date().toISOString(),
          listId: "demo-list-1",
          listName: "To Do",
          boardId: "demo-board-1",
          boardName: "Product Development",
        },
        {
          id: "demo-task-2",
          title: "Create marketing plan",
          description: "Develop Q2 marketing strategy",
          priority: "Medium",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          listId: "demo-list-2",
          listName: "In Progress",
          boardId: "demo-board-2",
          boardName: "Marketing Campaign",
        },
      ];

      // Filter mock tasks based on query
      const filteredTasks = mockTasks.filter(task => 
        task.title.toLowerCase().includes(query.toLowerCase()) ||
        task.description.toLowerCase().includes(query.toLowerCase())
      );

      // Apply pagination
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedTasks = filteredTasks.slice(start, end);

      return {
        tasks: paginatedTasks,
        total: filteredTasks.length,
        pages: Math.ceil(filteredTasks.length / limit),
      };
    }

    // Try to get from cache first
    const redis = getRedisClient();
    const cacheKey = `searchTasks:${query}:${user.id}:${page}:${limit}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      console.log("Using cached search tasks data");
      return JSON.parse(cachedData as string);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await prisma.task.count({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
    });

    const pages = Math.ceil(total / limit);

    // Get tasks with pagination
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        assignee: true,
        labels: true,
        tags: true,
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
    });

    // Cache the result
    const result = { tasks, total, pages };
    await redis.set(cacheKey, JSON.stringify(result), { ex: 60 * 5 }); // Cache for 5 minutes

    return result;
  } catch (error) {
    console.error("Error searching tasks:", error);
    return { tasks: [], total: 0, pages: 0 };
  }
}