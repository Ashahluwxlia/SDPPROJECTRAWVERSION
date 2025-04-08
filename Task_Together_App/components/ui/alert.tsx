import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { useSession } from "next-auth/react"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        demo: "bg-background border-dashed border-muted-foreground/30 text-foreground [&>svg]:text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  isDemo?: boolean;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, isDemo, ...props }, ref) => {
    const { data: session } = useSession();
    const isDemoMode = isDemo || !session || process.env.NEXT_PUBLIC_DEMO_MODE === "true";
    
    // If in demo mode and no variant is specified, use the demo variant
    const effectiveVariant = isDemoMode && !variant ? "demo" : variant;
    
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant: effectiveVariant }), className)}
        {...props}
      />
    );
  }
)
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
