"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { useSession } from "next-auth/react"

interface AnimatedBackgroundProps {
  children: React.ReactNode
  density?: "low" | "medium" | "high"
  speed?: "slow" | "medium" | "fast"
  interactive?: boolean
  isDemoMode?: boolean
}

export function AnimatedBackground({
  children,
  density = "medium",
  speed = "medium",
  interactive = true,
  isDemoMode = false,
}: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Store canvas dimensions
    const canvasWidth = canvas.width
    const canvasHeight = canvas.height

    // Determine particle count based on density and screen size
    const getParticleCount = () => {
      const baseCount = window.innerWidth / 30
      const densityMultiplier = density === "low" ? 0.5 : density === "high" ? 2 : 1
      
      // Adjust particle count for demo mode
      const demoMultiplier = isDemoMode && !session?.user ? 0.7 : 1
      
      return Math.min(100, Math.floor(baseCount * densityMultiplier * demoMultiplier))
    }

    // Determine speed multiplier
    const getSpeedMultiplier = () => {
      return speed === "slow" ? 0.5 : speed === "fast" ? 2 : 1
    }

    // Create particles
    const particlesArray: Particle[] = []
    const numberOfParticles = getParticleCount()
    const speedMultiplier = getSpeedMultiplier()

    class Particle {
      x: number
      y: number
      size: number
      baseSize: number
      speedX: number
      speedY: number
      opacity: number
      color: string
      originalX: number
      originalY: number
      canvasWidth: number
      canvasHeight: number

      constructor(canvasWidth: number, canvasHeight: number) {
        this.canvasWidth = canvasWidth
        this.canvasHeight = canvasHeight
        this.x = Math.random() * this.canvasWidth
        this.y = Math.random() * this.canvasHeight
        this.originalX = this.x
        this.originalY = this.y
        this.baseSize = Math.random() * 4 + 1
        this.size = this.baseSize
        this.speedX = (Math.random() * 1 - 0.5) * speedMultiplier
        this.speedY = (Math.random() * 1 - 0.5) * speedMultiplier
        this.opacity = Math.random() * 0.5 + 0.1

        // Create a gradient of colors from primary to purple
        const hue = Math.random() * 60 + 240 // Blue to purple range
        this.color = `hsla(${hue}, 80%, 70%, ${this.opacity})`
      }

      update(mouseX: number, mouseY: number, isHovering: boolean) {
        // Normal movement
        this.x += this.speedX
        this.y += this.speedY

        // Wrap around edges
        if (this.x > this.canvasWidth) this.x = 0
        else if (this.x < 0) this.x = this.canvasWidth
        if (this.y > this.canvasHeight) this.y = 0
        else if (this.y < 0) this.y = this.canvasHeight

        // Interactive behavior when mouse is active
        if (interactive && isHovering) {
          const dx = mouseX - this.x
          const dy = mouseY - this.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const maxDistance = 150

          if (distance < maxDistance) {
            // Particles move away from mouse
            const force = (maxDistance - distance) / maxDistance
            this.x -= dx * force * 0.05
            this.y -= dy * force * 0.05

            // Particles grow slightly when affected by mouse
            this.size = this.baseSize * (1 + force * 0.5)
          } else {
            // Return to original size
            this.size = this.baseSize
          }
        } else {
          this.size = this.baseSize
        }
      }

      draw() {
        if (!ctx) return
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.closePath()
        ctx.fill()
      }
    }

    function init() {
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle(canvasWidth, canvasHeight))
      }
    }

    function animate() {
      if (!ctx) return
      
      // Use the first particle's dimensions if available, otherwise use stored dimensions
      const width = particlesArray.length > 0 ? particlesArray[0].canvasWidth : canvasWidth
      const height = particlesArray.length > 0 ? particlesArray[0].canvasHeight : canvasHeight
      
      ctx.clearRect(0, 0, width, height)

      // Draw connections
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          const dx = particlesArray[a].x - particlesArray[b].x
          const dy = particlesArray[a].y - particlesArray[b].y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const maxDistance = 120

          if (distance < maxDistance) {
            const opacity = 1 - distance / maxDistance
            // Create gradient connections
            const gradient = ctx.createLinearGradient(
              particlesArray[a].x,
              particlesArray[a].y,
              particlesArray[b].x,
              particlesArray[b].y,
            )
            gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.2})`)
            gradient.addColorStop(1, `rgba(180, 180, 255, ${opacity * 0.2})`)

            ctx.strokeStyle = gradient
            ctx.lineWidth = opacity * 1.5
            ctx.beginPath()
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y)
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y)
            ctx.stroke()
          }
        }
      }

      // Update and draw particles
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update(mousePosition.x, mousePosition.y, isHovering)
        particlesArray[i].draw()
      }

      requestAnimationFrame(animate)
    }

    // Mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      setIsHovering(true)
    }

    const handleMouseLeave = () => {
      setIsHovering(false)
    }

    if (interactive) {
      canvas.addEventListener("mousemove", handleMouseMove)
      canvas.addEventListener("mouseleave", handleMouseLeave)
    }

    init()
    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (interactive) {
        canvas.removeEventListener("mousemove", handleMouseMove)
        canvas.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [density, speed, interactive, mousePosition, isHovering, session, isDemoMode])

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-primary to-purple-700 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        {children}
      </motion.div>
      {isDemoMode && !session?.user && (
        <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full z-20">
          Demo Mode
        </div>
      )}
    </div>
  )
}

