"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

type ToasterProps = {
  isDemoMode?: boolean
}

export function Toaster({ isDemoMode }: ToasterProps) {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} isDemoMode={isDemoMode} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle isDemoMode={isDemoMode}>{title}</ToastTitle>}
              {description && (
                <ToastDescription isDemoMode={isDemoMode}>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose isDemoMode={isDemoMode} />
          </Toast>
        )
      })}
      <ToastViewport isDemoMode={isDemoMode} />
    </ToastProvider>
  )
}
