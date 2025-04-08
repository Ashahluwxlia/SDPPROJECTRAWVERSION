"use client"

import { useState } from "react"
import { CalendarIcon, ChevronLeft, ChevronRight, ExternalLink, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import type { Task } from "@/lib/types"
import { format, isSameDay, addMonths, subMonths } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CalendarIntegrationProps {
  tasks: Task[]
  onTaskClick: (taskId: string) => void
  isDemoMode?: boolean
}

export function CalendarIntegration({ tasks, onTaskClick, isDemoMode }: CalendarIntegrationProps) {
  const [date, setDate] = useState<Date>(new Date())
  const [view, setView] = useState<"month" | "day">("month")
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined)
  const [syncWithGoogle, setSyncWithGoogle] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncSuccess, setSyncSuccess] = useState(false)

  // Mock external calendar events
  const [externalEvents, setExternalEvents] = useState<
    {
      id: string
      title: string
      start: string
      end: string
      source: string
    }[]
  >([
    {
      id: "ext-1",
      title: "Team Meeting",
      start: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
      end: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(),
      source: "Google Calendar",
    },
    {
      id: "ext-2",
      title: "Product Demo",
      start: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
      end: new Date(new Date().setHours(15, 0, 0, 0)).toISOString(),
      source: "Google Calendar",
    },
  ])

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate)
      setSelectedDay(newDate)
      setView("day")
    }
  }

  const navigatePrevious = () => {
    setDate(subMonths(date, 1))
  }

  const navigateNext = () => {
    setDate(addMonths(date, 1))
  }

  const navigateToday = () => {
    setDate(new Date())
  }

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => task.dueDate && isSameDay(new Date(task.dueDate), date))
  }

  const getExternalEventsForDate = (date: Date) => {
    return externalEvents.filter((event) => isSameDay(new Date(event.start), date))
  }

  const getTasksForSelectedDay = () => {
    if (!selectedDay) return []
    return getTasksForDate(selectedDay)
  }

  const getExternalEventsForSelectedDay = () => {
    if (!selectedDay) return []
    return getExternalEventsForDate(selectedDay)
  }

  const handleSyncWithGoogle = () => {
    setSyncWithGoogle(!syncWithGoogle)

    if (!syncWithGoogle) {
      // Simulate syncing process
      setIsSyncing(true)
      setTimeout(() => {
        setIsSyncing(false)
        setSyncSuccess(true)
        setTimeout(() => setSyncSuccess(false), 3000)
      }, 1500)
    }
  }

  const handleManualSync = () => {
    setIsSyncing(true)
    setTimeout(() => {
      setIsSyncing(false)
      setSyncSuccess(true)
      setTimeout(() => setSyncSuccess(false), 3000)
    }, 1500)
  }

  // Function to highlight dates with tasks or events
  const getDayClassNames = (day: Date) => {
    const tasksForDay = getTasksForDate(day)
    const eventsForDay = syncWithGoogle ? getExternalEventsForDate(day) : []

    if (tasksForDay.length > 0 && eventsForDay.length > 0) {
      return "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 font-bold"
    } else if (tasksForDay.length > 0) {
      return "bg-primary/20 text-primary font-bold"
    } else if (eventsForDay.length > 0) {
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-bold"
    }

    return ""
  }

  return (
    <div className={`border rounded-md ${isDemoMode ? "border-dashed border-muted-foreground/30" : ""}`}>
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
          <span className="font-medium">{format(date, "MMMM yyyy")}</span>
        </div>
        <div>
          <Button variant={view === "month" ? "default" : "outline"} size="sm" onClick={() => setView("month")} isDemoMode={isDemoMode}>
            Month
          </Button>
          <Button
            variant={view === "day" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("day")}
            className="ml-2"
            isDemoMode={isDemoMode}
          >
            Day
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between p-2 px-4 bg-muted/30">
        <div className="flex items-center gap-2">
          <Switch id="google-calendar" checked={syncWithGoogle} onCheckedChange={handleSyncWithGoogle} isDemoMode={isDemoMode} />
          <Label htmlFor="google-calendar" className="text-sm" isDemoMode={isDemoMode}>
            Sync with Google Calendar
          </Label>
        </div>

        {syncWithGoogle && (
          <Button variant="ghost" size="sm" onClick={handleManualSync} disabled={isSyncing} isDemoMode={isDemoMode}>
            {isSyncing ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3 mr-1" /> Sync Now
              </>
            )}
          </Button>
        )}
      </div>

      {syncSuccess && (
        <Alert className={`m-2 bg-green-500/10 text-green-500 border-green-500/20 ${isDemoMode ? "border-dashed" : ""}`}>
          <AlertDescription>Successfully synchronized with Google Calendar.</AlertDescription>
        </Alert>
      )}

      <AnimatePresence mode="wait">
        {view === "month" ? (
          <motion.div
            key="month-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="p-4"
          >
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateChange}
              className={`rounded-md border ${isDemoMode ? "border-dashed border-muted-foreground/30" : ""}`}
              modifiers={{
                taskDay: (day) => {
                  const hasTask = getTasksForDate(day).length > 0
                  const hasEvent = syncWithGoogle && getExternalEventsForDate(day).length > 0
                  return hasTask || hasEvent
                },
              }}
              modifiersClassNames={{
                taskDay: "bg-primary/10 font-medium",
              }}
              components={{
                DayContent: ({ date: dayDate }) => (
                  <div className="relative">
                    <div>{dayDate.getDate()}</div>
                    {getTasksForDate(dayDate).length > 0 && (
                      <div className="absolute bottom-0 left-1/3 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                    )}
                    {syncWithGoogle && getExternalEventsForDate(dayDate).length > 0 && (
                      <div className="absolute bottom-0 left-2/3 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
                    )}
                  </div>
                ),
              }}
            />

            <div className="mt-4 flex justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span>TaskFlow Tasks</span>
              </div>
              {syncWithGoogle && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>Google Calendar</span>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="day-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="p-4"
          >
            <div className="mb-4">
              <h2 className="text-xl font-bold">
                {selectedDay ? format(selectedDay, "EEEE, MMMM d, yyyy") : "Select a day"}
              </h2>
            </div>

            {getTasksForSelectedDay().length === 0 && getExternalEventsForSelectedDay().length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                <p>No events scheduled for this day</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getTasksForSelectedDay().length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
                      TaskFlow Tasks
                    </h3>
                    <div className="space-y-2">
                      {getTasksForSelectedDay().map((task) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors ${isDemoMode ? "border-dashed border-muted-foreground/30" : ""}`}
                          onClick={() => onTaskClick(task.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">{task.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {task.status} • {task.priority}
                              </p>
                            </div>
                            {task.assignee && (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                                  {task.assignee.name.charAt(0)}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {syncWithGoogle && getExternalEventsForSelectedDay().length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                      Google Calendar
                    </h3>
                    <div className="space-y-2">
                      {getExternalEventsForSelectedDay().map((event) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-3 border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20 rounded-md ${isDemoMode ? "border-dashed" : ""}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium flex items-center">
                                {event.title}
                                <ExternalLink className="h-3 w-3 ml-1 text-muted-foreground" />
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(event.start), "h:mm a")} - {format(new Date(event.end), "h:mm a")}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

