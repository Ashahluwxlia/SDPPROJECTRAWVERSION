"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import type { Notification } from "@/lib/types"
import { useRouter } from "next/navigation"
import { CheckCircle, Bell, Search, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, isNotificationsDemoMode } from "@/lib/notifications-client"
import { toast } from "@/components/ui/use-toast"

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const isDemoMode = isNotificationsDemoMode()

  useEffect(() => {
    // Fetch notifications
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

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark notification as read
      await markNotificationAsRead(notification.id)
      setNotifications(notifications.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)))

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
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      })
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

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead()
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })))
      toast({
        title: "Success",
        description: "All notifications marked as read",
      })
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      })
    }
  }

  // Filter notifications based on current filter and search query
  const filteredNotifications = notifications.filter((notification) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "unread" && !notification.isRead) ||
      (filter === "read" && notification.isRead) ||
      filter === notification.type

    const matchesSearch =
      searchQuery === "" ||
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesFilter && matchesSearch
  })

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Notifications</h1>
        <p className="text-muted-foreground">Stay updated with your team's activities</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search notifications..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Notifications</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="assignment">Assignments</SelectItem>
              <SelectItem value="mention">Mentions</SelectItem>
              <SelectItem value="due_date">Due Dates</SelectItem>
              <SelectItem value="comment">Comments</SelectItem>
              <SelectItem value="status_change">Status Changes</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-1" onClick={markAllAsRead}>
            <CheckCircle className="h-4 w-4" />
            <span>Mark All as Read</span>
          </Button>

          <Button variant="outline" className="gap-1">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="all" onClick={() => setFilter("all")}>
            All
          </TabsTrigger>
          <TabsTrigger value="unread" onClick={() => setFilter("unread")}>
            Unread
            <Badge className="ml-2 bg-primary/10 text-primary hover:bg-primary/20 border-none">
              {notifications.filter((n) => !n.isRead).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="mentions" onClick={() => setFilter("mention")}>
            Mentions
          </TabsTrigger>
          <TabsTrigger value="assignments" onClick={() => setFilter("assignment")}>
            Assignments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                All Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="p-4 text-center">
                  <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading notifications...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-1">No notifications found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters or check back later</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-start p-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                        !notification.isRead ? "bg-primary/5" : ""
                      } ${isDemoMode ? "border-b border-dashed border-muted-foreground/30" : ""}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex-shrink-0 mr-4 text-2xl">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{notification.title}</h4>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                          </div>
                          <div className="flex items-center">
                            <span className="text-xs text-muted-foreground">{getTimeAgo(notification.createdAt)}</span>
                            {!notification.isRead && <div className="ml-2 w-2 h-2 rounded-full bg-primary"></div>}
                          </div>
                        </div>
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            {notification.type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread">
          <Card>
            <CardHeader>
              <CardTitle>Unread Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="p-4 text-center">
                  <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading notifications...</p>
                </div>
              ) : notifications.filter(n => !n.isRead).length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-1">No unread notifications</h3>
                  <p className="text-muted-foreground">You're all caught up!</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications
                    .filter(n => !n.isRead)
                    .map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-start p-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors bg-primary/5 ${
                          isDemoMode ? "border-b border-dashed border-muted-foreground/30" : ""
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex-shrink-0 mr-4 text-2xl">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{notification.title}</h4>
                              <p className="text-sm text-muted-foreground">{notification.message}</p>
                            </div>
                            <div className="flex items-center">
                              <span className="text-xs text-muted-foreground">{getTimeAgo(notification.createdAt)}</span>
                              <div className="ml-2 w-2 h-2 rounded-full bg-primary"></div>
                            </div>
                          </div>
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              {notification.type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mentions">
          <Card>
            <CardHeader>
              <CardTitle>Mentions</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="p-4 text-center">
                  <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading notifications...</p>
                </div>
              ) : notifications.filter(n => n.type === "mention").length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-1">No mentions</h3>
                  <p className="text-muted-foreground">You haven't been mentioned in any tasks yet</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications
                    .filter(n => n.type === "mention")
                    .map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-start p-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                          !notification.isRead ? "bg-primary/5" : ""
                        } ${isDemoMode ? "border-b border-dashed border-muted-foreground/30" : ""}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex-shrink-0 mr-4 text-2xl">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{notification.title}</h4>
                              <p className="text-sm text-muted-foreground">{notification.message}</p>
                            </div>
                            <div className="flex items-center">
                              <span className="text-xs text-muted-foreground">{getTimeAgo(notification.createdAt)}</span>
                              {!notification.isRead && <div className="ml-2 w-2 h-2 rounded-full bg-primary"></div>}
                            </div>
                          </div>
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              {notification.type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="p-4 text-center">
                  <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading notifications...</p>
                </div>
              ) : notifications.filter(n => n.type === "assignment").length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-1">No assignments</h3>
                  <p className="text-muted-foreground">You don't have any task assignments yet</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications
                    .filter(n => n.type === "assignment")
                    .map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-start p-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                          !notification.isRead ? "bg-primary/5" : ""
                        } ${isDemoMode ? "border-b border-dashed border-muted-foreground/30" : ""}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex-shrink-0 mr-4 text-2xl">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{notification.title}</h4>
                              <p className="text-sm text-muted-foreground">{notification.message}</p>
                            </div>
                            <div className="flex items-center">
                              <span className="text-xs text-muted-foreground">{getTimeAgo(notification.createdAt)}</span>
                              {!notification.isRead && <div className="ml-2 w-2 h-2 rounded-full bg-primary"></div>}
                            </div>
                          </div>
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              {notification.type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

