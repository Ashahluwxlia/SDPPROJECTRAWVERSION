"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "./input"
import { Button } from "./button"
import { Search } from "lucide-react"

type SearchProps = {
  className?: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onSubmit?: (value: string) => void
  isDemoMode?: boolean
}

export function SearchInput({
  className,
  placeholder = "Search...",
  value,
  onChange,
  onSubmit,
  isDemoMode,
}: SearchProps) {
  const [searchValue, setSearchValue] = React.useState(value || "")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchValue(newValue)
    onChange?.(newValue)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(searchValue)
  }

  return (
    <form onSubmit={handleSubmit} className={cn("relative w-full", className)}>
      <Input
        type="search"
        placeholder={placeholder}
        value={searchValue}
        onChange={handleChange}
        className={cn(
          "w-full pl-10",
          isDemoMode && "border-dashed border-muted-foreground/30"
        )}
      />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        className="absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full"
      >
        <Search className="h-4 w-4" />
        <span className="sr-only">Search</span>
      </Button>
    </form>
  )
}