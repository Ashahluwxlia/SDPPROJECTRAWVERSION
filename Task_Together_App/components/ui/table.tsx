import * as React from "react"

import { cn } from "@/lib/utils"

type TableProps = React.HTMLAttributes<HTMLTableElement> & {
  isDemoMode?: boolean
}

const Table = React.forwardRef<
  HTMLTableElement,
  TableProps
>(({ className, isDemoMode, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn(
        "w-full caption-bottom text-sm",
        isDemoMode && "border-dashed border-muted-foreground/30",
        className
      )}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

type TableHeaderProps = React.HTMLAttributes<HTMLTableSectionElement> & {
  isDemoMode?: boolean
}

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  TableHeaderProps
>(({ className, isDemoMode, ...props }, ref) => (
  <thead 
    ref={ref} 
    className={cn(
      "[&_tr]:border-b",
      isDemoMode && "border-b border-dashed border-muted-foreground/30",
      className
    )} 
    {...props} 
  />
))
TableHeader.displayName = "TableHeader"

type TableBodyProps = React.HTMLAttributes<HTMLTableSectionElement> & {
  isDemoMode?: boolean
}

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  TableBodyProps
>(({ className, isDemoMode, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn(
      "[&_tr:last-child]:border-0",
      isDemoMode && "[&_tr]:border-b [&_tr]:border-dashed [&_tr]:border-muted-foreground/30",
      className
    )}
    {...props}
  />
))
TableBody.displayName = "TableBody"

type TableFooterProps = React.HTMLAttributes<HTMLTableSectionElement> & {
  isDemoMode?: boolean
}

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  TableFooterProps
>(({ className, isDemoMode, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      isDemoMode && "border-t border-dashed border-muted-foreground/30 bg-muted-foreground/10",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

type TableRowProps = React.HTMLAttributes<HTMLTableRowElement> & {
  isDemoMode?: boolean
}

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  TableRowProps
>(({ className, isDemoMode, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      isDemoMode && "border-b border-dashed border-muted-foreground/30 hover:bg-muted-foreground/10",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement> & {
  isDemoMode?: boolean
}

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  TableHeadProps
>(({ className, isDemoMode, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      isDemoMode && "text-muted-foreground/80",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement> & {
  isDemoMode?: boolean
}

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  TableCellProps
>(({ className, isDemoMode, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-4 align-middle [&:has([role=checkbox])]:pr-0",
      isDemoMode && "text-muted-foreground/80",
      className
    )}
    {...props}
  />
))
TableCell.displayName = "TableCell"

type TableCaptionProps = React.HTMLAttributes<HTMLTableCaptionElement> & {
  isDemoMode?: boolean
}

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  TableCaptionProps
>(({ className, isDemoMode, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn(
      "mt-4 text-sm text-muted-foreground",
      isDemoMode && "text-muted-foreground/80",
      className
    )}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
