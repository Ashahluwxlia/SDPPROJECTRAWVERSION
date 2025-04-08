import { cn } from "@/lib/utils"

type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  isDemoMode?: boolean
}

function Skeleton({
  className,
  isDemoMode,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        isDemoMode && "bg-muted-foreground/30",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
