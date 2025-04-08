"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createList } from "@/lib/board-client"
import { toast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"

interface AddListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  boardId: string
  onListAdded: (list: any) => void
  isDemoMode?: boolean
}

export default function AddListDialog({ 
  open, 
  onOpenChange, 
  boardId, 
  onListAdded,
  isDemoMode = false 
}: AddListDialogProps) {
  const { data: session } = useSession()
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "List name is required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (isDemoMode && !session?.user) {
        // Simulate list creation for demo mode
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const demoList = {
          id: `demo-list-${Date.now()}`,
          name: name.trim(),
          boardId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          order: 0,
          cards: []
        }
        
        onListAdded(demoList)
        toast({
          title: "Success",
          description: "List created in demo mode",
        })
        resetForm()
        return
      }

      const newList = await createList({
        name,
        boardId,
      })

      if (newList) {
        onListAdded(newList)
        resetForm()
      } else {
        throw new Error("Failed to create list")
      }
    } catch (error) {
      console.error("Error creating list:", error)
      toast({
        title: "Error",
        description: "Failed to create list",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setName("")
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) resetForm()
        onOpenChange(newOpen)
      }}
    >
      <DialogContent className="sm:max-w-[400px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New List</DialogTitle>
            {isDemoMode && !session?.user && (
              <p className="text-xs text-muted-foreground mt-1">Demo Mode: Changes will not be saved</p>
            )}
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">List Name</Label>
              <Input
                id="name"
                placeholder="Enter list name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create List"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

