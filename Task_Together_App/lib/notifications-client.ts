"use client"

import {
  getNotifications as getServerNotifications,
  markNotificationAsRead as markServerNotificationAsRead,
  markAllNotificationsAsRead as markServerAllNotificationsAsRead,
  deleteNotification as deleteServerNotification,
} from "./notifications-actions"
import { isDemoMode } from "./auth-client"

// Get all notifications
export async function getNotifications() {
  return getServerNotifications()
}

// Mark a notification as read
export async function markNotificationAsRead(id: string) {
  return markServerNotificationAsRead(id)
}

// Mark all notifications as read
export async function markAllNotificationsAsRead() {
  return markServerAllNotificationsAsRead()
}

// Delete a notification
export async function deleteNotification(id: string) {
  return deleteServerNotification(id)
}

// Check if we're in demo mode (client-side)
export function isNotificationsDemoMode(): boolean {
  return isDemoMode()
}

