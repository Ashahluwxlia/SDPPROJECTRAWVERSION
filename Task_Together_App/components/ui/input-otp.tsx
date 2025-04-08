"use client"

import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"
import { Dot } from "lucide-react"

import { cn } from "@/lib/utils"

type InputOTPProps = React.ComponentPropsWithoutRef<typeof OTPInput> & {
  isDemoMode?: boolean
}

const InputOTP = React.forwardRef<
  React.ComponentRef<typeof OTPInput>,
  InputOTPProps
>(({ className, containerClassName, isDemoMode, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn(
      "flex items-center gap-2 has-[:disabled]:opacity-50",
      containerClassName
    )}
    className={cn("disabled:cursor-not-allowed", className)}
    {...props}
  />
))
InputOTP.displayName = "InputOTP"

type InputOTPGroupProps = React.ComponentPropsWithoutRef<"div"> & {
  isDemoMode?: boolean
}

const InputOTPGroup = React.forwardRef<
  React.ComponentRef<"div">,
  InputOTPGroupProps
>(({ className, isDemoMode, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center", className)} {...props} />
))
InputOTPGroup.displayName = "InputOTPGroup"

type InputOTPSlotProps = React.ComponentPropsWithoutRef<"div"> & {
  index: number
  isDemoMode?: boolean
}

const InputOTPSlot = React.forwardRef<
  React.ComponentRef<"div">,
  InputOTPSlotProps
>(({ index, className, isDemoMode, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index]

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
        isActive && "z-10 ring-2 ring-ring ring-offset-background",
        isDemoMode && "border-dashed border-muted-foreground/30",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className={cn(
            "h-4 w-px animate-caret-blink bg-foreground duration-1000",
            isDemoMode && "bg-muted-foreground"
          )} />
        </div>
      )}
    </div>
  )
})
InputOTPSlot.displayName = "InputOTPSlot"

type InputOTPSeparatorProps = React.ComponentPropsWithoutRef<"div"> & {
  isDemoMode?: boolean
}

const InputOTPSeparator = React.forwardRef<
  React.ComponentRef<"div">,
  InputOTPSeparatorProps
>(({ className, isDemoMode, ...props }, ref) => (
  <div ref={ref} role="separator" className={cn(
    isDemoMode && "text-muted-foreground/70",
    className
  )} {...props}>
    <Dot />
  </div>
))
InputOTPSeparator.displayName = "InputOTPSeparator"

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
