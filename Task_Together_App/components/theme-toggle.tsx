"use client"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ThemeToggleProps {
  variant?: "default" | "menu"
  isDemoMode?: boolean
}

export function ThemeToggle({ variant = "default", isDemoMode }: ThemeToggleProps) {
  const { setTheme } = useTheme()

  if (variant === "menu") {
    return (
      <div className={`flex items-center justify-between ${isDemoMode ? "border border-dashed border-muted-foreground/30 rounded-md p-1" : ""}`}>
        <span>Theme</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" isDemoMode={isDemoMode}>
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={isDemoMode ? "border-dashed border-muted-foreground/30" : ""}>
            <DropdownMenuItem onClick={() => setTheme("light")} isDemoMode={isDemoMode}>Light</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")} isDemoMode={isDemoMode}>Dark</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")} isDemoMode={isDemoMode}>System</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" isDemoMode={isDemoMode}>
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={isDemoMode ? "border-dashed border-muted-foreground/30" : ""}>
        <DropdownMenuItem onClick={() => setTheme("light")} isDemoMode={isDemoMode}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} isDemoMode={isDemoMode}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} isDemoMode={isDemoMode}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

