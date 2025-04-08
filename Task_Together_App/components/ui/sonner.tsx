"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import { cn } from "@/lib/utils"

type ToasterProps = React.ComponentProps<typeof Sonner> & {
  isDemoMode?: boolean
}

const Toaster = ({ isDemoMode, ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className={cn(
        "toaster group",
        isDemoMode && "opacity-90"
      )}
      toastOptions={{
        classNames: {
          toast: cn(
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
            isDemoMode && "group-[.toaster]:border-dashed group-[.toaster]:border-muted-foreground/30"
          ),
          description: cn(
            "group-[.toast]:text-muted-foreground",
            isDemoMode && "group-[.toast]:text-muted-foreground/80"
          ),
          actionButton: cn(
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
            isDemoMode && "group-[.toast]:bg-muted-foreground/30 group-[.toast]:text-muted-foreground"
          ),
          cancelButton: cn(
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
            isDemoMode && "group-[.toast]:bg-muted-foreground/20 group-[.toast]:text-muted-foreground/80"
          ),
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
