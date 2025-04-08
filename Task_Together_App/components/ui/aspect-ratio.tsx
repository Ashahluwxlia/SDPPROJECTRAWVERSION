"use client"

import * as React from "react"
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"
import { useSession } from "next-auth/react"

import { cn } from "@/lib/utils"

interface AspectRatioProps extends React.ComponentPropsWithoutRef<typeof AspectRatioPrimitive.Root> {
  isDemo?: boolean;
}

const AspectRatio = React.forwardRef<
  React.ComponentRef<typeof AspectRatioPrimitive.Root>,
  AspectRatioProps
>(({ className, isDemo, ...props }, ref) => {
  const { data: session } = useSession();
  const isDemoMode = isDemo || !session || process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  
  return (
    <AspectRatioPrimitive.Root
      ref={ref}
      className={cn(
        isDemoMode && "relative before:absolute before:inset-0 before:z-10 before:bg-background/10 before:border before:border-dashed before:border-muted-foreground/30 before:rounded-md before:content-['Demo'] before:flex before:items-center before:justify-center before:text-xs before:text-muted-foreground before:font-medium",
        className
      )}
      {...props}
    />
  );
});

AspectRatio.displayName = "AspectRatio";

export { AspectRatio };
