"use client"

import { useState, useEffect } from "react"
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns"
import type { Task } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar, List } from "lucide-react"
import { motion } from "framer-motion"

interface GanttChartProps {
  tasks: Task[]
  onTaskClick: (taskId: string) => void
  isDemoMode?: boolean
}

export function GanttChart({ tasks, onTaskClick, isDemoMode }: GanttChartProps) {
  const [startDate, setStartDate] = useState(startOfWeek(new Date()))
  const [endDate, setEndDate] = useState(endOfWeek(new Date()))
  const [days, setDays] = useState<Date[]>([])

  useEffect(() => {
    setDays(eachDayOfInterval({ start: startDate, end: endDate }))
  }, [startDate, endDate])

  const navigatePrevious = () => {
    setStartDate(addDays(startDate, -7))
    setEndDate(addDays(endDate, -7))
  }

  const navigateNext = () => {
    setStartDate(addDays(startDate, 7))
    setEndDate(addDays(endDate, 7))
  }

  const navigateToday = () => {
    setStartDate(startOfWeek(new Date()))
    setEndDate(endOfWeek(new Date()))
  }

  const getTaskPosition = (task: Task) => {
    if (!task.dueDate) return { left: "0%", width: "0%" }

    const taskDate = new Date(task.dueDate)
    const dayIndex = days.findIndex((day) => isSameDay(day, taskDate))

    if (dayIndex === -1) return { left: "0%", width: "0%" }

    return {
      left: `${(dayIndex / days.length) * 100}%`,
      width: `${(1 / days.length) * 100}%`,
    }
  }

  const getTaskColor = (task: Task) => {
    switch (task.priority) {
      case "Critical":
        return "bg-purple-500"
      case "High":
        return "bg-red-500"
      case "Medium":
        return "bg-amber-500"
      case "Low":
        return "bg-green-500"
      default:
        return "bg-blue-500"
    }
  }

  return (
    <div className={`gantt-container border rounded-md ${isDemoMode ? "border-dashed border-muted-foreground/30" : ""}`}>
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={navigatePrevious} isDemoMode={isDemoMode}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={navigateNext} isDemoMode={isDemoMode}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={navigateToday} isDemoMode={isDemoMode}>
            Today
          </Button>
        </div>
        <div>
          <span className="font-medium">
            {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" isDemoMode={isDemoMode}>
            <Calendar className="h-4 w-4 mr-2" /> Month
          </Button>
          <Button variant="outline" size="sm" isDemoMode={isDemoMode}>
            <List className="h-4 w-4 mr-2" /> List
          </Button>
        </div>
      </div>

      <div className="gantt-header">
        <div className={`w-64 p-2 border-r font-medium ${isDemoMode ? "border-dashed border-muted-foreground/30" : ""}`}>Task</div>
        {days.map((day, index) => (
          <div
            key={index}
            className={`flex-1 p-2 text-center text-sm border-r ${isSameDay(day, new Date()) ? "bg-primary/10" : ""} ${isDemoMode ? "border-dashed border-muted-foreground/30" : ""}`}
          >
            <div className="font-medium">{format(day, "EEE")}</div>
            <div className="text-xs text-muted-foreground">{format(day, "MMM d")}</div>
          </div>
        ))}
      </div>

      <div className="relative">
        {tasks.map((task) => (
          <div key={task.id} className="gantt-row">
            <div className={`w-64 p-2 border-r truncate ${isDemoMode ? "border-dashed border-muted-foreground/30" : ""}`}>
              <div className="font-medium">{task.title}</div>
              <div className="text-xs text-muted-foreground">
                {task.status || "To-Do"}
                {task.assignee && ` • ${task.assignee.name}`}
              </div>
            </div>

            <div className="flex-1 relative h-16">
              {task.dueDate && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`gantt-task ${getTaskColor(task)} ${isDemoMode ? "border-dashed border-muted-foreground/30" : ""}`}
                  style={getTaskPosition(task)}
                  onClick={() => onTaskClick(task.id)}
                >
                  {task.title}
                </motion.div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

