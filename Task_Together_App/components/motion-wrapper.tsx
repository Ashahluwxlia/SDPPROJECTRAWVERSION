"use client"

import { motion, AnimatePresence } from "framer-motion"
import type { ReactNode } from "react"

interface MotionWrapperProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  type?: "fade" | "slide" | "scale" | "none"
  isDemoMode?: boolean
}

export function MotionWrapper({ children, className, delay = 0, duration = 0.5, type = "fade", isDemoMode }: MotionWrapperProps) {
  const variants = {
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    slide: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.9 },
      visible: { opacity: 1, scale: 1 },
    },
    none: {
      hidden: {},
      visible: {},
    },
  }

  return (
    <motion.div
      className={`${className || ""} ${isDemoMode ? "border border-dashed border-muted-foreground/30 rounded-md" : ""}`}
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={variants[type]}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}

interface MotionPageProps {
  children: ReactNode
  isDemoMode?: boolean
}

export function MotionPage({ children, isDemoMode }: MotionPageProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className={`min-h-screen ${isDemoMode ? "border border-dashed border-muted-foreground/30 rounded-md" : ""}`}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

