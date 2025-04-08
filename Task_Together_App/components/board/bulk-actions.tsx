"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { Task } from "@/lib/types"
import { MoreHorizontal, Trash, Copy, AlertTriangle, CheckCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

interface BulkActionsProps {
  tasks: Task[]
  onTasksUpdate: (tasks: Task[]) => void
  isDemoMode?: boolean
}

export function BulkActions({ tasks, onTasksUpdate, isDemoMode = false }: BulkActionsProps) {
  const { data: session } = useSession()
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
  const [isSelectAll, setIsSelectAll] = useState(false)

  // Mock team members for assignment
  const teamMembers = [
    { id: "1", name: "John Doe", avatar: "/placeholder-user.jpg" },
    { id: "2", name: "Jane Smith", avatar: "/placeholder-user.jpg" },
    { id: "3", name: "Alex Johnson", avatar: "/placeholder-user.jpg" },
    { id: "4", name: "Emily Chen", avatar: "/placeholder-user.jpg" },
  ]

  const handleSelectAll = () => {
    if (isSelectAll) {
      setSelectedTaskIds([])
    } else {
      setSelectedTaskIds(tasks.map((task) => task.id))
    }
    setIsSelectAll(!isSelectAll)
  }

  const handleSelectTask = (taskId: string) => {
    if (selectedTaskIds.includes(taskId)) {
      setSelectedTaskIds(selectedTaskIds.filter((id) => id !== taskId))
    } else {
      setSelectedTaskIds([...selectedTaskIds, taskId])
    }
  }

  const handleDeleteSelected = () => {
    if (isDemoMode && !session?.user) {
      // Simulate deletion in demo mode
      const updatedTasks = tasks.filter((task) => !selectedTaskIds.includes(task.id))
      onTasksUpdate(updatedTasks)
      setSelectedTaskIds([])
      setIsSelectAll(false)
      toast.success("Tasks deleted in demo mode")
      return
    }

    const updatedTasks = tasks.filter((task) => !selectedTaskIds.includes(task.id))
    onTasksUpdate(updatedTasks)
    setSelectedTaskIds([])
    setIsSelectAll(false)
  }

  const handleAssignSelected = (userId: string) => {
    const user = teamMembers.find((member) => member.id === userId)

    if (!user) return

    if (isDemoMode && !session?.user) {
      // Simulate assignment in demo mode
      const updatedTasks = tasks.map((task) => {
        if (selectedTaskIds.includes(task.id)) {
          return {
            ...task,
            assignee: {
              id: user.id,
              name: user.name,
              avatar: user.avatar,
            },
          }
        }
        return task
      })

      onTasksUpdate(updatedTasks)
      toast.success("Tasks assigned in demo mode")
      return
    }

    const updatedTasks = tasks.map((task) => {
      if (selectedTaskIds.includes(task.id)) {
        return {
          ...task,
          assignee: {
            id: user.id,
            name: user.name,
            avatar: user.avatar,
          },
        }
      }
      return task
    })

    onTasksUpdate(updatedTasks)
  }

  const handleSetPriority = (priority: string) => {
    if (isDemoMode && !session?.user) {
      // Simulate priority update in demo mode
      const updatedTasks = tasks.map((task) => {
        if (selectedTaskIds.includes(task.id)) {
          return {
            ...task,
            priority: priority as Task["priority"],
          }
        }
        return task
      })

      onTasksUpdate(updatedTasks)
      toast.success("Task priorities updated in demo mode")
      return
    }

    const updatedTasks = tasks.map((task) => {
      if (selectedTaskIds.includes(task.id)) {
        return {
          ...task,
          priority: priority as Task["priority"],
        }
      }
      return task
    })

    onTasksUpdate(updatedTasks)
  }

  const handleSetStatus = (status: string) => {
    if (isDemoMode && !session?.user) {
      // Simulate status update in demo mode
      const updatedTasks = tasks.map((task) => {
        if (selectedTaskIds.includes(task.id)) {
          return {
            ...task,
            status: status as Task["status"],
          }
        }
        return task
      })

      onTasksUpdate(updatedTasks)
      toast.success("Task statuses updated in demo mode")
      return
    }

    const updatedTasks = tasks.map((task) => {
      if (selectedTaskIds.includes(task.id)) {
        return {
          ...task,
          status: status as Task["status"],
        }
      }
      return task
    })

    onTasksUpdate(updatedTasks)
  }

  const handleDuplicateSelected = () => {
    if (isDemoMode && !session?.user) {
      // Simulate duplication in demo mode
      const selectedTasks = tasks.filter((task) => selectedTaskIds.includes(task.id))
      const duplicatedTasks = selectedTasks.map((task) => ({
        ...task,
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: `${task.title} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))

      onTasksUpdate([...tasks, ...duplicatedTasks])
      setSelectedTaskIds([])
      setIsSelectAll(false)
      toast.success("Tasks duplicated in demo mode")
      return
    }

    const selectedTasks = tasks.filter((task) => selectedTaskIds.includes(task.id))
    const duplicatedTasks = selectedTasks.map((task) => ({
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: `${task.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))

    onTasksUpdate([...tasks, ...duplicatedTasks])
    setSelectedTaskIds([])
    setIsSelectAll(false)
  }

  return (
    <div className="mb-4">
      <AnimatePresence>
        {selectedTaskIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-between bg-muted p-2 rounded-md"
          >
            <div className="flex items-center gap-2">
              <Checkbox checked={isSelectAll} onCheckedChange={handleSelectAll} id="select-all" />
              <label htmlFor="select-all" className="text-sm font-medium">
                {selectedTaskIds.length} task{selectedTaskIds.length !== 1 ? "s" : ""} selected
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Select onValueChange={handleSetStatus}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Set status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="To-Do">To-Do</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Review">Review</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={handleSetPriority}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Set priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={handleAssignSelected}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Assign to" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{member.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDuplicateSelected}>
                    <Copy className="h-4 w-4 mr-2" /> Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={handleDeleteSelected}>
                    <Trash className="h-4 w-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedTaskIds([])
                  setIsSelectAll(false)
                }}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedTaskIds.length === 0 && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Checkbox checked={isSelectAll} onCheckedChange={handleSelectAll} id="select-all" />
            <label htmlFor="select-all" className="text-sm font-medium">
              Select all tasks
            </label>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-muted">
              {tasks.length} total tasks
            </Badge>

            <Badge variant="outline" className="bg-green-500/10 text-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              {tasks.filter((task) => task.status === "Completed").length} completed
            </Badge>

            <Badge variant="outline" className="bg-red-500/10 text-red-500">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {
                tasks.filter(
                  (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Completed",
                ).length
              }{" "}
              overdue
            </Badge>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center p-2 rounded-md border ${
              selectedTaskIds.includes(task.id) ? "bg-muted border-primary" : ""
            }`}
          >
            <Checkbox
              checked={selectedTaskIds.includes(task.id)}
              onCheckedChange={() => handleSelectTask(task.id)}
              className="mr-2"
            />
            <div className="flex-1">
              <div className="font-medium">{task.title}</div>
              <div className="text-sm text-muted-foreground">
                {task.status} • {task.priority}
                {task.dueDate && ` • Due ${new Date(task.dueDate).toLocaleDateString()}`}
              </div>
            </div>
            {task.assignee && (
              <Avatar className="h-6 w-6">
                <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                <AvatarFallback>
                  {task.assignee.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

