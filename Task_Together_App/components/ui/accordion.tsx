"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

type AccordionProps = React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root> & {
  isDemoMode?: boolean
}

const Accordion = React.forwardRef<React.ComponentRef<typeof AccordionPrimitive.Root>, AccordionProps>(
  ({ className, isDemoMode = false, ...props }, ref) => {
    const { data: session } = useSession()
    const type = props.type || "single"

    const handleValueChange = (value: string | string[]) => {
      if (isDemoMode && !session) {
        if (type === "single") {
          toast.success(`Accordion ${value ? 'opened' : 'closed'} in demo mode`)
        } else {
          const values = value as string[]
          toast.success(`Accordion items ${values.length > 0 ? 'opened' : 'closed'} in demo mode`)
        }
      }
      
      // Call the original onValueChange with the correct type
      if (type === "single" && props.onValueChange) {
        (props.onValueChange as (value: string) => void)(value as string)
      } else if (props.onValueChange) {
        (props.onValueChange as (value: string[]) => void)(value as string[])
      }
    }

    return (
      <AccordionPrimitive.Root
        ref={ref}
        className={cn("", className)}
        onValueChange={handleValueChange}
        {...props}
      />
    )
  }
)
Accordion.displayName = "Accordion"

const AccordionItem = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> & {
    isDemoMode?: boolean
  }
>(({ className, isDemoMode = false, ...props }, ref) => {
  const { data: session } = useSession()

  const handleClick = (e: React.MouseEvent) => {
    if (isDemoMode && !session) {
      const value = props.value as string
      toast.success(`Accordion item "${value}" clicked in demo mode`)
    }
  }

  return (
    <AccordionPrimitive.Item
      ref={ref}
      className={cn("border-b", className)}
      onClick={handleClick}
      {...props}
    />
  )
})
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & {
    isDemoMode?: boolean
  }
>(({ className, children, isDemoMode = false, ...props }, ref) => {
  const { data: session } = useSession()

  const handleClick = (e: React.MouseEvent) => {
    if (isDemoMode && !session) {
      const value = (e.currentTarget as HTMLElement).closest('[data-state]')?.getAttribute('data-state')
      toast.success(`Accordion trigger ${value === 'open' ? 'opened' : 'closed'} in demo mode`)
    }
  }

  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
})
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> & {
    isDemoMode?: boolean
  }
>(({ className, children, isDemoMode = false, ...props }, ref) => {
  const { data: session } = useSession()

  return (
    <AccordionPrimitive.Content
      ref={ref}
      className={cn(
        "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
        className
      )}
      {...props}
    >
      <div className={cn("pb-4 pt-0", className)}>
        {children}
        {isDemoMode && !session && (
          <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
            Demo Mode: Content changes are simulated
          </div>
        )}
      </div>
    </AccordionPrimitive.Content>
  )
})
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
