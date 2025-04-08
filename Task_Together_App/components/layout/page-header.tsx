"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
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
  Users,
  Tag,
  Calendar,
  CheckCircle2,
  Circle,
  AlertCircle,
  Clock8,
  Mail,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"

interface PageHeaderProps {
  showBoardNavigation?: boolean
  showActionButtons?: boolean
  onAddList?: () => void
  boardName?: string
  isDemoMode?: boolean
}

export function PageHeader({
  showBoardNavigation = true,
  showActionButtons = true,
  onAddList,
  boardName = "Product Development",
  isDemoMode = false,
}: PageHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [sortBy, setSortBy] = useState("newest")
  const [filters, setFilters] = useState<string[]>([])
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)

  // Handle scroll behavior for hiding/showing header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHeaderVisible(false)
      } else {
        setIsHeaderVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  const isActive = (path: string) => {
    if (path === "/board") {
      return pathname.startsWith("/board/")
    }
    return pathname === path
  }

  const handleFilterChange = (value: string) => {
    if (filters.includes(value)) {
      setFilters(filters.filter((item) => item !== value))
    } else {
      setFilters([...filters, value])
    }

    if (isDemoMode && !session) {
      toast.success(`${value} ${filters.includes(value) ? "removed from" : "added to"} filters (Demo Mode)`)
    } else {
      toast.success(`${value} ${filters.includes(value) ? "removed from" : "added to"} filters`)
    }
  }

  const handleClearFilters = () => {
    setFilters([])
    if (isDemoMode && !session) {
      toast.success("All filters have been removed (Demo Mode)")
    } else {
      toast.success("All filters have been removed")
    }
  }

  const handleSort = (value: string) => {
    setSortBy(value)
    if (isDemoMode && !session) {
      toast.success(`Sorted by: ${value} (Demo Mode)`)
    } else {
      toast.success(`Sorted by: ${value}`)
    }
  }

  const handleShare = () => {
    if (isDemoMode && !session) {
      toast.success("Share functionality activated (Demo Mode)")
    } else {
      toast.success("Share functionality activated")
    }
  }

  const handleAddList = () => {
    if (onAddList) {
      onAddList()
    } else {
      if (isDemoMode && !session) {
        toast.success("Add list functionality activated (Demo Mode)")
      } else {
        toast.success("Add list functionality activated")
      }
    }
  }

  const getPageTitle = () => {
    if (pathname.includes("/board/")) return boardName
    if (pathname === "/timeline") return "Timeline"
    if (pathname === "/calendar") return "Calendar"
    if (pathname === "/dashboard") return "Dashboard"
    if (pathname === "/team") return "Team"
    if (pathname === "/chat") return "Chat"
    if (pathname === "/inbox") return "Inbox"
    return "TaskTogether"
  }

  return (
    <div
      className={cn(
        "sticky z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b",
        "py-3 px-4 mb-4",
        "transition-all duration-300",
        isHeaderVisible ? "top-16" : "-top-24",
      )}
    >
      {showBoardNavigation && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1 rounded-md bg-muted p-1">
            <Link href="/board/1">
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
        </div>
      )}

      {showActionButtons && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold md:text-2xl">{getPageTitle()}</h1>

            {filters.length > 0 && (
              <div className="hidden md:flex items-center gap-1 ml-2">
                {filters.map((filter) => (
                  <Badge key={filter} variant="outline" className="px-2 py-1">
                    {filter}
                    <button
                      className="ml-1 text-muted-foreground hover:text-foreground"
                      onClick={() => handleFilterChange(filter)}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filter</span>
                  {filters.length > 0 && (
                    <Badge variant="secondary" className="ml-1 px-1 py-0 h-5 min-w-5 flex items-center justify-center">
                      {filters.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter Tasks</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">By Priority</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={filters.includes("High Priority")}
                  onCheckedChange={() => handleFilterChange("High Priority")}
                >
                  <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                  High Priority
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.includes("Medium Priority")}
                  onCheckedChange={() => handleFilterChange("Medium Priority")}
                >
                  <AlertCircle className="mr-2 h-4 w-4 text-yellow-500" />
                  Medium Priority
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.includes("Low Priority")}
                  onCheckedChange={() => handleFilterChange("Low Priority")}
                >
                  <AlertCircle className="mr-2 h-4 w-4 text-blue-500" />
                  Low Priority
                </DropdownMenuCheckboxItem>

                <DropdownMenuSeparator />
                <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">By Status</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={filters.includes("Completed")}
                  onCheckedChange={() => handleFilterChange("Completed")}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                  Completed
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.includes("In Progress")}
                  onCheckedChange={() => handleFilterChange("In Progress")}
                >
                  <Clock8 className="mr-2 h-4 w-4 text-orange-500" />
                  In Progress
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.includes("Not Started")}
                  onCheckedChange={() => handleFilterChange("Not Started")}
                >
                  <Circle className="mr-2 h-4 w-4 text-gray-500" />
                  Not Started
                </DropdownMenuCheckboxItem>

                <DropdownMenuSeparator />
                <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">By Assignee</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={filters.includes("Assigned to me")}
                  onCheckedChange={() => handleFilterChange("Assigned to me")}
                >
                  Assigned to me
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.includes("Unassigned")}
                  onCheckedChange={() => handleFilterChange("Unassigned")}
                >
                  Unassigned
                </DropdownMenuCheckboxItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleClearFilters}>Clear All Filters</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <ArrowDownUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Sort</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={sortBy} onValueChange={handleSort}>
                  <DropdownMenuRadioItem value="newest">
                    <Clock className="mr-2 h-4 w-4" />
                    Newest First
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="oldest">
                    <Clock className="mr-2 h-4 w-4" />
                    Oldest First
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="priority">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Priority
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dueDate">
                    <Calendar className="mr-2 h-4 w-4" />
                    Due Date
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="alphabetical">
                    <Tag className="mr-2 h-4 w-4" />
                    Alphabetical
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Share Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleShare}>
                  <Users className="mr-2 h-4 w-4" />
                  Share with Team
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>Copy Link</DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="default" size="sm" onClick={handleAddList} className="gap-1">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add List</span>
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
      )}

      {/* Demo mode indicator */}
      {isDemoMode && !session && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-md shadow-lg">
          Demo Mode: Changes will not be saved
        </div>
      )}
    </div>
  )
}

