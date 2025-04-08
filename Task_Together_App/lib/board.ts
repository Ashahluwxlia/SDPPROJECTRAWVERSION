// Create a new file for server-side board actions
"use server"

import type { Board, List, Task } from "./types"
import { isDemoMode } from "./auth.server"

// Mock data - in a real app, this would be stored in a database
const boards: Board[] = [
  {
    id: "1",
    name: "Product Development",
    description: "Track the development of our product",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ownerId: "1",
  },
  {
    id: "2",
    name: "Marketing Campaign",
    description: "Plan and execute our marketing campaign",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ownerId: "1",
  },
  {
    id: "3",
    name: "Website Redesign",
    description: "Redesign our company website",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ownerId: "1",
  },
]

const lists: List[] = [
  {
    id: "list-1",
    name: "To Do",
    boardId: "1",
    position: 0,
    tasks: [
      {
        id: "task-1",
        title: "Research competitors",
        description: "Analyze top 5 competitors and their features",
        listId: "list-1",
        position: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        priority: "High",
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
        assignee: {
          id: "1",
          name: "John Doe",
          avatar: "/placeholder-user.jpg",
        },
        labels: [
          { id: "label-1", name: "Research", color: "#61bd4f" },
          { id: "label-2", name: "Important", color: "#f2d600" },
        ],
        comments: [
          {
            id: "comment-1",
            text: "I'll start with the top 3 competitors first.",
            createdAt: new Date().toISOString(),
            user: {
              id: "1",
              name: "John Doe",
              avatar: "/placeholder-user.jpg",
            },
          },
        ],
      },
      {
        id: "task-2",
        title: "Create wireframes",
        description: "Design initial wireframes for the main pages",
        listId: "list-1",
        position: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        priority: "Medium",
        dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
        assignee: {
          id: "2",
          name: "Jane Smith",
          avatar: "/placeholder-user.jpg",
        },
        labels: [{ id: "label-3", name: "Design", color: "#c377e0" }],
      },
    ],
  },
  {
    id: "list-2",
    name: "In Progress",
    boardId: "1",
    position: 1,
    tasks: [
      {
        id: "task-3",
        title: "Implement authentication",
        description: "Set up user authentication with NextAuth.js",
        listId: "list-2",
        position: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        priority: "High",
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
        assignee: {
          id: "3",
          name: "Alex Johnson",
          avatar: "/placeholder-user.jpg",
        },
        labels: [{ id: "label-4", name: "Backend", color: "#0079bf" }],
        comments: [
          {
            id: "comment-2",
            text: "I've started working on this. Should be done by tomorrow.",
            createdAt: new Date().toISOString(),
            user: {
              id: "3",
              name: "Alex Johnson",
              avatar: "/placeholder-user.jpg",
            },
          },
        ],
      },
    ],
  },
  {
    id: "list-3",
    name: "Review",
    boardId: "1",
    position: 2,
    tasks: [
      {
        id: "task-4",
        title: "Review homepage design",
        description: "Review and provide feedback on the homepage design",
        listId: "list-3",
        position: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        priority: "Medium",
        dueDate: new Date(Date.now() + 86400000 * 1).toISOString(), // 1 day from now
        assignee: {
          id: "1",
          name: "John Doe",
          avatar: "/placeholder-user.jpg",
        },
        labels: [{ id: "label-5", name: "Review", color: "#ff9f1a" }],
      },
    ],
  },
  {
    id: "list-4",
    name: "Done",
    boardId: "1",
    position: 3,
    tasks: [
      {
        id: "task-5",
        title: "Set up project repository",
        description: "Create GitHub repository and set up initial project structure",
        listId: "list-4",
        position: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        priority: "Low",
        dueDate: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        assignee: {
          id: "3",
          name: "Alex Johnson",
          avatar: "/placeholder-user.jpg",
        },
        labels: [{ id: "label-6", name: "Setup", color: "#61bd4f" }],
      },
    ],
  },
]

