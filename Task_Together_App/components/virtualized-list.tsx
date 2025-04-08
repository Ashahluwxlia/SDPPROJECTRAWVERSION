"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"

interface VirtualizedListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  itemHeight?: number
  overscan?: number
  className?: string
  onEndReached?: () => void
  endReachedThreshold?: number
  isDemoMode?: boolean
}

export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight = 50,
  overscan = 10,
  className = "",
  onEndReached,
  endReachedThreshold = 0.8,
  isDemoMode,
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  // Update size on resize
  useEffect(() => {
    if (!parentRef.current) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })

    observer.observe(parentRef.current)
    return () => observer.disconnect()
  }, [])

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan,
  })

  // Handle end reached for infinite loading
  useEffect(() => {
    if (!onEndReached || !parentRef.current) return

    const scrollElement = parentRef.current
    const handleScroll = () => {
      if (!scrollElement) return

      const scrollTop = scrollElement.scrollTop
      const scrollHeight = scrollElement.scrollHeight
      const clientHeight = scrollElement.clientHeight

      // Check if we've scrolled to the threshold
      if (scrollTop + clientHeight >= scrollHeight * endReachedThreshold) {
        onEndReached()
      }
    }

    scrollElement.addEventListener("scroll", handleScroll)
    return () => scrollElement.removeEventListener("scroll", handleScroll)
  }, [onEndReached, endReachedThreshold])

  return (
    <div 
      ref={parentRef} 
      className={`overflow-auto ${className} ${isDemoMode ? "border border-dashed border-muted-foreground/30 rounded-md" : ""}`} 
      style={{ height: "100%", width: "100%" }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  )
}

