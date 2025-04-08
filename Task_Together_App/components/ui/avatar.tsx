"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { useSession } from "next-auth/react"

import { cn } from "@/lib/utils"

interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  isDemo?: boolean;
}

const Avatar = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, isDemo, ...props }, ref) => {
  const { data: session } = useSession();
  const isDemoMode = isDemo || !session || process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  
  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        isDemoMode && "ring-2 ring-dashed ring-muted-foreground/30 ring-offset-2",
        className
      )}
      {...props}
    />
  );
})
Avatar.displayName = AvatarPrimitive.Root.displayName

interface AvatarImageProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> {
  isDemo?: boolean;
}

const AvatarImage = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Image>,
  AvatarImageProps
>(({ className, isDemo, ...props }, ref) => {
  const { data: session } = useSession();
  const isDemoMode = isDemo || !session || process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  
  return (
    <AvatarPrimitive.Image
      ref={ref}
      className={cn(
        "aspect-square h-full w-full",
        isDemoMode && "opacity-90",
        className
      )}
      {...props}
    />
  );
})
AvatarImage.displayName = AvatarPrimitive.Image.displayName

interface AvatarFallbackProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> {
  isDemo?: boolean;
}

const AvatarFallback = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Fallback>,
  AvatarFallbackProps
>(({ className, isDemo, ...props }, ref) => {
  const { data: session } = useSession();
  const isDemoMode = isDemo || !session || process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  
  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted",
        isDemoMode && "bg-muted/80 text-muted-foreground",
        className
      )}
      {...props}
    />
  );
})
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