// Get all boards
export async function getBoards(page = 1, limit = 10): Promise<{ boards: Board[], pagination: { total: number, page: number, limit: number, totalPages: number } }> {
  // Check if we're in demo mode
  const demoMode = await isDemoMode()
  
  if (demoMode) {
    // Return mock data for demo users
    const demoBoards: Board[] = [
      {
        id: "demo-board-1",
        name: "Product Development",
        description: "Track the development of our product",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ownerId: "demo-user-id",
        background: "#f5f5f5",
        isStarred: true,
      },
      {
        id: "demo-board-2",
        name: "Marketing Campaign",
        description: "Plan and execute our marketing campaign",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ownerId: "demo-user-id",
        background: "#e3f2fd",
        isStarred: false,
      },
      {
        id: "demo-board-3",
        name: "Website Redesign",
        description: "Redesign our company website",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ownerId: "demo-user-id",
        background: "#f3e5f5",
        isStarred: false,
      },
    ]
    
    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedBoards = demoBoards.slice(startIndex, endIndex)
    
    return {
      boards: paginatedBoards,
      pagination: {
        total: demoBoards.length,
        page,
        limit,
        totalPages: Math.ceil(demoBoards.length / limit),
      },
    }
  }
  
  // In a real app, this would fetch boards from a database with pagination
  // For now, we'll just return the mock data with pagination
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedBoards = boards.slice(startIndex, endIndex)
  
  return {
    boards: paginatedBoards,
    pagination: {
      total: boards.length,
      page,
      limit,
      totalPages: Math.ceil(boards.length / limit),
    },
  }
}

export async function getBoard(id: string): Promise<Board | null> {
  // Check if we're in demo mode
  const demoMode = await isDemoMode()
  
  if (demoMode) {
    // Return mock data for demo users
    const demoBoards: Board[] = [
      {
        id: "demo-board-1",
        name: "Product Development",
        description: "Track the development of our product",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ownerId: "demo-user-id",
        background: "#f5f5f5",
        isStarred: true,
      },
      {
        id: "demo-board-2",
        name: "Marketing Campaign",
        description: "Plan and execute our marketing campaign",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ownerId: "demo-user-id",
        background: "#e3f2fd",
        isStarred: false,
      },
      {
        id: "demo-board-3",
        name: "Website Redesign",
        description: "Redesign our company website",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ownerId: "demo-user-id",
        background: "#f3e5f5",
        isStarred: false,
      },
    ]
    
    // Find the board in the demo boards
    const board = demoBoards.find((b) => b.id === id)
    return board || null
  }
  
  // In a real app, this would fetch the board from a database
  const board = boards.find((b) => b.id === id)
  return board || null
}

export async function getLists(boardId: string): Promise<List[]> {
  // Check if we're in demo mode
  const demoMode = await isDemoMode()
  
  if (demoMode) {
    // Return mock data for demo users
    const demoLists: List[] = [
      {
        id: "demo-list-1",
        name: "To Do",
        boardId: "demo-board-1",
        position: 0,
        tasks: [
          {
            id: "demo-task-1",
            title: "Research competitors",
            description: "Analyze top 5 competitors and their features",
            listId: "demo-list-1",
            position: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            priority: "High",
            dueDate: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
            assignee: {
              id: "demo-user-id",
              name: "Demo User",
              avatar: "/placeholder-user.jpg",
            },
            labels: [
              { id: "demo-label-1", name: "Research", color: "#61bd4f" },
              { id: "demo-label-2", name: "Important", color: "#f2d600" },
            ],
            comments: [
              {
                id: "demo-comment-1",
                text: "I'll start with the top 3 competitors first.",
                createdAt: new Date().toISOString(),
                user: {
                  id: "demo-user-id",
                  name: "Demo User",
                  avatar: "/placeholder-user.jpg",
                },
              },
            ],
          },
        ],
      },
      {
        id: "demo-list-2",
        name: "In Progress",
        boardId: "demo-board-1",
        position: 1,
        tasks: [],
      },
      {
        id: "demo-list-3",
        name: "Review",
        boardId: "demo-board-1",
        position: 2,
        tasks: [],
      },
      {
        id: "demo-list-4",
        name: "Done",
        boardId: "demo-board-1",
        position: 3,
        tasks: [],
      },
    ]
    
    // Filter lists for the specified board
    return demoLists.filter((l) => l.boardId === boardId)
  }
  
  // In a real app, this would fetch the lists from a database
  return lists.filter((l) => l.boardId === boardId)
}

