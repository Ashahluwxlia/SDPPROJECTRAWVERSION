"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { CalendarIcon, ChevronLeft, ChevronRight, Plus, Filter, ExternalLink } from "lucide-react"
import { format, isSameDay, addMonths, subMonths } from "date-fns"

interface Event {
  id: string
  title: string
  date: Date
  duration: number
  type: string
  attendees: {
    name: string
    avatar: string
  }[]
}

interface CalendarViewProps {
  isDemoMode?: boolean
}

export function CalendarView({ isDemoMode }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [view, setView] = useState<"month" | "week" | "day">("month")
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date())
  const [syncWithGoogle, setSyncWithGoogle] = useState(true)

  // Sample events data
  const events: Event[] = [
    {
      id: "1",
      title: "Team Meeting",
      date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 10, 14, 0),
      duration: 60,
      type: "meeting",
      attendees: [
        { name: "Alex Johnson", avatar: "/placeholder.svg?height=100&width=100&text=AJ" },
        { name: "Sarah Williams", avatar: "/placeholder.svg?height=100&width=100&text=SW" },
        { name: "Michael Chen", avatar: "/placeholder.svg?height=100&width=100&text=MC" },
      ],
    },
    {
      id: "2",
      title: "Project Deadline",
      date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 15, 18, 0),
      duration: 0,
      type: "deadline",
      attendees: [],
    },
    {
      id: "3",
      title: "Design Review",
      date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 12, 10, 0),
      duration: 90,
      type: "meeting",
      attendees: [
        { name: "Sarah Williams", avatar: "/placeholder.svg?height=100&width=100&text=SW" },
        { name: "Emily Rodriguez", avatar: "/placeholder.svg?height=100&width=100&text=ER" },
      ],
    },
    {
      id: "4",
      title: "Client Call",
      date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 18, 15, 30),
      duration: 45,
      type: "call",
      attendees: [{ name: "Alex Johnson", avatar: "/placeholder.svg?height=100&width=100&text=AJ" }],
    },
    {
      id: "5",
      title: "Sprint Planning",
      date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 5, 9, 0),
      duration: 120,
      type: "meeting",
      attendees: [
        { name: "Alex Johnson", avatar: "/placeholder.svg?height=100&width=100&text=AJ" },
        { name: "Sarah Williams", avatar: "/placeholder.svg?height=100&width=100&text=SW" },
        { name: "Michael Chen", avatar: "/placeholder.svg?height=100&width=100&text=MC" },
        { name: "Emily Rodriguez", avatar: "/placeholder.svg?height=100&width=100&text=ER" },
      ],
    },
  ]

  // External calendar events (Google Calendar)
  const externalEvents = [
    {
      id: "ext-1",
      title: "Team Meeting",
      date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 20, 10, 0),
      duration: 60,
      type: "external",
      source: "Google Calendar",
    },
    {
      id: "ext-2",
      title: "Product Demo",
      date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 22, 14, 0),
      duration: 60,
      type: "external",
      source: "Google Calendar",
    },
  ]

  // Helper to check if a date has events
  const getEventsForDate = (date: Date) => {
    if (!date) return []
    return events.filter(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear(),
    )
  }

  // Helper to check if a date has external events
  const getExternalEventsForDate = (date: Date) => {
    if (!date || !syncWithGoogle) return []
    return externalEvents.filter(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear(),
    )
  }

  // Get events for selected day
  const getEventsForSelectedDay = () => {
    if (!selectedDay) return []
    return getEventsForDate(selectedDay)
  }

  // Get external events for selected day
  const getExternalEventsForSelectedDay = () => {
    if (!selectedDay) return []
    return getExternalEventsForDate(selectedDay)
  }

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const goToToday = () => {
    setCurrentMonth(new Date())
    setSelectedDay(new Date())
  }

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setSelectedDay(newDate)
      setView("day")
    }
  }

  // Get event type color
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "deadline":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      case "call":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "external":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <div className={isDemoMode ? "border border-dashed border-muted-foreground/30 rounded-md" : ""}>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousMonth} isDemoMode={isDemoMode}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-bold min-w-[200px] text-center">{format(currentMonth, "MMMM yyyy")}</h2>
          <Button variant="outline" size="icon" onClick={goToNextMonth} isDemoMode={isDemoMode}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={goToToday} isDemoMode={isDemoMode}>
            Today
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={view} onValueChange={(value: "month" | "week" | "day") => setView(value)}>
            <SelectTrigger className="w-[120px]" isDemoMode={isDemoMode}>
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent isDemoMode={isDemoMode}>
              <SelectItem value="month" isDemoMode={isDemoMode}>Month</SelectItem>
              <SelectItem value="week" isDemoMode={isDemoMode}>Week</SelectItem>
              <SelectItem value="day" isDemoMode={isDemoMode}>Day</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" className="gap-1" isDemoMode={isDemoMode}>
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </Button>

          <Button className="gap-1" isDemoMode={isDemoMode}>
            <Plus className="h-4 w-4" />
            <span>Add Event</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="md:col-span-2">
          {view === "month" ? (
            <motion.div
              key="month-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-7 gap-1">
                {/* Weekday headers */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                  <div key={index} className="text-center font-medium p-2 text-sm">
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {Array.from({ length: 42 }).map((_, index) => {
                  const date = new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth(),
                    index - new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() + 1,
                  )
                  const isCurrentMonth = date.getMonth() === currentMonth.getMonth()
                  const isToday = isSameDay(date, new Date())
                  const eventsForDay = getEventsForDate(date)
                  const externalEventsForDay = getExternalEventsForDate(date)
                  const hasEvents = eventsForDay.length > 0
                  const hasExternalEvents = externalEventsForDay.length > 0

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.01 }}
                      className={`min-h-[100px] border rounded-md p-1 ${
                        !isCurrentMonth
                          ? "bg-muted/20 text-muted-foreground"
                          : isToday
                            ? "bg-primary/5 border-primary"
                            : "hover:bg-muted/50"
                      } ${isDemoMode ? "border-dashed border-muted-foreground/30" : ""}`}
                      onClick={() => isCurrentMonth && handleDateChange(date)}
                    >
                      <div className="text-right text-sm font-medium p-1">{date.getDate()}</div>
                      <div className="space-y-1">
                        {hasEvents &&
                          eventsForDay.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className={`text-xs p-1 rounded truncate ${getEventTypeColor(event.type)}`}
                            >
                              {event.title}
                            </div>
                          ))}

                        {hasExternalEvents &&
                          externalEventsForDay.slice(0, 1).map((event) => (
                            <div
                              key={event.id}
                              className={`text-xs p-1 rounded truncate ${getEventTypeColor(event.type)}`}
                            >
                              {event.title}
                            </div>
                          ))}

                        {(eventsForDay.length > 2 || externalEventsForDay.length > 1) && (
                          <div className="text-xs text-center text-muted-foreground">
                            +
                            {eventsForDay.length +
                              externalEventsForDay.length -
                              (eventsForDay.length > 2 ? 2 : eventsForDay.length) -
                              (externalEventsForDay.length > 1 ? 1 : externalEventsForDay.length)}{" "}
                            more
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              <div className="mt-4 flex justify-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span>TaskTogether Events</span>
                </div>
                {syncWithGoogle && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
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
            >
              <div className="mb-4">
                <h2 className="text-xl font-bold">
                  {selectedDay ? format(selectedDay, "EEEE, MMMM d, yyyy") : "Select a day"}
                </h2>
              </div>

              {getEventsForSelectedDay().length === 0 && getExternalEventsForSelectedDay().length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                  <p>No events scheduled for this day</p>
                  <Button variant="outline" className="mt-4" isDemoMode={isDemoMode}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {getEventsForSelectedDay().length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-2 flex items-center">
                        <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
                        TaskTogether Events
                      </h3>
                      <div className="space-y-2">
                        {getEventsForSelectedDay().map((event) => (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors ${isDemoMode ? "border-dashed border-muted-foreground/30" : ""}`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium">{event.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {format(event.date, "h:mm a")}
                                  {event.duration > 0 && ` • ${event.duration} min`}
                                </p>
                              </div>
                              {event.attendees.length > 0 && (
                                <div className="flex -space-x-2">
                                  {event.attendees.slice(0, 3).map((attendee, i) => (
                                    <Avatar key={i} className="h-6 w-6 border-2 border-background">
                                      <AvatarImage src={attendee.avatar} alt={attendee.name} />
                                      <AvatarFallback className="text-[10px]">
                                        {attendee.name
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                                  {event.attendees.length > 3 && (
                                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs">
                                      +{event.attendees.length - 3}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {getExternalEventsForSelectedDay().length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-2 flex items-center">
                        <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                        Google Calendar
                      </h3>
                      <div className="space-y-2">
                        {getExternalEventsForSelectedDay().map((event) => (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-3 border border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-900/20 rounded-md ${isDemoMode ? "border-dashed" : ""}`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium flex items-center">
                                  {event.title}
                                  <ExternalLink className="h-3 w-3 ml-1 text-muted-foreground" />
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {format(event.date, "h:mm a")}
                                  {event.duration > 0 && ` • ${event.duration} min`}
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
        </div>

        {/* Sidebar */}
        <div>
          <div className={`border rounded-md overflow-hidden ${isDemoMode ? "border-dashed border-muted-foreground/30" : ""}`}>
            <div className="p-4 bg-muted/50">
              <h3 className="font-medium">Mini Calendar</h3>
            </div>
            <div className="p-3">
              <Calendar
                mode="single"
                selected={selectedDay}
                onSelect={handleDateChange}
                className={`rounded-md border ${isDemoMode ? "border-dashed border-muted-foreground/30" : ""}`}
                modifiers={{
                  hasEvent: (day) => {
                    const hasTaskEvent = getEventsForDate(day).length > 0
                    const hasGoogleEvent = getExternalEventsForDate(day).length > 0
                    return hasTaskEvent || hasGoogleEvent
                  },
                }}
                modifiersClassNames={{
                  hasEvent: "bg-primary/10 font-medium",
                }}
              />
            </div>
          </div>

          <div className={`border rounded-md overflow-hidden mt-4 ${isDemoMode ? "border-dashed border-muted-foreground/30" : ""}`}>
            <div className="p-4 bg-muted/50">
              <h3 className="font-medium">Upcoming Events</h3>
            </div>
            <div className="p-3">
              <div className="space-y-3">
                {events
                  .filter((event) => event.date >= new Date())
                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                  .slice(0, 3)
                  .map((event) => (
                    <div key={event.id} className={`flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 ${isDemoMode ? "border border-dashed border-muted-foreground/30" : ""}`}>
                      <div className="w-10 h-10 flex flex-col items-center justify-center bg-primary/10 rounded-md">
                        <span className="text-xs font-medium">{format(event.date, "MMM")}</span>
                        <span className="text-lg font-bold leading-none">{format(event.date, "d")}</span>
                      </div>
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{format(event.date, "h:mm a")}</p>
                      </div>
                    </div>
                  ))}

                {events.filter((event) => event.date >= new Date()).length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>No upcoming events</p>
                  </div>
                )}

                <Button variant="outline" className="w-full mt-2" isDemoMode={isDemoMode}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

