"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Board } from "@/lib/types"
import {
  MoreHorizontal,
  Users,
  Star,
  Pencil,
  Filter,
  SlidersHorizontal,
  Share,
  ChevronLeft,
  Clock,
  Calendar,
  BarChart,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

interface BoardHeaderProps {
  board: Board
  isDemoMode?: boolean
}

export default function BoardHeader({ board, isDemoMode = false }: BoardHeaderProps) {
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [boardName, setBoardName] = useState(board.name)
  const [isStarred, setIsStarred] = useState(false)

  const handleSave = async () => {
    if (isDemoMode && !session?.user) {
      // Simulate saving in demo mode
      await new Promise(resolve => setTimeout(resolve, 300))
      toast.success("Board name updated in demo mode")
      setIsEditing(false)
      return
    }

    try {
      // In a real app, this would update the board name in the database
      // For now, we'll just log it
      console.log("Saving board name:", boardName)
      toast.success("Board name updated")
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating board name:", error)
      toast.error("Failed to update board name")
    }
  }

  const toggleStar = async () => {
    if (isDemoMode && !session?.user) {
      // Simulate toggling star in demo mode
      await new Promise(resolve => setTimeout(resolve, 300))
      setIsStarred(!isStarred)
      toast.success(isStarred ? "Board unstarred in demo mode" : "Board starred in demo mode")
      return
    }

    try {
      // In a real app, this would update the star status in the database
      setIsStarred(!isStarred)
      toast.success(isStarred ? "Board unstarred" : "Board starred")
    } catch (error) {
      console.error("Error toggling star:", error)
      toast.error("Failed to update star status")
    }
  }

  return (
    <div className="border-b bg-background p-4 sticky top-[var(--header-height)] z-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href="/dashboard">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>

          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                className="max-w-xs"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave()
                  if (e.key === "Escape") setIsEditing(false)
                }}
              />
              <Button size="sm" onClick={handleSave}>
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold">{board.name}</h1>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleStar}>
                <Star className={`h-4 w-4 ${isStarred ? "fill-yellow-400 text-yellow-400" : ""}`} />
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Tabs defaultValue="board" className="hidden md:block">
            <TabsList>
              <TabsTrigger value="board">Board</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2 ml-auto md:ml-4">
            <Button variant="outline" size="sm" className="gap-1">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Sort</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Share className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Users className="h-4 w-4 mr-2" /> Manage members
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Clock className="h-4 w-4 mr-2" /> View activity
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Calendar className="h-4 w-4 mr-2" /> Calendar view
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BarChart className="h-4 w-4 mr-2" /> Board analytics
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Board settings</DropdownMenuItem>
                <DropdownMenuItem>Change background</DropdownMenuItem>
                <DropdownMenuItem>Copy board link</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">Delete board</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      {isDemoMode && !session?.user && (
        <div className="mt-2 text-xs text-muted-foreground">
          Demo Mode: Changes will not be saved
        </div>
      )}
    </div>
  )
}

