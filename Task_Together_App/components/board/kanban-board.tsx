"use client"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal, Filter, SlidersHorizontal, Search, Keyboard } from "lucide-react"
import TaskCard from "@/components/board/task-card"
import { getLists, updateTaskStatus, getTasks } from "@/lib/board-client"
import AddTaskDialog from "@/components/board/add-task-dialog"
import AddListDialog from "@/components/board/add-list-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { VirtualizedList } from "@/components/virtualized-list"
import { useAppKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import type { List, Task } from "@/types/prisma"
import { useSession } from "next-auth/react"

interface KanbanBoardProps {
  boardId: string
  initialLists?: any[] // Using any to accommodate the complex type from Prisma
  isDemoMode?: boolean
}

export default function KanbanBoard({ boardId, initialLists = [], isDemoMode = false }: KanbanBoardProps) {
  const { data: session } = useSession()
  const [lists, setLists] = useState<any[]>(initialLists)
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false)
  const [isAddListDialogOpen, setIsAddListDialogOpen] = useState(false)
  const [activeList, setActiveList] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(!initialLists.length)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPriority, setFilterPriority] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Initialize keyboard shortcuts
  const { showShortcutsHelp } = useAppKeyboardShortcuts()

  useEffect(() => {
    // If we don't have initial lists, fetch them
    if (!initialLists.length) {
      const fetchLists = async () => {
        setIsLoading(true)
        setError(null)

        try {
          if (isDemoMode && !session?.user) {
            // Use demo data for non-authenticated users in demo mode
            const demoLists = [
              {
                id: "list-1",
                name: "To Do",
                tasks: [
                  {
                    id: "task-1",
                    title: "Create project proposal",
                    description: "Draft a detailed project proposal for the client",
                    status: "To Do",
                    priority: "High",
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    assignee: {
                      id: "user-1",
                      name: "John Doe",
                      avatar: "/placeholder-user.jpg",
                    },
                  },
                  {
                    id: "task-2",
                    title: "Research competitors",
                    description: "Analyze top 5 competitors in the market",
                    status: "To Do",
                    priority: "Medium",
                    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                    assignee: {
                      id: "user-2",
                      name: "Jane Smith",
                      avatar: "/placeholder-user.jpg",
                    },
                  },
                ],
              },
              {
                id: "list-2",
                name: "In Progress",
                tasks: [
                  {
                    id: "task-3",
                    title: "Design wireframes",
                    description: "Create wireframes for the main user flows",
                    status: "In Progress",
                    priority: "High",
                    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                    assignee: {
                      id: "user-3",
                      name: "Alex Johnson",
                      avatar: "/placeholder-user.jpg",
                    },
                  },
                ],
              },
              {
                id: "list-3",
                name: "Review",
                tasks: [
                  {
                    id: "task-4",
                    title: "Code review",
                    description: "Review the latest pull requests",
                    status: "Review",
                    priority: "Medium",
                    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                    assignee: {
                      id: "user-1",
                      name: "John Doe",
                      avatar: "/placeholder-user.jpg",
                    },
                  },
                ],
              },
              {
                id: "list-4",
                name: "Completed",
                tasks: [
                  {
                    id: "task-5",
                    title: "Project kickoff meeting",
                    description: "Initial meeting with stakeholders",
                    status: "Completed",
                    priority: "High",
                    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    assignee: {
                      id: "user-2",
                      name: "Jane Smith",
                      avatar: "/placeholder-user.jpg",
                    },
                  },
                ],
              },
            ]
            setLists(demoLists)
          } else {
            const { lists: listsData } = await getLists(boardId)
            setLists(listsData)
          }
        } catch (error) {
          console.error("Error fetching lists:", error)
          setError("Failed to load board data. Please try again.")
        } finally {
          setIsLoading(false)
        }
      }

      fetchLists()
    }
  }, [boardId, initialLists, isDemoMode, session])

  const handleDragEnd = async (result: any) => {
    const { source, destination, draggableId } = result

    // Dropped outside the list
    if (!destination) {
      return
    }

    // No movement
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    // Find source and destination lists
    const sourceList = lists.find((list) => list.id === source.droppableId)
    const destList = lists.find((list) => list.id === destination.droppableId)

    if (!sourceList || !destList) {
      return
    }

    // Create new lists array
    const newLists = [...lists]

    // Find source and destination list indices
    const sourceListIndex = newLists.findIndex((list) => list.id === source.droppableId)
    const destListIndex = newLists.findIndex((list) => list.id === destination.droppableId)

    // Create new tasks arrays
    const newSourceTasks = [...sourceList.tasks]
    const newDestTasks = source.droppableId === destination.droppableId ? newSourceTasks : [...destList.tasks]

    // Remove task from source
    const [movedTask] = newSourceTasks.splice(source.index, 1)

    // Add task to destination
    newDestTasks.splice(destination.index, 0, movedTask)

    // Update lists
    newLists[sourceListIndex] = {
      ...sourceList,
      tasks: newSourceTasks,
    }

    if (source.droppableId !== destination.droppableId) {
      newLists[destListIndex] = {
        ...destList,
        tasks: newDestTasks,
      }

      // Update task status in the database
      try {
        if (isDemoMode && !session?.user) {
          // Simulate task status update in demo mode
          setTimeout(() => {
            toast({
              title: "Task moved",
              description: `Task "${movedTask.title}" moved to ${destList.name} (Demo Mode)`,
              duration: 3000,
            })
          }, 300)
        } else {
          await updateTaskStatus(movedTask.id, destination.droppableId)
          toast({
            title: "Task moved",
            description: `Task "${movedTask.title}" moved to ${destList.name}`,
            duration: 3000,
          })
        }
      } catch (error) {
        console.error("Error updating task status:", error)
        toast({
          title: "Error moving task",
          description: "There was an error updating the task status. The changes may not be saved.",
          variant: "destructive",
        })
      }
    }

    setLists(newLists)
  }

  const handleAddTask = (listId: string) => {
    setActiveList(listId)
    setIsAddTaskDialogOpen(true)
  }

  const handleTaskAdded = (newTask: Task) => {
    const updatedLists = lists.map((list) => {
      if (list.id === activeList) {
        return {
          ...list,
          tasks: [...list.tasks, newTask],
        }
      }
      return list
    })
    setLists(updatedLists)
    setIsAddTaskDialogOpen(false)

    if (isDemoMode && !session?.user) {
      toast({
        title: "Task created (Demo Mode)",
        description: `Task "${newTask.title}" has been created in demo mode`,
        duration: 3000,
      })
    } else {
      toast({
        title: "Task created",
        description: `Task "${newTask.title}" has been created`,
        duration: 3000,
      })
    }
  }

  const handleListAdded = (newList: List) => {
    setLists([...lists, { ...newList, tasks: [] }])
    setIsAddListDialogOpen(false)

    if (isDemoMode && !session?.user) {
      toast({
        title: "List created (Demo Mode)",
        description: `List "${newList.name}" has been created in demo mode`,
        duration: 3000,
      })
    } else {
      toast({
        title: "List created",
        description: `List "${newList.name}" has been created`,
        duration: 3000,
      })
    }
  }

  const loadMoreTasks = async (listId: string) => {
    if (!hasMore) return

    try {
      if (isDemoMode && !session?.user) {
        // Simulate loading more tasks in demo mode
        setTimeout(() => {
          const list = lists.find((l) => l.id === listId)
          if (list) {
            const demoTasks = [
              {
                id: `task-${Date.now()}-1`,
                title: "Demo task 1",
                description: "This is a demo task",
                status: list.name,
                priority: "Medium",
                dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                assignee: {
                  id: "user-1",
                  name: "John Doe",
                  avatar: "/placeholder-user.jpg",
                },
              },
              {
                id: `task-${Date.now()}-2`,
                title: "Demo task 2",
                description: "This is another demo task",
                status: list.name,
                priority: "Low",
                dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                assignee: {
                  id: "user-2",
                  name: "Jane Smith",
                  avatar: "/placeholder-user.jpg",
                },
              },
            ]

            const updatedLists = lists.map((l) => {
              if (l.id === listId) {
                return {
                  ...l,
                  tasks: [...l.tasks, ...demoTasks],
                }
              }
              return l
            })

            setLists(updatedLists)
            setHasMore(false)
          }
        }, 500)
      } else {
        const nextPage = page + 1
        const response = await getTasks(listId, nextPage)
        
        // Extract tasks and determine total pages
        const moreTasks = response.tasks
        const totalPages = 'pagination' in response 
          ? response.pagination.totalPages 
          : response.pages

        if (moreTasks.length > 0) {
          // Update the list with more tasks
          const updatedLists = lists.map((list) => {
            if (list.id === listId) {
              return {
                ...list,
                tasks: [...list.tasks, ...moreTasks],
              }
            }
            return list
          })

          setLists(updatedLists)
          setPage(nextPage)
          setHasMore(nextPage < totalPages)
        } else {
          setHasMore(false)
        }
      }
    } catch (error) {
      console.error("Error loading more tasks:", error)
    }
  }

  // Filter tasks based on search query and priority
  const filteredLists = lists.map((list) => ({
    ...list,
    tasks: list.tasks.filter((task: Task) => {
      const matchesSearch = searchQuery
        ? task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
        : true

      const matchesPriority = filterPriority ? task.priority?.toLowerCase() === filterPriority.toLowerCase() : true

      return matchesSearch && matchesPriority
    }),
  }))

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
        <p className="mt-2 text-muted-foreground">Loading board...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-destructive mb-4">{error}</div>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full max-w-md">
          <Input
            type="search"
            placeholder="Search tasks..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
                {filterPriority && <Badge className="ml-1 bg-primary/20 text-primary">{filterPriority}</Badge>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterPriority(null)}>All Priorities</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilterPriority("High")}>High Priority</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPriority("Medium")}>Medium Priority</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPriority("Low")}>Low Priority</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" className="gap-1">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Sort</span>
          </Button>

          <Button variant="outline" size="sm" className="gap-1" onClick={showShortcutsHelp}>
            <Keyboard className="h-4 w-4" />
            <span className="hidden sm:inline">Shortcuts</span>
          </Button>

          <Button size="sm" onClick={() => setIsAddListDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add List
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 pb-8 overflow-x-auto min-h-[calc(100vh-250px)]">
          {filteredLists.map((list) => (
            <div key={list.id} className="board-column">
              <div className="p-2 flex justify-between items-center border-b">
                <div className="font-medium px-2 py-1 flex items-center">
                  {list.name}
                  <Badge variant="outline" className="ml-2 bg-muted text-muted-foreground">
                    {list.tasks.length}
                  </Badge>
                </div>
                <div className="flex items-center">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleAddTask(list.id)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit list</DropdownMenuItem>
                      <DropdownMenuItem>Sort list</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">Delete list</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <Droppable droppableId={list.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex-1 p-2 overflow-y-auto max-h-[calc(100vh-220px)]"
                  >
                    {list.tasks.length === 0 ? (
                      <div className="h-20 flex items-center justify-center border border-dashed rounded-md text-muted-foreground text-sm">
                        No tasks
                      </div>
                    ) : (
                      <VirtualizedList
                        items={list.tasks}
                        itemHeight={120} // Approximate height of a task card
                        onEndReached={() => loadMoreTasks(list.id)}
                        renderItem={(task: Task, index: number) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="mb-2"
                              >
                                <TaskCard task={task} />
                              </div>
                            )}
                          </Draggable>
                        )}
                      />
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
              <div className="p-2 border-t">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground"
                  onClick={() => handleAddTask(list.id)}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add a task
                </Button>
              </div>
            </div>
          ))}
          <div className="w-72 flex-shrink-0">
            <Button
              variant="outline"
              className="w-full h-12 border-dashed"
              onClick={() => setIsAddListDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" /> Add new list
            </Button>
          </div>
        </div>
      </DragDropContext>

      <AddTaskDialog
        open={isAddTaskDialogOpen}
        onOpenChange={setIsAddTaskDialogOpen}
        listId={activeList || ""}
        onTaskAdded={handleTaskAdded}
        isDemoMode={isDemoMode}
      />

      <AddListDialog
        open={isAddListDialogOpen}
        onOpenChange={setIsAddListDialogOpen}
        boardId={boardId}
        onListAdded={handleListAdded}
        isDemoMode={isDemoMode}
      />
    </>
  )
}

