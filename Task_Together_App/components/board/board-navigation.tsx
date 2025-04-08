"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  LayoutGrid,
  Clock,
  CalendarIcon,
  LayoutDashboard,
  Filter,
  ArrowDownUp,
  Share2,
  Plus,
  MoreHorizontal,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"

interface BoardNavigationProps {
  isDemoMode?: boolean
}

export function BoardNavigation({ isDemoMode = false }: BoardNavigationProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  // Extract board ID from pathname
  const boardIdFromPath = pathname.match(/\/board\/([^/]+)/)
  const currentBoardId = boardIdFromPath?.[1] || ""

  const isActive = (path: string) => {
    if (path === "/board") {
      return pathname.startsWith("/board/")
    }
    if (path === "/timeline") {
      return pathname === "/timeline"
    }
    if (path === "/calendar") {
      return pathname === "/calendar"
    }
    if (path === "/dashboard") {
      return pathname === "/dashboard"
    }
    return false
  }

  const handleFilter = () => {
    if (isDemoMode && !session?.user) {
      toast({
        title: "Demo Mode",
        description: "Filter functionality activated in demo mode",
        duration: 2000,
      })
      return
    }
    
    toast({
      title: "Filter",
      description: "Filter functionality activated",
      duration: 2000,
    })
  }

  const handleSort = () => {
    if (isDemoMode && !session?.user) {
      toast({
        title: "Demo Mode",
        description: "Sort functionality activated in demo mode",
        duration: 2000,
      })
      return
    }
    
    toast({
      title: "Sort",
      description: "Sort functionality activated",
      duration: 2000,
    })
  }

  const handleShare = () => {
    if (isDemoMode && !session?.user) {
      toast({
        title: "Demo Mode",
        description: "Share functionality activated in demo mode",
        duration: 2000,
      })
      return
    }
    
    toast({
      title: "Share",
      description: "Share functionality activated",
      duration: 2000,
    })
  }

  const handleAddList = () => {
    if (isDemoMode && !session?.user) {
      toast({
        title: "Demo Mode",
        description: "Add list functionality activated in demo mode",
        duration: 2000,
      })
      return
    }
    
    toast({
      title: "Add List",
      description: "Add list functionality activated",
      duration: 2000,
    })
  }

  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 rounded-md bg-muted p-1">
          <Link href={`/board/${currentBoardId}`}>
            <Button variant={isActive("/board") ? "default" : "ghost"} size="sm" className="gap-1">
              <LayoutGrid className="h-4 w-4" />
              <span>Board</span>
            </Button>
          </Link>
          <Link href="/timeline">
            <Button variant={isActive("/timeline") ? "default" : "ghost"} size="sm" className="gap-1">
              <Clock className="h-4 w-4" />
              <span>Timeline</span>
            </Button>
          </Link>
          <Link href="/calendar">
            <Button variant={isActive("/calendar") ? "default" : "ghost"} size="sm" className="gap-1">
              <CalendarIcon className="h-4 w-4" />
              <span>Calendar</span>
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant={isActive("/dashboard") ? "default" : "ghost"} size="sm" className="gap-1">
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleFilter} className="gap-1">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </Button>

          <Button variant="outline" size="sm" onClick={handleSort} className="gap-1">
            <ArrowDownUp className="h-4 w-4" />
            <span>Sort</span>
          </Button>

          <Button variant="outline" size="sm" onClick={handleShare} className="gap-1">
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>

          <Button variant="default" size="sm" onClick={handleAddList} className="gap-1">
            <Plus className="h-4 w-4" />
            <span>Add List</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Board Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Board Settings</DropdownMenuItem>
              <DropdownMenuItem>Export Board</DropdownMenuItem>
              <DropdownMenuItem>Archive Board</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {isDemoMode && !session?.user && (
        <div className="text-xs text-muted-foreground">
          Demo Mode: Changes will not be saved
        </div>
      )}
    </div>
  )
}

