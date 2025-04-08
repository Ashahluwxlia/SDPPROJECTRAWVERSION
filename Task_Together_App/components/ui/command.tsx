"use client"

import * as React from "react"
import { type DialogProps } from "@radix-ui/react-dialog"
import { Command as CommandPrimitive } from "cmdk"
import { Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface CommandProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive> {
  isDemoMode?: boolean
}

const Command = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive>,
  CommandProps
>(({ className, isDemoMode, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
      isDemoMode && "border border-dashed border-muted-foreground/30",
      className
    )}
    {...props}
  />
))
Command.displayName = CommandPrimitive.displayName

interface CommandDialogProps extends DialogProps {
  isDemoMode?: boolean
}

const CommandDialog = ({ children, isDemoMode, ...props }: CommandDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5" isDemoMode={isDemoMode}>
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

interface CommandInputProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input> {
  isDemoMode?: boolean
}

const CommandInput = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Input>,
  CommandInputProps
>(({ className, isDemoMode, ...props }, ref) => (
  <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        isDemoMode && "text-muted-foreground",
        className
      )}
      {...props}
    />
  </div>
))

CommandInput.displayName = CommandPrimitive.Input.displayName

interface CommandListProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.List> {
  isDemoMode?: boolean
}

const CommandList = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.List>,
  CommandListProps
>(({ className, isDemoMode, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn(
      "max-h-[300px] overflow-y-auto overflow-x-hidden",
      isDemoMode && "bg-muted/10",
      className
    )}
    {...props}
  />
))

CommandList.displayName = CommandPrimitive.List.displayName

interface CommandEmptyProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty> {
  isDemoMode?: boolean
}

const CommandEmpty = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Empty>,
  CommandEmptyProps
>(({ className, isDemoMode, ...props }, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className={cn(
      "py-6 text-center text-sm",
      isDemoMode && "text-muted-foreground",
      className
    )}
    {...props}
  />
))

CommandEmpty.displayName = CommandPrimitive.Empty.displayName

interface CommandGroupProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group> {
  isDemoMode?: boolean
}

const CommandGroup = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Group>,
  CommandGroupProps
>(({ className, isDemoMode, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      isDemoMode && "border-l-2 border-dashed border-muted-foreground/30",
      className
    )}
    {...props}
  />
))

CommandGroup.displayName = CommandPrimitive.Group.displayName

interface CommandSeparatorProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator> {
  isDemoMode?: boolean
}

const CommandSeparator = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Separator>,
  CommandSeparatorProps
>(({ className, isDemoMode, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn(
      "-mx-1 h-px bg-border",
      isDemoMode && "bg-muted-foreground/30",
      className
    )}
    {...props}
  />
))
CommandSeparator.displayName = CommandPrimitive.Separator.displayName

interface CommandItemProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item> {
  isDemoMode?: boolean
}

const CommandItem = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Item>,
  CommandItemProps
>(({ className, isDemoMode, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      isDemoMode && "hover:bg-muted/20",
      className
    )}
    {...props}
  />
))

CommandItem.displayName = CommandPrimitive.Item.displayName

interface CommandShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {
  isDemoMode?: boolean
}

const CommandShortcut = ({
  className,
  isDemoMode,
  ...props
}: CommandShortcutProps) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        isDemoMode && "text-muted-foreground/80",
        className
      )}
      {...props}
    />
  )
}
CommandShortcut.displayName = "CommandShortcut"

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
