"use client"

import { useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

interface ShortcutAction {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  action: () => void
  description: string
}

export function useKeyboardShortcuts(shortcuts: ShortcutAction[], enabled = true, isDemoMode = false) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      // Don't trigger shortcuts when typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target instanceof HTMLElement && event.target.isContentEditable)
      ) {
        return
      }

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatch = shortcut.ctrlKey ? event.ctrlKey : !event.ctrlKey
        const shiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey
        const altMatch = shortcut.altKey ? event.altKey : !event.altKey
        const metaMatch = shortcut.metaKey ? event.metaKey : !event.metaKey

        if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
          event.preventDefault()
          shortcut.action()
          return
        }
      }
    },
    [shortcuts, enabled],
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  // Helper to show available shortcuts
  const showShortcutsHelp = useCallback(() => {
    const shortcutsList = shortcuts.map((s) => {
      const keys = []
      if (s.ctrlKey) keys.push("Ctrl")
      if (s.shiftKey) keys.push("Shift")
      if (s.altKey) keys.push("Alt")
      if (s.metaKey) keys.push("⌘")
      keys.push(s.key.toUpperCase())

      return `${keys.join(" + ")}: ${s.description}`
    })

    toast({
      title: "Keyboard Shortcuts",
      description: (
        <div className={`mt-2 space-y-1 ${isDemoMode ? "border border-dashed border-muted-foreground/30 rounded-md p-2" : ""}`}>
          {shortcutsList.map((shortcut, i) => (
            <div key={i} className="text-sm">
              {shortcut}
            </div>
          ))}
          {isDemoMode && (
            <div className="text-xs text-muted-foreground mt-2 italic">
              Demo mode: Shortcuts are simulated
            </div>
          )}
        </div>
      ),
      duration: 5000,
    })
  }, [shortcuts, isDemoMode])

  return { showShortcutsHelp }
}

export function useAppKeyboardShortcuts(isDemoMode = false) {
  const router = useRouter()

  const shortcuts: ShortcutAction[] = [
    {
      key: "d",
      ctrlKey: true,
      action: () => router.push("/dashboard"),
      description: "Go to Dashboard",
    },
    {
      key: "b",
      ctrlKey: true,
      action: () => router.push("/board/1"),
      description: "Go to Board",
    },
    {
      key: "t",
      ctrlKey: true,
      action: () => router.push("/tasks"),
      description: "Go to Tasks",
    },
    {
      key: "c",
      ctrlKey: true,
      action: () => router.push("/calendar"),
      description: "Go to Calendar",
    },
    {
      key: "n",
      ctrlKey: true,
      action: () => {
        toast({
          title: "Create New Task",
          description: "Opening new task dialog...",
        })
        // This would typically open a task creation dialog
      },
      description: "Create New Task",
    },
    {
      key: "?",
      action: () => {
        // This will be handled by the returned showShortcutsHelp function
      },
      description: "Show Keyboard Shortcuts",
    },
  ]

  const { showShortcutsHelp } = useKeyboardShortcuts(shortcuts, true, isDemoMode)

  // Add the help shortcut separately to avoid circular reference
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "?" && !event.ctrlKey && !event.altKey && !event.metaKey) {
        event.preventDefault()
        showShortcutsHelp()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [showShortcutsHelp])

  return { showShortcutsHelp }
}