export async function getTasks(listId: string, page = 1, limit = 20): Promise<{ tasks: Task[], pagination: { total: number, page: number, limit: number, totalPages: number } }> {
  // Check if we're in demo mode
  const demoMode = await isDemoMode()
  
  if (demoMode) {
    // Return mock data for demo users
    const demoTasks: Task[] = [
      {
        id: "demo-task-1",
        title: "Research competitors",
        description: "Analyze top 5 competitors and their features",
        listId: "demo-list-1",
        position: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        priority: "High",
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
        assignee: {
          id: "demo-user-id",
          name: "Demo User",
          avatar: "/placeholder-user.jpg",
        },
        labels: [
          { id: "demo-label-1", name: "Research", color: "#61bd4f" },
          { id: "demo-label-2", name: "Important", color: "#f2d600" },
        ],
      },
      {
        id: "demo-task-2",
        title: "Create wireframes",
        description: "Design initial wireframes for the main pages",
        listId: "demo-list-1",
        position: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        priority: "Medium",
        dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
        assignee: {
          id: "demo-user-id",
          name: "Demo User",
          avatar: "/placeholder-user.jpg",
        },
        labels: [{ id: "demo-label-3", name: "Design", color: "#c377e0" }],
      },
    ]
    
    // Filter tasks for the specified list
    const listTasks = demoTasks.filter((t) => t.listId === listId)
    
    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedTasks = listTasks.slice(startIndex, endIndex)
    
    return {
      tasks: paginatedTasks,
      pagination: {
        total: listTasks.length,
        page,
        limit,
        totalPages: Math.ceil(listTasks.length / limit),
      },
    }
  }
  
  // In a real app, this would fetch tasks from a database with pagination
  // For now, we'll just return the mock data with pagination
  const listTasks = lists.flatMap((l) => l.tasks).filter((t) => t.listId === listId)
  
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedTasks = listTasks.slice(startIndex, endIndex)
  
  return {
    tasks: paginatedTasks,
    pagination: {
      total: listTasks.length,
      page,
      limit,
      totalPages: Math.ceil(listTasks.length / limit),
    },
  }
}

export async function createBoard(boardData: {
  name: string
  description?: string
  background?: string
}): Promise<{ success: boolean, boardId?: string }> {
  // Check if we're in demo mode
  const demoMode = await isDemoMode()
  
  if (demoMode) {
    // Return success for demo users
    return { success: true, boardId: `demo-board-${Date.now()}` }
  }
  
  // In a real app, this would create a board in the database
  const newBoard: Board = {
    id: `board-${Date.now()}`,
    name: boardData.name,
    description: boardData.description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ownerId: "1", // This would be the actual user ID
    background: boardData.background,
    isStarred: false,
  }
  
  boards.push(newBoard)
  
  return { success: true, boardId: newBoard.id }
}

export async function updateBoard(boardData: {
  id: string
  name: string
  description?: string
  background?: string
  isStarred?: boolean
}): Promise<{ success: boolean }> {
  // Check if we're in demo mode
  const demoMode = await isDemoMode()
  
  if (demoMode) {
    // Return success for demo users
    return { success: true }
  }
  
  // In a real app, this would update a board in the database
  const boardIndex = boards.findIndex((b) => b.id === boardData.id)
  
  if (boardIndex === -1) {
    return { success: false }
  }
  
  boards[boardIndex] = {
    ...boards[boardIndex],
    name: boardData.name,
    description: boardData.description,
    background: boardData.background,
    isStarred: boardData.isStarred,
    updatedAt: new Date().toISOString(),
  }
  
  return { success: true }
}

export async function deleteBoard(id: string): Promise<{ success: boolean }> {
  // Check if we're in demo mode
  const demoMode = await isDemoMode()
  
  if (demoMode) {
    // Return success for demo users
    return { success: true }
  }
  
  // In a real app, this would delete a board from the database
  const boardIndex = boards.findIndex((b) => b.id === id)
  
  if (boardIndex === -1) {
    return { success: false }
  }
  
  boards.splice(boardIndex, 1)
  
  // Also delete associated lists
  const listIndices = lists.reduce<number[]>((indices, list, index) => {
    if (list.boardId === id) {
      indices.push(index)
    }
    return indices
  }, [])
  
  // Remove lists in reverse order to avoid index shifting
  for (let i = listIndices.length - 1; i >= 0; i--) {
    lists.splice(listIndices[i], 1)
  }
  
  return { success: true }
}

export async function createList(listData: {
  name: string
  boardId: string
}): Promise<{ success: boolean, listId?: string }> {
  // Check if we're in demo mode
  const demoMode = await isDemoMode()
  
  if (demoMode) {
    // Return success for demo users
    return { success: true, listId: `demo-list-${Date.now()}` }
  }
  
  // In a real app, this would create a list in the database
  const newList: List = {
    id: `list-${Date.now()}`,
    name: listData.name,
    boardId: listData.boardId,
    position: lists.filter((l) => l.boardId === listData.boardId).length,
    tasks: [],
  }
  
  lists.push(newList)
  
  return { success: true, listId: newList.id }
}

