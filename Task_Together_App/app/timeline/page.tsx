"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, Clock, Filter, Search, Plus, MoreHorizontal, CheckCircle2, AlertCircle, Clock4 } from "lucide-react"
import { motion } from "framer-motion"
import { format, addDays, subDays, isSameDay } from "date-fns"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BoardNavigation } from "@/components/board/board-navigation"

// Mock data for timeline
const TASKS = [
  {
    id: "task-1",
    title: "Research competitors",
    description: "Analyze top 5 competitors and their features",
    status: "To Do",
    priority: "High",
    dueDate: addDays(new Date(), 3).toISOString(),
    startDate: new Date().toISOString(),
    assignee: {
      id: "user-1",
      name: "John Doe",
      avatar: "/images/avatar-1.jpg",
    },
    board: {
      id: "board-1",
      name: "Product Development",
    },
    progress: 0,
  },
  {
    id: "task-2",
    title: "Create wireframes",
    description: "Design initial wireframes for the main pages",
    status: "In Progress",
    priority: "Medium",
    dueDate: addDays(new Date(), 5).toISOString(),
    startDate: subDays(new Date(), 2).toISOString(),
    assignee: {
      id: "user-2",
      name: "Jane Smith",
      avatar: "/images/avatar-2.jpg",
    },
    board: {
      id: "board-1",
      name: "Product Development",
    },
    progress: 40,
  },
  {
    id: "task-3",
    title: "Implement authentication",
    description: "Set up user authentication with NextAuth.js",
    status: "Review",
    priority: "High",
    dueDate: addDays(new Date(), 2).toISOString(),
    startDate: subDays(new Date(), 3).toISOString(),
    assignee: {
      id: "user-1",
      name: "John Doe",
      avatar: "/images/avatar-1.jpg",
    },
    board: {
      id: "board-1",
      name: "Product Development",
    },
    progress: 80,
  },
  {
    id: "task-4",
    title: "Review homepage design",
    description: "Review and provide feedback on the homepage design",
    status: "To Do",
    priority: "Medium",
    dueDate: addDays(new Date(), 1).toISOString(),
    startDate: addDays(new Date(), 0).toISOString(),
    assignee: {
      id: "user-1",
      name: "John Doe",
      avatar: "/images/avatar-1.jpg",
    },
    board: {
      id: "board-2",
      name: "Website Redesign",
    },
    progress: 0,
  },
  {
    id: "task-5",
    title: "Set up project repository",
    description: "Create GitHub repository and set up initial project structure",
    status: "Done",
    priority: "Low",
    dueDate: subDays(new Date(), 2).toISOString(),
    startDate: subDays(new Date(), 5).toISOString(),
    assignee: {
      id: "user-3",
      name: "Alex Johnson",
      avatar: "/images/avatar-3.jpg",
    },
    board: {
      id: "board-3",
      name: "Mobile App Development",
    },
    progress: 100,
  },
  {
    id: "task-6",
    title: "Design system implementation",
    description: "Implement the design system components",
    status: "In Progress",
    priority: "High",
    dueDate: addDays(new Date(), 7).toISOString(),
    startDate: subDays(new Date(), 1).toISOString(),
    assignee: {
      id: "user-2",
      name: "Jane Smith",
      avatar: "/images/avatar-2.jpg",
    },
    board: {
      id: "board-2",
      name: "Website Redesign",
    },
    progress: 30,
  },
  {
    id: "task-7",
    title: "API documentation",
    description: "Create comprehensive API documentation",
    status: "To Do",
    priority: "Medium",
    dueDate: addDays(new Date(), 10).toISOString(),
    startDate: addDays(new Date(), 2).toISOString(),
    assignee: {
      id: "user-3",
      name: "Alex Johnson",
      avatar: "/images/avatar-3.jpg",
    },
    board: {
      id: "board-1",
      name: "Product Development",
    },
    progress: 0,
  },
]

