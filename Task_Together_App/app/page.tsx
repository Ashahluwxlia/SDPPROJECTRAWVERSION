"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Layout,
  Users,
  BarChart4,
  ChevronDown,
  Sparkles,
  MousePointer,
} from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { AnimatedBackground } from "@/components/auth/animated-background"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  const [activeFeature, setActiveFeature] = useState(0)
  const [showDemo, setShowDemo] = useState(false)
  const [demoStep, setDemoStep] = useState(0)
  const featuresRef = useRef<HTMLDivElement>(null)
  const demoRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: featuresRef,
    offset: ["start end", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [100, 0, 0, 100])

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Auto-advance demo steps
  useEffect(() => {
    if (showDemo) {
      const interval = setInterval(() => {
        setDemoStep((prev) => (prev < 3 ? prev + 1 : 0))
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [showDemo])

  const features = [
    {
      title: "Task Management",
      description: "Create, organize, and track tasks with ease. Assign priorities, due dates, and team members.",
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
      image: "/images/task-management.png",
    },
    {
      title: "Team Collaboration",
      description: "Work together seamlessly with real-time updates, comments, and shared workspaces.",
      icon: <Users className="h-8 w-8 text-primary" />,
      image: "/images/team-collaboration.png",
    },
    {
      title: "Progress Tracking",
      description: "Monitor project progress with visual dashboards, reports, and status updates.",
      icon: <BarChart4 className="h-8 w-8 text-primary" />,
      image: "/images/progress-tracking.png",
    },
    {
      title: "Time Management",
      description: "Stay on schedule with calendar integration, reminders, and time tracking features.",
      icon: <Clock className="h-8 w-8 text-primary" />,
      image: "/images/time-management.png",
    },
  ]

  const demoSteps = [
    {
      title: "Create a Task",
      description: "Click the + button to add a new task to your board",
      position: { top: "30%", left: "20%" },
    },
    {
      title: "Assign Team Members",
      description: "Add team members to collaborate on tasks",
      position: { top: "40%", right: "15%" },
    },
    {
      title: "Track Progress",
      description: "Drag tasks between columns to update their status",
      position: { bottom: "30%", left: "25%" },
    },
    {
      title: "View Analytics",
      description: "Check your team's performance with visual reports",
      position: { bottom: "25%", right: "20%" },
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Animated Background */}
      <AnimatedBackground density="high" speed="medium" interactive={true}>
        <header className="py-6 border-b border-white/10 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Layout className="h-8 w-8 text-white" />
                <h1 className="text-2xl font-bold text-white">TaskTogether</h1>
              </div>
              <div className="hidden md:flex gap-6 text-white/80">
                <Link href="/features" className="hover:text-white transition-colors">
                  Features
                </Link>
                <Link href="/testimonials" className="hover:text-white transition-colors">
                  Testimonials
                </Link>
                <Link href="/documentation" className="hover:text-white transition-colors">
                  Documentation
                </Link>
              </div>
              <div className="flex gap-4">
                <Link href="/login">
                  <Button variant="outline" className="bg-transparent text-white border-white/20 hover:bg-white/10">
                    Log in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-white text-primary hover:bg-white/90">Sign up</Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <section className="py-20 md:py-32 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm mb-6"
              >
                <Sparkles className="h-4 w-4" />
                <span>Introducing TaskTogether 1.0</span>
              </motion.div>

              <motion.h2
                className="text-4xl md:text-6xl font-bold mb-6 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Manage your tasks with{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">ease</span>
              </motion.h2>

              <motion.p
                className="text-xl mb-8 text-white/80"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                TaskTogether helps your team stay organized and manage projects efficiently with a visual, collaborative
                task management platform designed for modern teams.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Link href="/dashboard">
                  <Button size="lg" className="text-lg px-8 bg-white text-primary hover:bg-white/90 w-full sm:w-auto">
                    Try Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-lg px-8 border-white/20 text-white hover:bg-white/10 w-full sm:w-auto"
                  >
                    Sign Up Free
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Interactive Demo or Dashboard Preview */}
          <motion.div
            className="max-w-5xl mx-auto mt-16 relative px-4"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            ref={demoRef}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 rounded-xl"></div>
              <img
                src="/images/dashboard-preview.png"
                alt="TaskTogether Dashboard"
                className="w-full h-auto rounded-xl shadow-2xl border border-white/10"
              />

              {/* Interactive Demo Elements */}
              {showDemo && (
                <>
                  <motion.div
                    className="absolute"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={demoSteps[demoStep].position as any}
                  >
                    <motion.div
                      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 rounded-lg shadow-xl max-w-xs"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                      <h4 className="font-medium text-base flex items-center gap-2">
                        <Badge className="bg-primary text-white">{demoStep + 1}</Badge>
                        {demoSteps[demoStep].title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{demoSteps[demoStep].description}</p>
                    </motion.div>
                    <motion.div
                      className="absolute -left-6 -top-6"
                      animate={{
                        x: [0, 10, 0],
                        y: [0, -10, 0],
                        rotate: [0, 5, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                      }}
                    >
                      <MousePointer className="h-6 w-6 text-white drop-shadow-lg" />
                    </motion.div>
                  </motion.div>

                  {/* Demo step indicators */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {demoSteps.map((_, index) => (
                      <button
                        key={index}
                        className={`h-2 w-2 rounded-full transition-all duration-300 ${
                          demoStep === index ? "bg-white w-6" : "bg-white/50"
                        }`}
                        onClick={() => setDemoStep(index)}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Demo toggle button */}
              <button 
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-md text-sm backdrop-blur-sm"
                onClick={() => setShowDemo(!showDemo)}
              >
                {showDemo ? "Hide Demo" : "Show Demo"}
              </button>

              {/* Static Floating Elements (when not in demo mode) */}
              {!showDemo && (
                <>
                  {/* Notification */}
                  <motion.div
                    className="absolute top-10 right-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-3 rounded-lg shadow-xl max-w-xs"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Task Completed</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          Alex completed "Update homepage design"
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Task Card */}
                  <motion.div
                    className="absolute bottom-10 left-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 rounded-lg shadow-xl max-w-xs"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Website Redesign</h4>
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">In Progress</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>Due in 3 days</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Users className="h-3 w-3" />
                        <span>3 team members</span>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            <div className="flex flex-col items-center text-white/70">
              <span className="text-sm mb-2">Scroll to explore</span>
              <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}>
                <ChevronDown className="h-6 w-6" />
              </motion.div>
            </div>
          </motion.div>
        </section>
      </AnimatedBackground>

      {/* Feature Highlights */}
      <section ref={featuresRef} id="features" className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <motion.div className="text-center max-w-3xl mx-auto mb-16" style={{ opacity, y }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Comprehensive Feature Set</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Everything you need to manage tasks, collaborate with your team, and boost productivity in one powerful
              platform.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className={`feature-card p-6 rounded-xl cursor-pointer transition-all duration-300 ${
                    activeFeature === index
                      ? "bg-primary/5 border-l-4 border-primary shadow-md"
                      : "border border-transparent hover:bg-gray-50 dark:hover:bg-gray-900"
                  }`}
                  onClick={() => setActiveFeature(index)}
                  whileHover={{ x: 5 }}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-lg ${activeFeature === index ? "bg-primary/10" : "bg-gray-100 dark:bg-gray-800"}`}
                    >
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="relative h-[500px] bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-xl">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="absolute inset-0 flex items-center justify-center p-8"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{
                    opacity: activeFeature === index ? 1 : 0,
                    scale: activeFeature === index ? 1 : 0.9,
                    zIndex: activeFeature === index ? 10 : 0,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <img
                    src={feature.image || "/placeholder.svg"}
                    alt={feature.title}
                    className="max-w-full max-h-full rounded-lg shadow-lg"
                  />
                </motion.div>
              ))}

              {/* Feature indicator dots */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {features.map((_, index) => (
                  <button
                    key={index}
                    className={`h-2 w-2 rounded-full transition-all duration-300 ${
                      activeFeature === index ? "bg-primary w-6" : "bg-gray-400 dark:bg-gray-600"
                    }`}
                    onClick={() => setActiveFeature(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-20 bg-gradient-to-r from-primary/90 to-purple-600/90 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Ready to boost your team&apos;s productivity?
          </motion.h2>
          <motion.p
            className="text-xl max-w-2xl mx-auto mb-8 text-white/90"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Join thousands of teams who use TaskTogether to organize their work, collaborate effectively, and deliver
            projects on time.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/dashboard">
              <Button size="lg" className="px-8 bg-white text-primary hover:bg-white/90 w-full sm:w-auto">
                Try Dashboard <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="lg"
                variant="outline"
                className="px-8 border-white text-white hover:bg-white/10 w-full sm:w-auto"
              >
                Sign Up Free
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Layout className="h-6 w-6" />
              <span className="text-lg font-bold">TaskTogether</span>
            </div>
            <div className="flex flex-wrap gap-6 justify-center">
              <Link href="/features" className="text-sm text-gray-400 hover:text-white">
                Features
              </Link>
              <Link href="/testimonials" className="text-sm text-gray-400 hover:text-white">
                Testimonials
              </Link>
              <Link href="/documentation" className="text-sm text-gray-400 hover:text-white">
                Documentation
              </Link>
              <Link href="/login" className="text-sm text-gray-400 hover:text-white">
                Login
              </Link>
              <Link href="/register" className="text-sm text-gray-400 hover:text-white">
                Sign Up
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400">© {new Date().getFullYear()} TaskTogether. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

