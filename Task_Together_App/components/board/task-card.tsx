"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Clock, MessageSquare, Paperclip, MoreHorizontal } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import TaskDetailDialog from "@/components/board/task-detail-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { updateTask, deleteTask } from "@/lib/board-client"
import { toast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"

interface TaskCardProps {
  task: any // Using any to accommodate the complex type from Prisma
  isDemoMode?: boolean
}

export default function TaskCard({ task, isDemoMode = false }: TaskCardProps) {
  const { data: session } = useSession()
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isPinned, setIsPinned] = useState(task.isPinned || false)

  const priorityColors = {
    Low: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    High: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    Critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  }

  const priorityColor = task.priority ? priorityColors[task.priority as keyof typeof priorityColors] : ""

  const handlePinTask = async () => {
    try {
      if (isDemoMode && !session?.user) {
        // Simulate pinning in demo mode
        setIsPinned(!isPinned)
        toast({
          title: isPinned ? "Task unpinned (Demo Mode)" : "Task pinned (Demo Mode)",
          description: `"${task.title}" has been ${isPinned ? "unpinned" : "pinned"} in demo mode`,
          duration: 3000,
        })
        return
      }

      await updateTask({
        id: task.id,
        title: task.title,
        isPinned: !isPinned
      })
      setIsPinned(!isPinned)
      toast({
        title: isPinned ? "Task unpinned" : "Task pinned",
        description: `"${task.title}" has been ${isPinned ? "unpinned" : "pinned"}`,
        duration: 3000,
      })
    } catch (error) {
      console.error("Error pinning/unpinning task:", error)
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTask = async () => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        if (isDemoMode && !session?.user) {
          // Simulate deletion in demo mode
          toast({
            title: "Task deleted (Demo Mode)",
            description: `"${task.title}" has been deleted in demo mode`,
            duration: 3000,
          })
          return
        }

        await deleteTask(task.id)
        toast({
          title: "Task deleted",
          description: `"${task.title}" has been deleted`,
          duration: 3000,
        })
      } catch (error) {
        console.error("Error deleting task:", error)
        toast({
          title: "Error",
          description: "Failed to delete task",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <>
      <Card
        className={`cursor-pointer hover:shadow-md transition-shadow ${isPinned ? "border-l-4 border-l-primary" : ""}`}
        onClick={() => setIsDetailOpen(true)}
      >
        <CardContent className="p-3">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-sm line-clamp-2">{task.title}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <button className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePinTask()
                  }}
                >
                  {isPinned ? "Unpin task" : "Pin task"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsDetailOpen(true)
                  }}
                >
                  View details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteTask()
                  }}
                >
                  Delete task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {task.labels && task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {task.labels.map((label: any) => (
                <Badge
                  key={label.id}
                  className="px-1.5 py-0 text-xs"
                  style={{ backgroundColor: label.color + "30", color: label.color }}
                >
                  {label.name}
                </Badge>
              ))}
            </div>
          )}

          {task.priority && (
            <Badge variant="outline" className={`text-xs mb-2 ${priorityColor}`}>
              {task.priority} Priority
            </Badge>
          )}

          {task.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{task.description}</p>}

          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center gap-2">
              {task.dueDate && (
                <div
                  className={`flex items-center text-xs ${
                    new Date(task.dueDate) < new Date() && !task.completedAt
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {task.comments && task.comments.length > 0 && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  {task.comments.length}
                </div>
              )}

              {task.attachments && task.attachments.length > 0 && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Paperclip className="h-3 w-3 mr-1" />
                  {task.attachments.length}
                </div>
              )}

              {task.assignee && (
                <Avatar className="h-6 w-6">
                  <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                  <AvatarFallback>
                    {task.assignee.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <TaskDetailDialog task={task} open={isDetailOpen} onOpenChange={setIsDetailOpen} isDemoMode={isDemoMode} />
    </>
  )
}