// Mock milestones
const MILESTONES = [
  {
    id: "milestone-1",
    title: "Alpha Release",
    description: "First internal release for testing",
    dueDate: addDays(new Date(), 14).toISOString(),
    board: {
      id: "board-1",
      name: "Product Development",
    },
    status: "upcoming",
  },
  {
    id: "milestone-2",
    title: "Beta Launch",
    description: "Public beta release",
    dueDate: addDays(new Date(), 30).toISOString(),
    board: {
      id: "board-1",
      name: "Product Development",
    },
    status: "upcoming",
  },
  {
    id: "milestone-3",
    title: "Design System Complete",
    description: "Finalize all design components",
    dueDate: addDays(new Date(), 7).toISOString(),
    board: {
      id: "board-2",
      name: "Website Redesign",
    },
    status: "at-risk",
  },
]

interface Task {
  startDate: string | undefined;
  dueDate: string;
}

interface TimelineItem {
  id: string;
  title: string;
  description: string;
  status: "To Do" | "In Progress" | "Review" | "Done" | "upcoming" | "at-risk" | "completed";
  dueDate: string;
  board: { id: string; name: string };
  priority?: string;
  startDate?: string;
  assignee?: { id: string; name: string; avatar: string };
  progress?: number;
  isMilestone?: boolean;
}

