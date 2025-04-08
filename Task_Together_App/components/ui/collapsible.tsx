"use client"

import * as React from "react"
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import { cn } from "@/lib/utils"

interface CollapsibleProps extends React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root> {
  isDemoMode?: boolean
}

const Collapsible = React.forwardRef<
  React.ComponentRef<typeof CollapsiblePrimitive.Root>,
  CollapsibleProps
>(({ className, isDemoMode, ...props }, ref) => (
  <CollapsiblePrimitive.Root
    ref={ref}
    className={cn(
      isDemoMode && "border border-dashed border-muted-foreground/30 rounded-md",
      className
    )}
    {...props}
  />
))
Collapsible.displayName = CollapsiblePrimitive.Root.displayName

interface CollapsibleTriggerProps extends React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleTrigger> {
  isDemoMode?: boolean
}

const CollapsibleTrigger = React.forwardRef<
  React.ComponentRef<typeof CollapsiblePrimitive.CollapsibleTrigger>,
  CollapsibleTriggerProps
>(({ className, isDemoMode, ...props }, ref) => (
  <CollapsiblePrimitive.CollapsibleTrigger
    ref={ref}
    className={cn(
      isDemoMode && "text-muted-foreground",
      className
    )}
    {...props}
  />
))
CollapsibleTrigger.displayName = CollapsiblePrimitive.CollapsibleTrigger.displayName

interface CollapsibleContentProps extends React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleContent> {
  isDemoMode?: boolean
}

const CollapsibleContent = React.forwardRef<
  React.ComponentRef<typeof CollapsiblePrimitive.CollapsibleContent>,
  CollapsibleContentProps
>(({ className, isDemoMode, ...props }, ref) => (
  <CollapsiblePrimitive.CollapsibleContent
    ref={ref}
    className={cn(
      isDemoMode && "bg-muted/10",
      className
    )}
    {...props}
  />
))
CollapsibleContent.displayName = CollapsiblePrimitive.CollapsibleContent.displayName

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
