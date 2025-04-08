"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, CheckCircle, Clock, Filter, Plus, Search } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

// Simulated tasks data
const TASKS = [
  {
    id: "task-1",
    title: "Research competitors",
    description: "Analyze top 5 competitors and their features",
    status: "To Do",
    priority: "High",
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    assignee: {
      id: "user-1",
      name: "John Doe",
      avatar: "/placeholder.svg?height=100&width=100&text=JD",
    },
    board: {
      id: "board-1",
      name: "Product Development",
    },
  },
  {
    id: "task-2",
    title: "Create wireframes",
    description: "Design initial wireframes for the main pages",
    status: "In Progress",
    priority: "Medium",
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    assignee: {
      id: "user-2",
      name: "Jane Smith",
      avatar: "/placeholder.svg?height=100&width=100&text=JS",
    },
    board: {
      id: "board-1",
      name: "Product Development",
    },
  },
  {
    id: "task-3",
    title: "Implement authentication",
    description: "Set up user authentication with NextAuth.js",
    status: "Review",
    priority: "High",
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    assignee: {
      id: "user-1",
      name: "John Doe",
      avatar: "/placeholder.svg?height=100&width=100&text=JD",
    },
    board: {
      id: "board-1",
      name: "Product Development",
    },
  },
  {
    id: "task-4",
    title: "Review homepage design",
    description: "Review and provide feedback on the homepage design",
    status: "To Do",
    priority: "Medium",
    dueDate: new Date(Date.now() + 86400000 * 1).toISOString(),
    assignee: {
      id: "user-1",
      name: "John Doe",
      avatar: "/placeholder.svg?height=100&width=100&text=JD",
    },
    board: {
      id: "board-2",
      name: "Website Redesign",
    },
  },
  {
    id: "task-5",
    title: "Set up project repository",
    description: "Create GitHub repository and set up initial project structure",
    status: "Done",
    priority: "Low",
    dueDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    assignee: {
      id: "user-3",
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=100&width=100&text=AJ",
    },
    board: {
      id: "board-3",
      name: "Mobile App Development",
    },
  },
]

export default function TasksPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [filterPriority, setFilterPriority] = useState<string | null>(null)
  const [tasks, setTasks] = useState(TASKS)
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])

  // Simulate loading data
  useEffect(() => {
    // Filter tasks based on search query, status, and priority
    const filteredTasks = TASKS.filter((task) => {
      const matchesSearch =
        searchQuery === "" ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = filterStatus === null || task.status === filterStatus
      const matchesPriority = filterPriority === null || task.priority === filterPriority

      return matchesSearch && matchesStatus && matchesPriority
    })

    setTasks(filteredTasks)
  }, [searchQuery, filterStatus, filterPriority])

  const handleMarkAsDone = (taskId: string) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: "Done" } : task)))
  }

  const toggleTaskSelection = (taskId: string) => {
    if (selectedTasks.includes(taskId)) {
      setSelectedTasks(selectedTasks.filter((id) => id !== taskId))
    } else {
      setSelectedTasks([...selectedTasks, taskId])
    }
  }

  const areAllSelected = tasks.length > 0 && selectedTasks.length === tasks.length

  const toggleSelectAll = () => {
    if (areAllSelected) {
      setSelectedTasks([])
    } else {
      setSelectedTasks(tasks.map((task) => task.id))
    }
  }

  const getPriorityColor = (priority: string) => {
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

  const getStatusColor = (status: string) => {
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Tasks</h1>
        <p className="text-muted-foreground">Manage and track all your tasks in one place</p>
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
          <Select onValueChange={(value) => setFilterStatus(value === "all" ? null : value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="To Do">To Do</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Review">Review</SelectItem>
              <SelectItem value="Done">Done</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={(value) => setFilterPriority(value === "all" ? null : value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Button>
            <Plus className="h-4 w-4 mr-2" /> Add Task
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="todo">To Do</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
          <TabsTrigger value="done">Done</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>All Tasks</CardTitle>
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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox checked={areAllSelected} onCheckedChange={toggleSelectAll} id="select-all" />
                    <label
                      htmlFor="select-all"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {selectedTasks.length > 0 ? `Selected ${selectedTasks.length} tasks` : "Select all"}
                    </label>
                  </div>

                  {selectedTasks.length > 0 && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Assign To
                      </Button>
                      <Button size="sm" variant="outline">
                        Change Status
                      </Button>
                      <Button size="sm" variant="destructive">
                        Delete
                      </Button>
                    </div>
                  )}
                </div>

                {tasks.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium mb-1">No tasks found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters or search query</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 border rounded-lg ${
                          selectedTasks.includes(task.id) ? "border-primary bg-primary/5" : ""
                        } ${task.status === "Done" ? "opacity-60" : ""}`}
                      >
                        <div className="flex gap-3">
                          <Checkbox
                            checked={selectedTasks.includes(task.id)}
                            onCheckedChange={() => toggleTaskSelection(task.id)}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                              <div className="flex items-start gap-2">
                                <h3 className="font-medium text-lg flex-1">{task.title}</h3>
                                <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                                <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="flex gap-1 items-center">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(task.dueDate).toLocaleDateString()}
                                </Badge>
                                <Badge variant="outline" className="hover:bg-primary/10">
                                  {task.board.name}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-muted-foreground text-sm mb-3">{task.description}</p>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                                  <AvatarFallback>
                                    {task.assignee.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-muted-foreground">{task.assignee.name}</span>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleMarkAsDone(task.id)}
                                  disabled={task.status === "Done"}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  {task.status === "Done" ? "Completed" : "Mark as Done"}
                                </Button>
                                <Button size="sm" variant="outline" asChild>
                                  <Link href={`/board/${task.board.id}`}>View Board</Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="todo">
          <Card>
            <CardHeader>
              <CardTitle>To Do</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">Tasks to be done will appear here</h3>
                <p className="text-muted-foreground">Switch to the All Tasks tab to view all tasks</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="in-progress">
          <Card>
            <CardHeader>
              <CardTitle>In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">Tasks in progress will appear here</h3>
                <p className="text-muted-foreground">Switch to the All Tasks tab to view all tasks</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review">
          <Card>
            <CardHeader>
              <CardTitle>Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">Tasks in review will appear here</h3>
                <p className="text-muted-foreground">Switch to the All Tasks tab to view all tasks</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="done">
          <Card>
            <CardHeader>
              <CardTitle>Done</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">Completed tasks will appear here</h3>
                <p className="text-muted-foreground">Switch to the All Tasks tab to view all tasks</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