export default function TimelinePage() {
  const [view, setView] = useState("gantt")
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [tasks, setTasks] = useState<TimelineItem[]>(TASKS as TimelineItem[])
  const [milestones, setMilestones] = useState<TimelineItem[]>(MILESTONES as TimelineItem[])
  const [timeRange, setTimeRange] = useState("2-weeks")

  // Filter tasks based on search query and filter
  useEffect(() => {
    const filteredTasks = TASKS.filter((task) => {
      const matchesSearch =
        searchQuery === "" ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesFilter =
        filter === "all" ||
        (filter === "my-tasks" && task.assignee?.id === "user-1") ||
        (filter === "upcoming" && new Date(task.dueDate) > new Date()) ||
        (filter === "overdue" && new Date(task.dueDate) < new Date() && task.status !== "Done")

      return matchesSearch && matchesFilter
    })

    setTasks(filteredTasks as TimelineItem[])
  }, [searchQuery, filter])

  const getPriorityColor = (priority: "High" | "Medium" | "Low") => {
    switch (priority) {
      case "High":
        return "text-red-500 bg-red-100 dark:bg-red-900/30 dark:text-red-300"
      case "Medium":
        return "text-amber-500 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300"
      case "Low":
        return "text-green-500 bg-green-100 dark:bg-green-900/30 dark:text-green-300"
      default:
        return "text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getStatusColor = (status: "Done" | "Review" | "In Progress" | "To Do") => {
    switch (status) {
      case "Done":
        return "text-green-500 bg-green-100 dark:bg-green-900/30 dark:text-green-300"
      case "Review":
        return "text-purple-500 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300"
      case "In Progress":
        return "text-blue-500 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300"
      default:
        return "text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getMilestoneStatusColor = (status: "completed" | "at-risk" | "upcoming") => {
    switch (status) {
      case "completed":
        return "text-green-500 bg-green-100 dark:bg-green-900/30 dark:text-green-300"
      case "at-risk":
        return "text-red-500 bg-red-100 dark:bg-red-900/30 dark:text-red-300"
      case "upcoming":
        return "text-blue-500 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300"
      default:
        return "text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  // Generate dates for the timeline
  const generateTimelineDates = () => {
    const dates = []
    const today = new Date()
    let daysToShow = 14

    if (timeRange === "1-week") {
      daysToShow = 7
    } else if (timeRange === "1-month") {
      daysToShow = 30
    } else if (timeRange === "3-months") {
      daysToShow = 90
    }

    for (let i = 0; i < daysToShow; i++) {
      dates.push(addDays(today, i))
    }
    return dates
  }

  const timelineDates = generateTimelineDates()

  // Calculate task position and width for Gantt chart
  const getTaskPosition = (task: TimelineItem) => {
    const startDate = task.startDate ? new Date(task.startDate) : new Date();
    const dueDate = new Date(task.dueDate);
    const today = new Date();

    // Calculate days from today
    const daysFromToday = Math.floor((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate task duration in days
    const duration = Math.max(1, Math.ceil((dueDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Calculate left position (percentage)
    const leftPosition = Math.max(0, (daysFromToday / timelineDates.length) * 100);

    // Calculate width (percentage)
    const widthPercentage = Math.min(100 - leftPosition, (duration / timelineDates.length) * 100);

    return {
      left: `${leftPosition}%`,
      width: `${widthPercentage}%`,
    };
  }

  return (
    <div className="p-6">
      <BoardNavigation />

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Timeline</h1>
        <p className="text-muted-foreground">Visualize your project schedule and track progress</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter tasks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="my-tasks">My Tasks</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-week">1 Week</SelectItem>
              <SelectItem value="2-weeks">2 Weeks</SelectItem>
              <SelectItem value="1-month">1 Month</SelectItem>
              <SelectItem value="3-months">3 Months</SelectItem>
            </SelectContent>
          </Select>

          <Button>
            <Plus className="h-4 w-4 mr-2" /> Add Task
          </Button>
        </div>
      </div>

      <Tabs defaultValue="gantt" value={view} onValueChange={setView} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="gantt">Gantt Chart</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="gantt">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Gantt Chart</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-muted">
                  {tasks.length} tasks
                </Badge>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Timeline header */}
                  <div className="flex border-b mb-4">
                    <div className="w-1/4 p-2 font-medium">Task</div>
                    <div className="w-3/4 flex">
                      {timelineDates.map((date, index) => (
                        <div
                          key={index}
                          className={`flex-1 p-2 text-center text-xs border-l ${
                            isSameDay(date, new Date()) ? "bg-primary/10 font-medium" : ""
                          }`}
                        >
                          {format(date, "MMM d")}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Milestones */}
                  <div className="mb-6">
                    <div className="font-medium mb-2 text-sm">Milestones</div>
                    {milestones.map((milestone) => {
                      const milestoneDate = new Date(milestone.dueDate)
                      const daysFromToday = Math.floor((milestoneDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                      const leftPosition = Math.max(0, Math.min(100, (daysFromToday / timelineDates.length) * 100))

                      return (
                        <div key={milestone.id} className="relative h-10 mb-2">
                          <div className="absolute top-0 left-1/4 w-3/4 h-full">
                            <div
                              className="absolute top-0 h-full border-l-2 border-dashed flex flex-col items-center"
                              style={{ left: `${leftPosition}%` }}
                            >
                              <div
                                className={`px-2 py-1 rounded-md text-xs ${getMilestoneStatusColor(milestone.status as "upcoming" | "at-risk" | "completed")}`}
                              >
                                {milestone.title}
                              </div>
                              <div className="mt-1 text-xs text-muted-foreground">{format(milestoneDate, "MMM d")}</div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Tasks */}
                  {tasks.map((task) => (
                    <div key={task.id} className="flex mb-4">
                      <div className="w-1/4 p-2">
                        <div className="font-medium">{task.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={task.assignee?.avatar} alt={task.assignee?.name} />
                            <AvatarFallback>
                              {task.assignee?.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">{task.assignee?.name}</span>
                        </div>
                      </div>
                      <div className="w-3/4 relative">
                        <div className="absolute inset-y-0 left-0 w-full bg-gray-100 dark:bg-gray-800/30 rounded-md"></div>
                        <motion.div
                          className={`absolute top-1 bottom-1 rounded-md ${
                            task.status === "Done"
                              ? "bg-green-200 dark:bg-green-900/50"
                              : task.status === "In Progress"
                                ? "bg-blue-200 dark:bg-blue-900/50"
                                : "bg-gray-200 dark:bg-gray-700/50"
                          }`}
                          style={getTaskPosition(task)}
                          initial={{ width: 0 }}
                          animate={{ width: getTaskPosition(task).width }}
                          transition={{ duration: 0.5 }}
                        >
                          <div className="px-2 py-1 text-xs font-medium truncate">{task.title}</div>
                          <div className="absolute bottom-1 left-2 right-2 h-1 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${task.progress}%` }}></div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Timeline View</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="relative pl-8 border-l-2 border-gray-200 dark:border-gray-800">
                  {/* Today marker */}
                  <div className="absolute left-0 top-0 -translate-x-1/2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                    Today
                  </div>

                  {/* Timeline items */}
                  {[...tasks, ...milestones.map((m) => ({ ...m, isMilestone: true }))]
                    .sort((a, b) => {
                      const dateA = new Date(a.dueDate)
                      const dateB = new Date(b.dueDate)
                      return dateA.getTime() - dateB.getTime()
                    })
                    .map((item, index) => (
                      <div key={item.id} className="mb-8">
                        <div className="absolute left-0 top-3 w-4 h-4 rounded-full bg-white border-4 border-primary -translate-x-1/2"></div>
                        <div className="mb-1 text-sm text-muted-foreground">
                          {format(new Date(item.dueDate), "MMM d, yyyy")}
                        </div>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={`p-4 rounded-lg border ${
                            item.isMilestone ? "bg-primary/5 border-primary/20" : "bg-card"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                {item.isMilestone ? (
                                  <Badge className={getMilestoneStatusColor(item.status as "upcoming" | "at-risk" | "completed")}>Milestone</Badge>
                                ) : (
                                  <Badge className={getStatusColor(item.status as "To Do" | "In Progress" | "Review" | "Done")}>{item.status}</Badge>
                                )}
                                {!item.isMilestone && (
                                  <Badge className={getPriorityColor(item.priority as "High" | "Medium" | "Low")}>{item.priority}</Badge>
                                )}
                              </div>
                              <h3 className="text-lg font-medium mt-1">{item.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                            </div>

                            {!item.isMilestone && (
                              <div className="flex items-center">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={item.assignee?.avatar} alt={item.assignee?.name} />
                                  <AvatarFallback>
                                    {item.assignee?.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                            )}
                          </div>

                          {!item.isMilestone && (
                            <div className="mt-4">
                              <div className="text-xs text-muted-foreground mb-1">Progress</div>
                              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${item.progress}%` }}></div>
                              </div>
                            </div>
                          )}

                          <div className="mt-4 flex items-center justify-between">
                            <div className="text-sm">
                              <span className="text-muted-foreground">Board: </span>
                              {item.board.name}
                            </div>

                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">Calendar view is available in the Calendar tab</h3>
                <p className="text-muted-foreground">Switch to the Calendar tab for a full calendar view</p>
                <Button className="mt-4" asChild>
                  <a href="/calendar">Go to Calendar</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Task summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Clock4 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-sm font-medium">In Progress</div>
                <div className="text-2xl font-bold">{tasks.filter((t) => t.status === "In Progress").length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <div className="text-sm font-medium">Upcoming Deadlines</div>
                <div className="text-2xl font-bold">
                  {
                    tasks.filter((t) => {
                      const dueDate = new Date(t.dueDate)
                      const today = new Date()
                      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                      return diffDays > 0 && diffDays <= 3 && t.status !== "Done"
                    }).length
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                <Clock className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <div className="text-sm font-medium">Overdue</div>
                <div className="text-2xl font-bold">
                  {
                    tasks.filter((t) => {
                      const dueDate = new Date(t.dueDate)
                      const today = new Date()
                      return dueDate < today && t.status !== "Done"
                    }).length
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-sm font-medium">Completed</div>
                <div className="text-2xl font-bold">{tasks.filter((t) => t.status === "Done").length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

