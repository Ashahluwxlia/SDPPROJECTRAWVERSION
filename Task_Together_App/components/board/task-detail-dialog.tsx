"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, MoreHorizontal, Trash, Edit, Check, X, Paperclip } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { updateTask, deleteTask } from "@/lib/board-client"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { RichTextEditor } from "@/components/rich-text-editor"
import { DragDropUpload } from "@/components/drag-drop-upload"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import Image from "next/image"
import { useSession } from "next-auth/react"

interface TaskDetailDialogProps {
  task: any // Using any to accommodate the complex type from Prisma
  open: boolean
  onOpenChange: (open: boolean) => void
  isDemoMode?: boolean
}

export default function TaskDetailDialog({ task, open, onOpenChange, isDemoMode = false }: TaskDetailDialogProps) {
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || "")
  const [priority, setPriority] = useState(task.priority || "")
  const [dueDate, setDueDate] = useState(task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "")
  const [newComment, setNewComment] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const commentInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open && commentInputRef.current) {
      commentInputRef.current.focus()
    }
  }, [open])

  // Keyboard shortcuts
  useKeyboardShortcuts(
    [
      {
        key: "e",
        action: () => setIsEditing(true),
        description: "Edit task",
      },
      {
        key: "Escape",
        action: () => {
          if (isEditing) {
            setIsEditing(false)
          } else {
            onOpenChange(false)
          }
        },
        description: "Cancel editing / Close dialog",
      },
      {
        key: "s",
        ctrlKey: true,
        action: () => {
          if (isEditing) {
            handleSaveChanges()
          }
        },
        description: "Save changes",
      },
    ],
    open,
  )

  const priorityColors = {
    Low: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    High: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    Critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  }

  const priorityOptions = [
    { value: "Low", label: "Low", color: "blue" },
    { value: "Medium", label: "Medium", color: "yellow" },
    { value: "High", label: "High", color: "orange" },
    { value: "Critical", label: "Critical", color: "red" },
  ]

  const handleSaveChanges = async () => {
    try {
      if (isDemoMode && !session?.user) {
        // Simulate task update in demo mode
        await new Promise(resolve => setTimeout(resolve, 500))
        setIsEditing(false)
        toast.success("Task updated (Demo Mode)", {
          description: "The task has been updated in demo mode",
          duration: 3000,
        })
        return
      }

      await updateTask({
        id: task.id,
        title,
        description,
        priority,
        dueDate: dueDate || null,
      })

      setIsEditing(false)
      toast.success("Task updated", {
        description: "The task has been updated successfully",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error updating task:", error)
      toast.error("Error", {
        description: "Failed to update task",
      })
    }
  }

  const handleDeleteTask = async () => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        if (isDemoMode && !session?.user) {
          // Simulate task deletion in demo mode
          await new Promise(resolve => setTimeout(resolve, 500))
          onOpenChange(false)
          toast.success("Task deleted (Demo Mode)", {
            description: `"${task.title}" has been deleted in demo mode`,
            duration: 3000,
          })
          return
        }

        await deleteTask(task.id)
        onOpenChange(false)
        toast.success("Task deleted", {
          description: `"${task.title}" has been deleted`,
          duration: 3000,
        })
      } catch (error) {
        console.error("Error deleting task:", error)
        toast.error("Error", {
          description: "Failed to delete task",
        })
      }
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    if (isDemoMode && !session?.user) {
      // Simulate adding a comment in demo mode
      await new Promise(resolve => setTimeout(resolve, 500))
      toast.success("Comment added (Demo Mode)", {
        description: "Your comment has been added in demo mode",
        duration: 3000,
      })
      setNewComment("")
      return
    }

    // In a real app, this would call an API to add a comment
    // For now, we'll just show a toast
    toast.success("Comment added", {
      description: "Your comment has been added",
      duration: 3000,
    })

    setNewComment("")
  }

  const handleFileUpload = async (files: File[]) => {
    setIsUploading(true)

    try {
      if (isDemoMode && !session?.user) {
        // Simulate file upload in demo mode
        await new Promise((resolve) => setTimeout(resolve, 2000))
        toast.success("Files uploaded (Demo Mode)", {
          description: `${files.length} file(s) uploaded successfully in demo mode`,
          duration: 3000,
        })
        setIsUploading(false)
        return
      }

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast.success("Files uploaded", {
        description: `${files.length} file(s) uploaded successfully`,
        duration: 3000,
      })

      setIsUploading(false)
    } catch (error) {
      console.error("Error uploading files:", error)
      toast.error("Upload failed", {
        description: "There was an error uploading your files",
      })
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            {isEditing ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-semibold"
                placeholder="Task title"
              />
            ) : (
              <DialogTitle className="text-xl">{task.title}</DialogTitle>
            )}
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveChanges}>
                    <Check className="h-4 w-4 mr-1" /> Save
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>Edit task</DropdownMenuItem>
                      <DropdownMenuItem>Copy link</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={handleDeleteTask}>
                        <Trash className="h-4 w-4 mr-2" /> Delete task
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>
          {isDemoMode && !session?.user && (
            <p className="text-xs text-muted-foreground mt-1">Demo Mode: Changes will not be saved</p>
          )}
        </DialogHeader>

        <div className="grid grid-cols-3 gap-6 mt-4">
          <div className="col-span-2 space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Description</h3>
              {isEditing ? (
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Add a more detailed description..."
                  minHeight="150px"
                />
              ) : (
                <div
                  className="text-sm text-muted-foreground prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: task.description || "No description provided." }}
                />
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Attachments</h3>
              {task.attachments && task.attachments.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {task.attachments.map((attachment: any) => (
                    <div key={attachment.id} className="border rounded-md p-2 flex items-center gap-2">
                      {attachment.type.startsWith("image/") ? (
                        <div className="relative h-10 w-10 rounded overflow-hidden">
                          <Image
                            src={attachment.url || "/placeholder.svg"}
                            alt={attachment.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <Paperclip className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{attachment.name}</p>
                        <p className="text-xs text-muted-foreground">{attachment.size}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mb-4">No attachments yet.</p>
              )}

              <DragDropUpload
                onUpload={handleFileUpload}
                accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                maxFiles={5}
                maxSize={5 * 1024 * 1024} // 5MB
                className="mb-6"
              >
                <p className="text-xs text-muted-foreground mt-1">Supports images, PDFs, and documents</p>
              </DragDropUpload>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Comments</h3>
              <div className="space-y-4">
                {task.comments && task.comments.length > 0 ? (
                  task.comments.map((comment: any) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                        <AvatarFallback>
                          {comment.user.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{comment.user.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <div
                          className="text-sm mt-1 prose dark:prose-invert max-w-none prose-sm"
                          dangerouslySetInnerHTML={{ __html: comment.text }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No comments yet.</div>
                )}

                <div className="flex gap-3 mt-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=100&width=100&text=ME" alt="Me" />
                    <AvatarFallback>ME</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <RichTextEditor
                      value={newComment}
                      onChange={setNewComment}
                      placeholder="Add a comment..."
                      minHeight="100px"
                    />
                    <div className="flex justify-end mt-2">
                      <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>
                        Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Status</h3>
              <Badge variant="outline" className="text-xs">
                {task.list?.name || "Unknown"}
              </Badge>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Priority</h3>
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {priorityOptions.map((option) => (
                    <Badge
                      key={option.value}
                      variant="outline"
                      className={cn(
                        "cursor-pointer",
                        priority === option.value
                          ? priorityColors[option.value as keyof typeof priorityColors]
                          : "bg-transparent",
                      )}
                      onClick={() => setPriority(option.value)}
                    >
                      {option.label}
                    </Badge>
                  ))}
                </div>
              ) : (
                <Badge
                  variant="outline"
                  className={
                    task.priority ? priorityColors[task.priority as keyof typeof priorityColors] : "bg-transparent"
                  }
                >
                  {task.priority || "None"}
                </Badge>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Due Date</h3>
              {isEditing ? (
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full" />
              ) : (
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  {task.dueDate ? (
                    <span
                      className={
                        new Date(task.dueDate) < new Date() && !task.completedAt
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }
                    >
                      {format(new Date(task.dueDate), "MMM d, yyyy")}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">No due date</span>
                  )}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Assignee</h3>
              <div className="flex items-center gap-2">
                {task.assignee ? (
                  <>
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                      <AvatarFallback>
                        {task.assignee.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{task.assignee.name}</span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">Unassigned</span>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Labels</h3>
              <div className="flex flex-wrap gap-1">
                {task.labels && task.labels.length > 0 ? (
                  task.labels.map((label: any) => (
                    <Badge
                      key={label.id}
                      className="px-2 py-0.5 text-xs"
                      style={{ backgroundColor: label.color + "30", color: label.color }}
                    >
                      {label.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No labels</span>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Created</h3>
              <div className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-2">Keyboard Shortcuts</h3>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  <kbd className="px-1 py-0.5 bg-muted border rounded">e</kbd> Edit task
                </p>
                <p>
                  <kbd className="px-1 py-0.5 bg-muted border rounded">Esc</kbd> Cancel / Close
                </p>
                <p>
                  <kbd className="px-1 py-0.5 bg-muted border rounded">Ctrl</kbd> +{" "}
                  <kbd className="px-1 py-0.5 bg-muted border rounded">s</kbd> Save changes
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