export async function updateList(listData: {
  id: string
  name: string
  position?: number
}): Promise<{ success: boolean }> {
  // Check if we're in demo mode
  const demoMode = await isDemoMode()
  
  if (demoMode) {
    // Return success for demo users
    return { success: true }
  }
  
  // In a real app, this would update a list in the database
  const listIndex = lists.findIndex((l) => l.id === listData.id)
  
  if (listIndex === -1) {
    return { success: false }
  }
  
  lists[listIndex] = {
    ...lists[listIndex],
    name: listData.name,
    position: listData.position !== undefined ? listData.position : lists[listIndex].position,
  }
  
  return { success: true }
}

export async function deleteList(id: string): Promise<{ success: boolean }> {
  // Check if we're in demo mode
  const demoMode = await isDemoMode()
  
  if (demoMode) {
    // Return success for demo users
    return { success: true }
  }
  
  // In a real app, this would delete a list from the database
  const listIndex = lists.findIndex((l) => l.id === id)
  
  if (listIndex === -1) {
    return { success: false }
  }
  
  lists.splice(listIndex, 1)
  
  return { success: true }
}

export async function createTask(taskData: {
  title: string
  description?: string
  priority?: "Low" | "Medium" | "High" | "Critical"
  dueDate?: string
  listId: string
}): Promise<{ success: boolean, taskId?: string }> {
  // Check if we're in demo mode
  const demoMode = await isDemoMode()
  
  if (demoMode) {
    // Return success for demo users
    return { success: true, taskId: `demo-task-${Date.now()}` }
  }
  
  // In a real app, this would create a task in the database
  const newTask: Task = {
    id: `task-${Date.now()}`,
    title: taskData.title,
    description: taskData.description,
    listId: taskData.listId,
    position: 0, // Would calculate this based on existing tasks
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    priority: taskData.priority,
    dueDate: taskData.dueDate,
    assignee: {
      id: "1",
      name: "John Doe",
      avatar: "/placeholder-user.jpg",
    },
  }

  // Find the list and add the task
  const listIndex = lists.findIndex((l) => l.id === taskData.listId)
  if (listIndex !== -1) {
    lists[listIndex].tasks.unshift(newTask)
    return { success: true, taskId: newTask.id }
  }
  
  return { success: false }
}

export async function updateTask(taskData: {
  id: string
  title: string
  description?: string
  priority?: "Low" | "Medium" | "High" | "Critical"
  dueDate?: string | null
  assigneeId?: string
}): Promise<{ success: boolean }> {
  // Check if we're in demo mode
  const demoMode = await isDemoMode()
  
  if (demoMode) {
    // Return success for demo users
    return { success: true }
  }
  
  // In a real app, this would update a task in the database
  let task: Task | undefined
  let listIndex = -1
  
  // Find the task
  for (let i = 0; i < lists.length; i++) {
    const taskIndex = lists[i].tasks.findIndex((t) => t.id === taskData.id)
    if (taskIndex !== -1) {
      task = lists[i].tasks[taskIndex]
      listIndex = i
      break
    }
  }
  
  if (!task || listIndex === -1) {
    return { success: false }
  }
  
  // Update the task
  lists[listIndex].tasks = lists[listIndex].tasks.map((t) => {
    if (t.id === taskData.id) {
      return {
        ...t,
        title: taskData.title,
        description: taskData.description !== undefined ? taskData.description : t.description,
        priority: taskData.priority !== undefined ? taskData.priority : t.priority,
        dueDate: taskData.dueDate !== null ? taskData.dueDate : undefined,
        updatedAt: new Date().toISOString(),
      }
    }
    return t
  })
  
  return { success: true }
}

export async function deleteTask(id: string): Promise<{ success: boolean }> {
  // Check if we're in demo mode
  const demoMode = await isDemoMode()
  
  if (demoMode) {
    // Return success for demo users
    return { success: true }
  }
  
  // In a real app, this would delete a task from the database
  let taskFound = false
  
  for (let i = 0; i < lists.length; i++) {
    const taskIndex = lists[i].tasks.findIndex((t) => t.id === id)
    if (taskIndex !== -1) {
      lists[i].tasks.splice(taskIndex, 1)
      taskFound = true
      break
    }
  }
  
  return { success: taskFound }
}

