import * as React from "react"

import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  isDemoMode?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, isDemoMode, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        isDemoMode && "border-dashed border-muted-foreground/30",
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  isDemoMode?: boolean
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, isDemoMode, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col space-y-1.5 p-6",
        isDemoMode && "bg-muted/10",
        className
      )}
      {...props}
    />
  )
)
CardHeader.displayName = "CardHeader"

interface CardTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  isDemoMode?: boolean
}

const CardTitle = React.forwardRef<HTMLDivElement, CardTitleProps>(
  ({ className, isDemoMode, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        isDemoMode && "text-muted-foreground",
        className
      )}
      {...props}
    />
  )
)
CardTitle.displayName = "CardTitle"

interface CardDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {
  isDemoMode?: boolean
}

const CardDescription = React.forwardRef<HTMLDivElement, CardDescriptionProps>(
  ({ className, isDemoMode, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "text-sm text-muted-foreground",
        isDemoMode && "text-muted-foreground/80",
        className
      )}
      {...props}
    />
  )
)
CardDescription.displayName = "CardDescription"

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  isDemoMode?: boolean
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, isDemoMode, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn(
        "p-6 pt-0",
        isDemoMode && "bg-muted/5",
        className
      )} 
      {...props} 
    />
  )
)
CardContent.displayName = "CardContent"

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  isDemoMode?: boolean
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, isDemoMode, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center p-6 pt-0",
        isDemoMode && "border-t border-dashed border-muted-foreground/20",
        className
      )}
      {...props}
    />
  )
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
