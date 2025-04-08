import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { ButtonProps, buttonVariants } from "@/components/ui/button"

type PaginationProps = React.ComponentProps<"nav"> & {
  isDemoMode?: boolean
}

const Pagination = ({ className, isDemoMode, ...props }: PaginationProps) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn(
      "mx-auto flex w-full justify-center",
      isDemoMode && "border-dashed border-muted-foreground/30",
      className
    )}
    {...props}
  />
)
Pagination.displayName = "Pagination"

type PaginationContentProps = React.ComponentProps<"ul"> & {
  isDemoMode?: boolean
}

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  PaginationContentProps
>(({ className, isDemoMode, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn(
      "flex flex-row items-center gap-1",
      isDemoMode && "text-muted-foreground",
      className
    )}
    {...props}
  />
))
PaginationContent.displayName = "PaginationContent"

type PaginationItemProps = React.ComponentProps<"li"> & {
  isDemoMode?: boolean
}

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  PaginationItemProps
>(({ className, isDemoMode, ...props }, ref) => (
  <li 
    ref={ref} 
    className={cn(
      "",
      isDemoMode && "text-muted-foreground",
      className
    )} 
    {...props} 
  />
))
PaginationItem.displayName = "PaginationItem"

type PaginationLinkProps = {
  isActive?: boolean
  isDemoMode?: boolean
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">

const PaginationLink = ({
  className,
  isActive,
  isDemoMode,
  size = "icon",
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      isDemoMode && !isActive && "text-muted-foreground",
      isDemoMode && isActive && "border-dashed border-muted-foreground/30",
      className
    )}
    {...props}
  />
)
PaginationLink.displayName = "PaginationLink"

type PaginationPreviousProps = React.ComponentProps<typeof PaginationLink> & {
  isDemoMode?: boolean
}

const PaginationPrevious = ({
  className,
  isDemoMode,
  ...props
}: PaginationPreviousProps) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    isDemoMode={isDemoMode}
    className={cn("gap-1 pl-2.5", className)}
    {...props}
  >
    <ChevronLeft className={cn("h-4 w-4", isDemoMode && "text-muted-foreground")} />
    <span>Previous</span>
  </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

type PaginationNextProps = React.ComponentProps<typeof PaginationLink> & {
  isDemoMode?: boolean
}

const PaginationNext = ({
  className,
  isDemoMode,
  ...props
}: PaginationNextProps) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    isDemoMode={isDemoMode}
    className={cn("gap-1 pr-2.5", className)}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className={cn("h-4 w-4", isDemoMode && "text-muted-foreground")} />
  </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

type PaginationEllipsisProps = React.ComponentProps<"span"> & {
  isDemoMode?: boolean
}

const PaginationEllipsis = ({
  className,
  isDemoMode,
  ...props
}: PaginationEllipsisProps) => (
  <span
    aria-hidden
    className={cn(
      "flex h-9 w-9 items-center justify-center",
      isDemoMode && "text-muted-foreground",
      className
    )}
    {...props}
  >
    <MoreHorizontal className={cn("h-4 w-4", isDemoMode && "text-muted-foreground")} />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
