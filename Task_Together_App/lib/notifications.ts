"use server"

import { prisma } from "./prisma"
import { getCurrentUser } from "./auth-actions"
import { revalidatePath } from "next/cache"
import { sendEmail } from "./email"
import type { Notification } from "@/lib/types"

export async function getNotifications(): Promise<Notification[]> {
  const user = await getCurrentUser()

  if (!user) {
    return []
  }

  try {
    // Check if we're in demo mode
    const isDemoUser = user.role === "demo"
    
    if (isDemoUser) {
      // For demo users, return mock notifications
      return [
        {
          id: "demo-1",
          userId: user.id,
          type: "assignment",
          title: "Task Assigned",
          message: "You've been assigned to 'Implement login page'",
          taskId: "demo-task-1",
          boardId: "demo-board-1",
          createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
          isRead: false,
        },
        {
          id: "demo-2",
          userId: user.id,
          type: "mention",
          title: "You were mentioned",
          message: "John mentioned you in a comment on 'API documentation'",
          taskId: "demo-task-2",
          boardId: "demo-board-2",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          isRead: true,
        },
        {
          id: "demo-3",
          userId: user.id,
          type: "due_date",
          title: "Task Due Soon",
          message: "'Database schema design' is due in 2 days",
          taskId: "demo-task-3",
          boardId: "demo-board-1",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
          isRead: false,
        },
      ]
    }

    // For real users, fetch from database
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    })

    // Convert to the expected format
    return notifications.map((notification: any) => ({
      ...notification,
      createdAt: notification.createdAt.toISOString(),
    }))
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return []
  }
}

export async function markNotificationAsRead(id: string): Promise<boolean> {
  const user = await getCurrentUser()

  if (!user) {
    return false
  }

  try {
    // Check if we're in demo mode
    const isDemoUser = user.role === "demo"
    
    if (isDemoUser) {
      // For demo users, just return success
      revalidatePath("/notifications")
      return true
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    })

    revalidatePath("/notifications")
    return true
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return false
  }
}

export async function markAllNotificationsAsRead(): Promise<boolean> {
  const user = await getCurrentUser()

  if (!user) {
    return false
  }

  try {
    // Check if we're in demo mode
    const isDemoUser = user.role === "demo"
    
    if (isDemoUser) {
      // For demo users, just return success
      revalidatePath("/notifications")
      return true
    }

    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    })

    revalidatePath("/notifications")
    return true
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return false
  }
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  taskId,
  boardId,
  sendEmailNotification = false,
}: {
  userId: string
  type: string
  title: string
  message: string
  taskId?: string
  boardId?: string
  sendEmailNotification?: boolean
}): Promise<Notification | null> {
  try {
    // Check if the user is a demo user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })
    
    if (user?.role === "demo") {
      // For demo users, just return a mock notification
      return {
        id: `demo-${Date.now()}`,
        userId: userId,
        type: type as any,
        title: title,
        message: message,
        taskId: taskId ?? null,
        boardId: boardId ?? null,
        createdAt: new Date().toISOString(),
        isRead: false,
      }
    }

    // For real users, create in database
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        taskId: taskId ?? null,
        boardId: boardId ?? null,
      },
    })

    // Send email notification if requested
    if (sendEmailNotification) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      })

      if (user) {
        await sendEmail({
          to: user.email,
          subject: title,
          text: message,
          html: `
            <p>Hello ${user.name},</p>
            <p>${message}</p>
            <p>
              <a href="${process.env.NEXT_PUBLIC_API_URL}/notifications" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                View Notification
              </a>
            </p>
          `,
        })
      }
    }

    revalidatePath("/notifications")
    
    // Convert to the expected format
    return {
      ...notification,
      createdAt: notification.createdAt.toISOString(),
    }
  } catch (error) {
    console.error("Error creating notification:", error)
    return null
  }
}

export async function deleteNotification(id: string): Promise<boolean> {
  const user = await getCurrentUser()

  if (!user) {
    return false
  }

  try {
    // Check if we're in demo mode
    const isDemoUser = user.role === "demo"
    
    if (isDemoUser) {
      // For demo users, just return success
      revalidatePath("/notifications")
      return true
    }

    await prisma.notification.delete({
      where: { id },
    })

    revalidatePath("/notifications")
    return true
  } catch (error) {
    console.error("Error deleting notification:", error)
    return false
  }
}

