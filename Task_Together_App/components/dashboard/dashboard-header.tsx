"use client"

import type React from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, Bell, Menu } from "lucide-react"
import { SearchInput } from "@/components/ui/search"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import DashboardSidebar from "./dashboard-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { toast } from "@/components/ui/use-toast"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

interface User {
  name: string | null
  email: string
  avatar?: string | null
}

interface DashboardHeaderProps {
  user?: User | null
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [userData, setUserData] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Demo data for non-authenticated users
  const demoUser = {
    name: "Demo User",
    email: "demo@example.com",
    avatar: "/placeholder-user.jpg",
  }

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true)
      
      if (session?.user) {
        try {
          // In a real app, this would fetch data from your API
          const response = await fetch('/api/user/profile')
          
          if (response.ok) {
            const userData = await response.json()
            setUserData(userData)
          } else {
            setUserData(demoUser)
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          // Fallback to demo data on error
          setUserData(demoUser)
        }
      } else {
        // Use demo data for non-authenticated users
        setUserData(demoUser)
      }
      
      setIsLoading(false)
    }

    fetchUserData()
  }, [session])

  // Use either the passed user prop or the fetched userData
  const currentUser = user || userData || demoUser

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const query = formData.get("query")?.toString() || ""

    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  const handleSignOut = () => {
    toast({
      title: "Signing out",
      description: "You are being signed out of your account.",
    })

    // In a real app, this would call an API endpoint to sign out
    setTimeout(() => {
      router.push("/login")
    }, 1000)
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 md:gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <DashboardSidebar />
            </SheetContent>
          </Sheet>

          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <rect width="7" height="7" x="3" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="14" rx="1" />
                <rect width="7" height="7" x="3" y="14" rx="1" />
              </svg>
            </div>
            <span className="hidden font-bold md:inline-block">TaskTogether</span>
          </Link>
        </div>

        <div className="hidden md:flex md:w-1/3 lg:w-1/4">
          <SearchInput />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => router.push("/search")}>
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          <Button variant="ghost" size="icon" onClick={() => router.push("/notifications")}>
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name || ""} />
                  <AvatarFallback>{currentUser.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{currentUser.name || "User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/inbox">Inbox</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/chat">Chat</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <ThemeToggle variant="menu" />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