export async function updateTaskStatus(taskId: string, newListId: string): Promise<{ success: boolean }> {
  // Check if we're in demo mode
  const demoMode = await isDemoMode()
  
  if (demoMode) {
    // Return success for demo users
    return { success: true }
  }
  
  // In a real app, this would update the task in the database
  let task: Task | undefined
  let sourceListIndex = -1

  // Find the task and its list
  for (let i = 0; i < lists.length; i++) {
    const taskIndex = lists[i].tasks.findIndex((t) => t.id === taskId)
    if (taskIndex !== -1) {
      task = lists[i].tasks[taskIndex]
      sourceListIndex = i
      // Remove the task from its current list
      lists[i].tasks.splice(taskIndex, 1)
      break
    }
  }

  if (!task || sourceListIndex === -1) {
    return { success: false }
  }

  // Update the task's listId
  task.listId = newListId
  task.updatedAt = new Date().toISOString()

  // Add the task to the new list
  const destListIndex = lists.findIndex((l) => l.id === newListId)
  if (destListIndex !== -1) {
    lists[destListIndex].tasks.push(task)
    return { success: true }
  }

  // If the destination list wasn't found, put the task back in its original list
  lists[sourceListIndex].tasks.push(task)
  return { success: false }
}

export async function addComment(commentData: {
  taskId: string
  text: string
}): Promise<{ success: boolean, commentId?: string }> {
  // Check if we're in demo mode
  const demoMode = await isDemoMode()
  
  if (demoMode) {
    // Return success for demo users
    return { success: true, commentId: `demo-comment-${Date.now()}` }
  }
  
  // In a real app, this would add a comment to a task in the database
  // For now, we'll just return success
  return { success: true, commentId: `comment-${Date.now()}` }
}

export async function uploadAttachment(attachmentData: {
  taskId: string
  file: File
}): Promise<{ success: boolean, attachmentId?: string }> {
  // Check if we're in demo mode
  const demoMode = await isDemoMode()
  
  if (demoMode) {
    // Return success for demo users
    return { success: true, attachmentId: `demo-attachment-${Date.now()}` }
  }
  
  // In a real app, this would upload an attachment to a task in the database
  // For now, we'll just return success
  return { success: true, attachmentId: `attachment-${Date.now()}` }
}

export async function searchTasks(query: string, page = 1, limit = 20): Promise<{ tasks: Task[], pagination: { total: number, page: number, limit: number, totalPages: number } }> {
  // Check if we're in demo mode
  const demoMode = await isDemoMode()
  
  if (demoMode) {
    // Return mock data for demo users
    const demoTasks: Task[] = [
      {
        id: "demo-task-1",
        title: "Research competitors",
        description: "Analyze top 5 competitors and their features",
        listId: "demo-list-1",
        position: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        priority: "High",
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
        assignee: {
          id: "demo-user-id",
          name: "Demo User",
          avatar: "/placeholder-user.jpg",
        },
        labels: [
          { id: "demo-label-1", name: "Research", color: "#61bd4f" },
          { id: "demo-label-2", name: "Important", color: "#f2d600" },
        ],
      },
      {
        id: "demo-task-2",
        title: "Create wireframes",
        description: "Design initial wireframes for the main pages",
        listId: "demo-list-1",
        position: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        priority: "Medium",
        dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
        assignee: {
          id: "demo-user-id",
          name: "Demo User",
          avatar: "/placeholder-user.jpg",
        },
        labels: [{ id: "demo-label-3", name: "Design", color: "#c377e0" }],
      },
    ]
    
    // Filter tasks based on the search query
    const filteredTasks = demoTasks.filter((t) => 
      t.title.toLowerCase().includes(query.toLowerCase()) || 
      (t.description && t.description.toLowerCase().includes(query.toLowerCase()))
    )
    
    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex)
    
    return {
      tasks: paginatedTasks,
      pagination: {
        total: filteredTasks.length,
        page,
        limit,
        totalPages: Math.ceil(filteredTasks.length / limit),
      },
    }
  }
  
  // In a real app, this would search tasks in the database
  // For now, we'll just return the mock data with filtering and pagination
  const allTasks = lists.flatMap((l) => l.tasks)
  
  const filteredTasks = allTasks.filter((t) => 
    t.title.toLowerCase().includes(query.toLowerCase()) || 
    (t.description && t.description.toLowerCase().includes(query.toLowerCase()))
  )
  
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex)
  
  return {
    tasks: paginatedTasks,
    pagination: {
      total: filteredTasks.length,
      page,
      limit,
      totalPages: Math.ceil(filteredTasks.length / limit),
    },
  }
}

