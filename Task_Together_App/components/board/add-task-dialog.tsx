"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { createTask } from "@/lib/board-client"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSession } from "next-auth/react"

interface AddTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listId: string
  onTaskAdded: (task: any) => void
  isDemoMode?: boolean
}

export default function AddTaskDialog({ 
  open, 
  onOpenChange, 
  listId, 
  onTaskAdded,
  isDemoMode = false 
}: AddTaskDialogProps) {
  const { data: session } = useSession()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (isDemoMode && !session?.user) {
        // Simulate task creation for demo mode
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const demoTask = {
          id: `demo-task-${Date.now()}`,
          title: title.trim(),
          description: description.trim(),
          listId,
          priority: priority || "Medium",
          dueDate: dueDate || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          order: 0,
          status: "Todo",
          assignee: null,
          labels: []
        }
        
        onTaskAdded(demoTask)
        toast({
          title: "Success",
          description: "Task created in demo mode",
        })
        resetForm()
        return
      }

      const newTask = await createTask({
        title,
        description,
        listId,
        priority,
        dueDate,
      })

      if (newTask) {
        onTaskAdded(newTask)
        resetForm()
      } else {
        throw new Error("Failed to create task")
      }
    } catch (error) {
      console.error("Error creating task:", error)
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setPriority("")
    setDueDate("")
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) resetForm()
        onOpenChange(newOpen)
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            {isDemoMode && !session?.user && (
              <p className="text-xs text-muted-foreground mt-1">Demo Mode: Changes will not be saved</p>
            )}
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Add a more detailed description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger id="priority" className="w-full">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

