"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Mention from "@tiptap/extension-mention"
import { Button } from "@/components/ui/button"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  LinkIcon,
  ImageIcon,
  Code,
  Heading1,
  Heading2,
  Undo,
  Redo,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
  className?: string
  mentions?: { id: string; name: string }[]
  onMentionSearch?: (query: string) => Promise<{ id: string; name: string }[]>
  isDemoMode?: boolean
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write something...",
  minHeight = "150px",
  className,
  mentions = [],
  onMentionSearch,
  isDemoMode,
}: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [mentionSuggestions, setMentionSuggestions] = useState(mentions)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-md max-w-full",
        },
      }),
      Mention.configure({
        HTMLAttributes: {
          class: "mention",
        },
        suggestion: {
          items: ({ query }) => {
            if (onMentionSearch) {
              onMentionSearch(query).then(setMentionSuggestions)
            }
            return mentionSuggestions
              .filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
              .slice(0, 5)
          },
          render: () => {
            let popup: HTMLElement | null = null
            let items: HTMLElement[] = []

            return {
              onStart: (props) => {
                popup = document.createElement("div")
                popup.classList.add("bg-popover", "rounded-md", "shadow-md", "p-1", "overflow-hidden")
                popup.style.position = "absolute"

                document.body.appendChild(popup)

                props.items.forEach((item, index) => {
                  const button = document.createElement("button")
                  button.classList.add(
                    "flex",
                    "items-center",
                    "w-full",
                    "text-left",
                    "px-2",
                    "py-1",
                    "text-sm",
                    "hover:bg-muted",
                    "rounded-sm",
                  )
                  button.textContent = item.name
                  button.addEventListener("click", () => {
                    props.command({ id: item.id, label: item.name })
                  })

                  popup?.appendChild(button)
                  items.push(button)
                })
              },
              onUpdate: (props) => {
                const { clientRect } = props

                if (popup && clientRect) {
                  const rect = typeof clientRect === 'function' ? clientRect() : clientRect
                  if (rect) {
                    popup.style.left = `${rect.left}px`
                    popup.style.top = `${rect.top + rect.height}px`
                  }
                }

                items.forEach((item, index) => {
                  const selectedIndex = (props as any).selectedIndex || 0
                  item.classList.toggle("bg-muted", index === selectedIndex)
                })
              },
              onKeyDown: (props) => {
                const typedProps = props as any
                const selectedIndex = typedProps.selectedIndex || 0
                const items = typedProps.items || []
                const command = typedProps.command

                if (props.event.key === "ArrowDown") {
                  props.event.preventDefault()
                  const index = selectedIndex >= items.length - 1 ? 0 : selectedIndex + 1
                  command({ selectedIndex: index })
                }

                if (props.event.key === "ArrowUp") {
                  props.event.preventDefault()
                  const index = selectedIndex <= 0 ? items.length - 1 : selectedIndex - 1
                  command({ selectedIndex: index })
                }

                if (props.event.key === "Enter") {
                  props.event.preventDefault()
                  const item = items[selectedIndex]
                  if (item) {
                    command({ id: item.id, label: item.name })
                  }
                }

                return false
              },
              onExit: () => {
                if (popup) {
                  document.body.removeChild(popup)
                  popup = null
                  items = []
                }
              },
            }
          },
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [editor, value])

  const handleLinkClick = () => {
    const url = window.prompt("URL", "https://")

    if (url) {
      editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
    }
  }

  const handleImageClick = () => {
    imageInputRef.current?.click()
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      const reader = new FileReader()

      reader.onload = (e) => {
        const result = e.target?.result

        if (result && typeof result === "string") {
          editor?.chain().focus().setImage({ src: result }).run()
        }
      }

      reader.readAsDataURL(file)
    }

    // Reset the input
    if (imageInputRef.current) {
      imageInputRef.current.value = ""
    }
  }

  if (!isMounted) {
    return null
  }

  return (
    <div className={cn("border rounded-md", className, isDemoMode ? "border-dashed border-muted-foreground/30" : "")}>
      <div className="flex flex-wrap gap-1 p-1 border-b bg-muted/50">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          data-active={editor?.isActive("bold") || undefined}
          isDemoMode={isDemoMode}
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          data-active={editor?.isActive("italic") || undefined}
          isDemoMode={isDemoMode}
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          data-active={editor?.isActive("heading", { level: 1 }) || undefined}
          isDemoMode={isDemoMode}
        >
          <Heading1 className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          data-active={editor?.isActive("heading", { level: 2 }) || undefined}
          isDemoMode={isDemoMode}
        >
          <Heading2 className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          data-active={editor?.isActive("bulletList") || undefined}
          isDemoMode={isDemoMode}
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          data-active={editor?.isActive("orderedList") || undefined}
          isDemoMode={isDemoMode}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          data-active={editor?.isActive("codeBlock") || undefined}
          isDemoMode={isDemoMode}
        >
          <Code className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleLinkClick}
          data-active={editor?.isActive("link") || undefined}
          isDemoMode={isDemoMode}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>

        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={handleImageClick} isDemoMode={isDemoMode}>
          <ImageIcon className="h-4 w-4" />
        </Button>

        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

        <div className="flex-1" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor?.chain().focus().undo().run()}
          disabled={!editor?.can().undo()}
          isDemoMode={isDemoMode}
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor?.chain().focus().redo().run()}
          disabled={!editor?.can().redo()}
          isDemoMode={isDemoMode}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <EditorContent
        editor={editor}
        className={`p-3 prose dark:prose-invert max-w-none focus:outline-none ${isDemoMode ? "border-t border-dashed border-muted-foreground/30" : ""}`}
        style={{ minHeight }}
      />
    </div>
  )
}

