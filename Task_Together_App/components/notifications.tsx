"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import type { Notification } from "@/lib/types"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { getNotifications, markNotificationAsRead, isNotificationsDemoMode } from "@/lib/notifications-client"

interface NotificationsMenuProps {
  isDemoMode?: boolean
}

export function NotificationsMenu({ isDemoMode }: NotificationsMenuProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const clientIsDemoMode = isNotificationsDemoMode()
  const effectiveDemoMode = isDemoMode || clientIsDemoMode

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true)
        const data = await getNotifications()
        setNotifications(data)
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
        toast({
          title: "Error",
          description: "Failed to load notifications",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark notification as read
      await markNotificationAsRead(notification.id)
      setNotifications(notifications.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)))

      toast({
        title: "Notification marked as read",
        duration: 2000,
      })

      // Navigate to the relevant page based on notification type
      if (notification.type === "assignment" || notification.type === "mention") {
        router.push(`/board/${notification.boardId}?task=${notification.taskId}`)
      } else if (notification.type === "due_date") {
        router.push(`/calendar?highlight=${notification.taskId}`)
      } else {
        router.push(`/dashboard`)
      }
    } catch (error) {
      console.error("Failed to handle notification:", error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "assignment":
        return "👤"
      case "mention":
        return "📣"
      case "due_date":
        return "⏰"
      case "comment":
        return "💬"
      case "status_change":
        return "🔄"
      default:
        return "📌"
    }
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return "just now"
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} hour${hours > 1 ? "s" : ""} ago`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} day${days > 1 ? "s" : ""} ago`
    }
  }

  const handleViewAllNotifications = () => {
    router.push("/notifications")
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {unreadCount} new
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No notifications yet</div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start py-3 cursor-pointer ${!notification.isRead ? "bg-primary/5" : ""} ${effectiveDemoMode ? "border-b border-dashed border-muted-foreground/30" : ""}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start w-full">
                  <div className="flex-shrink-0 mr-3 mt-1 text-lg">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{getTimeAgo(notification.createdAt)}</p>
                  </div>
                  {!notification.isRead && <div className={`w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2 ${effectiveDemoMode ? "border border-dashed border-muted-foreground/30" : ""}`}></div>}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center font-medium" onClick={handleViewAllNotifications} isDemoMode={effectiveDemoMode}>
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

