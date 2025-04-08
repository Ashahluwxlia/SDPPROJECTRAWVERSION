"use client"

import { GripVertical } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

type ResizablePanelGroupProps = React.ComponentProps<typeof ResizablePrimitive.PanelGroup> & {
  isDemoMode?: boolean
}

const ResizablePanelGroup = ({
  className,
  isDemoMode,
  ...props
}: ResizablePanelGroupProps) => (
  <ResizablePrimitive.PanelGroup
    className={cn(
      "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
      isDemoMode && "border-dashed border-muted-foreground/30",
      className
    )}
    {...props}
  />
)

const ResizablePanel = ResizablePrimitive.Panel

type ResizableHandleProps = React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
  isDemoMode?: boolean
}

const ResizableHandle = ({
  withHandle,
  className,
  isDemoMode,
  ...props
}: ResizableHandleProps) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
      isDemoMode && "bg-muted-foreground/30",
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className={cn("z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border", isDemoMode && "border-muted-foreground/50")}>
        <GripVertical className={cn("h-2.5 w-2.5", isDemoMode && "text-muted-foreground")} />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
