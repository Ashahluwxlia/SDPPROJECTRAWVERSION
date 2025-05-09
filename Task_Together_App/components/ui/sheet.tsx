"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Sheet = SheetPrimitive.Root

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

type SheetOverlayProps = React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay> & {
  isDemoMode?: boolean
}

const SheetOverlay = React.forwardRef<
  React.ComponentRef<typeof SheetPrimitive.Overlay>,
  SheetOverlayProps
>(({ className, isDemoMode, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      isDemoMode && "bg-blue-950/20",
      className
    )}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  isDemoMode?: boolean
}

const SheetContent = React.forwardRef<
  React.ComponentRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, isDemoMode, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay isDemoMode={isDemoMode} />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        sheetVariants({ side }), 
        isDemoMode && "border-dashed border-muted-foreground/30",
        className
      )}
      {...props}
    >
      {children}
      <SheetPrimitive.Close className={cn(
        "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",
        isDemoMode && "text-muted-foreground"
      )}>
        <X className={cn("h-4 w-4", isDemoMode && "text-muted-foreground")} />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

type SheetHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  isDemoMode?: boolean
}

const SheetHeader = ({
  className,
  isDemoMode,
  ...props
}: SheetHeaderProps) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      isDemoMode && "border-b border-dashed border-muted-foreground/30 pb-2",
      className
    )}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

type SheetFooterProps = React.HTMLAttributes<HTMLDivElement> & {
  isDemoMode?: boolean
}

const SheetFooter = ({
  className,
  isDemoMode,
  ...props
}: SheetFooterProps) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      isDemoMode && "border-t border-dashed border-muted-foreground/30 pt-2",
      className
    )}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"

type SheetTitleProps = React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title> & {
  isDemoMode?: boolean
}

const SheetTitle = React.forwardRef<
  React.ComponentRef<typeof SheetPrimitive.Title>,
  SheetTitleProps
>(({ className, isDemoMode, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold text-foreground",
      isDemoMode && "text-muted-foreground",
      className
    )}
    {...props}
  />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

type SheetDescriptionProps = React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description> & {
  isDemoMode?: boolean
}

const SheetDescription = React.forwardRef<
  React.ComponentRef<typeof SheetPrimitive.Description>,
  SheetDescriptionProps
>(({ className, isDemoMode, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn(
      "text-sm text-muted-foreground",
      isDemoMode && "text-muted-foreground/80",
      className
    )}
    {...props}
  />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
