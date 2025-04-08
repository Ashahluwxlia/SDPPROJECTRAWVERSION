"use client"

import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"

import { cn } from "@/lib/utils"

// For components that don't accept className or ref directly
const DrawerTrigger = DrawerPrimitive.Trigger
const DrawerPortal = DrawerPrimitive.Portal
const DrawerClose = DrawerPrimitive.Close

// Define Drawer component with isDemoMode prop
const Drawer = ({
  shouldScaleBackground = true,
  isDemoMode,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root> & { isDemoMode?: boolean }) => (
  <DrawerPrimitive.Root
    shouldScaleBackground={shouldScaleBackground}
    {...props}
  />
)
Drawer.displayName = "Drawer"

interface DrawerOverlayProps extends React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay> {
  isDemoMode?: boolean
}

const DrawerOverlay = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Overlay>,
  DrawerOverlayProps
>(({ className, isDemoMode, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80",
      isDemoMode && "bg-muted-foreground/10",
      className
    )}
    {...props}
  />
))
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName

interface DrawerContentProps extends React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content> {
  isDemoMode?: boolean
}

const DrawerContent = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Content>,
  DrawerContentProps
>(({ className, children, isDemoMode, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay isDemoMode={isDemoMode} />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
        isDemoMode && "border-dashed border-muted-foreground/30",
        className
      )}
      {...props}
    >
      <div className={cn(
        "mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted",
        isDemoMode && "bg-muted-foreground/30"
      )} />
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
))
DrawerContent.displayName = "DrawerContent"

interface DrawerHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  isDemoMode?: boolean
}

const DrawerHeader = ({
  className,
  isDemoMode,
  ...props
}: DrawerHeaderProps) => (
  <div
    className={cn(
      "grid gap-1.5 p-4 text-center sm:text-left",
      isDemoMode && "border-b border-dashed border-muted-foreground/30",
      className
    )}
    {...props}
  />
)
DrawerHeader.displayName = "DrawerHeader"

interface DrawerFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  isDemoMode?: boolean
}

const DrawerFooter = ({
  className,
  isDemoMode,
  ...props
}: DrawerFooterProps) => (
  <div
    className={cn(
      "mt-auto flex flex-col gap-2 p-4",
      isDemoMode && "border-t border-dashed border-muted-foreground/30",
      className
    )}
    {...props}
  />
)
DrawerFooter.displayName = "DrawerFooter"

interface DrawerTitleProps extends React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title> {
  isDemoMode?: boolean
}

const DrawerTitle = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Title>,
  DrawerTitleProps
>(({ className, isDemoMode, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      isDemoMode && "text-muted-foreground",
      className
    )}
    {...props}
  />
))
DrawerTitle.displayName = DrawerPrimitive.Title.displayName

interface DrawerDescriptionProps extends React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description> {
  isDemoMode?: boolean
}

const DrawerDescription = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Description>,
  DrawerDescriptionProps
>(({ className, isDemoMode, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn(
      "text-sm text-muted-foreground",
      isDemoMode && "text-muted-foreground/80",
      className
    )}
    {...props}
  />
))
DrawerDescription.displayName = DrawerPrimitive.Description.displayName

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
