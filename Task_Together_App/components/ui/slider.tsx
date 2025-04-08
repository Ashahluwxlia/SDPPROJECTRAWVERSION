"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

type SliderProps = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
  isDemoMode?: boolean
}

const Slider = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, isDemoMode, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      isDemoMode && "opacity-80",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className={cn(
      "relative h-2 w-full grow overflow-hidden rounded-full bg-secondary",
      isDemoMode && "bg-muted-foreground/30"
    )}>
      <SliderPrimitive.Range className={cn(
        "absolute h-full bg-primary",
        isDemoMode && "bg-muted-foreground/50"
      )} />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className={cn(
      "block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      isDemoMode && "border-muted-foreground/50"
    )} />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
