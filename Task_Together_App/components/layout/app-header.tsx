"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Search, X, Plus, Layout, LogOut, Settings, User, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationsMenu } from "@/components/notifications"
import type { User as UserType } from "@/lib/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

interface AppHeaderProps {
  user: UserType | null
  isDemoMode?: boolean
}

export default function AppHeader({ user, isDemoMode = false }: AppHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)

  // Handle scroll behavior for hiding/showing header
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY

    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      // Scrolling down - hide header
      setIsHeaderVisible(false)
    } else {
      // Scrolling up - show header
      setIsHeaderVisible(true)
    }

    // Update scroll position
    setLastScrollY(currentScrollY)

    // Set scrolled state for styling
    setIsScrolled(currentScrollY > 10)
  }, [lastScrollY])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    if (isDemoMode && !session) {
      toast.success(`Searching for: ${searchQuery} (Demo Mode)`)
    } else {
      toast.success(`Searching for: ${searchQuery}`)
    }

    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    setIsSearchOpen(false)
  }

  const handleSignOut = () => {
    if (isDemoMode && !session) {
      toast.success("Signed out in demo mode")
    } else {
      toast.success("Signed out successfully")
    }

    // In a real app, this would call an API endpoint to sign out
    setTimeout(() => {
      router.push("/login")
    }, 1000)
  }

  const handleCreateNew = () => {
    if (isDemoMode && !session) {
      toast.success("Create new item in demo mode")
    }
    router.push("/board/new")
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        isScrolled ? "shadow-sm" : "",
        isHeaderVisible ? "translate-y-0" : "-translate-y-full",
      )}
    >
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Layout className="h-6 w-6 text-primary" />
            <span className="font-bold hidden md:inline-block">TaskTogether</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1 ml-6">
            <Button variant={pathname.includes("/board") ? "default" : "ghost"} size="sm" className="h-8" asChild>
              <Link href="/board/1">Board</Link>
            </Button>
            <Button variant={pathname === "/timeline" ? "default" : "ghost"} size="sm" className="h-8" asChild>
              <Link href="/timeline">Timeline</Link>
            </Button>
            <Button variant={pathname === "/calendar" ? "default" : "ghost"} size="sm" className="h-8" asChild>
              <Link href="/calendar">Calendar</Link>
            </Button>
            <Button variant={pathname === "/dashboard" ? "default" : "ghost"} size="sm" className="h-8" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>

        {/* Search bar - desktop */}
        <div
          className={cn(
            "hidden md:flex items-center ml-4 flex-1 max-w-md transition-all duration-300",
            isSearchOpen ? "opacity-100" : "opacity-100",
          )}
        >
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tasks, boards..."
                className="w-full pl-8 bg-muted/50 border-none focus-visible:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>

        {/* Mobile search button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden ml-auto"
          onClick={() => setIsSearchOpen(!isSearchOpen)}
        >
          {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
        </Button>

        {/* Action buttons */}
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex gap-1"
            onClick={handleCreateNew}
          >
            <Plus className="h-4 w-4" />
            <span>Create</span>
          </Button>

          <ThemeToggle />
          <NotificationsMenu />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar || undefined} alt={user?.name || "User"} />
                  <AvatarFallback>
                    {user?.name
                      ? user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                      : "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/documentation" className="cursor-pointer flex items-center">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help & Support</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer text-red-500 focus:text-red-500 flex items-center"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile search bar - only visible when search is open */}
      {isSearchOpen && (
        <div className="md:hidden p-2 border-t">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          </form>
        </div>
      )}

      {/* Demo mode indicator */}
      {isDemoMode && !session && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-md shadow-lg">
          Demo Mode: Changes will not be saved
        </div>
      )}
    </header>
  )
}

