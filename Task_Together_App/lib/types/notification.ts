import { z } from "zod"
import type { Notification as PrismaNotification } from "@prisma/client"

export type Notification = Omit<PrismaNotification, 'createdAt'> & {
  createdAt: string
}

export const notificationTypeEnum = z.enum([
  "comment",
  "assignment",
  "mention",
  "due_date",
  "status_change"
])

export type NotificationType = z.infer<typeof notificationTypeEnum>

export const createNotificationSchema = z.object({
  userId: z.string(),
  type: notificationTypeEnum,
  title: z.string(),
  message: z.string(),
  taskId: z.string().nullable().optional(),
  boardId: z.string().nullable().optional(),
})

export type CreateNotificationInput = z.infer<typeof createNotificationSchema> 