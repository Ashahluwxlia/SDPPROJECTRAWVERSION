"use client"

import {
  getBoards as getServerBoards,
  getBoard as getServerBoard,
  getLists as getServerLists,
  getTasks as getServerTasks,
  createBoard as createServerBoard,
  updateBoard as updateServerBoard,
  deleteBoard as deleteServerBoard,
  createList as createServerList,
  updateList as updateServerList,
  deleteList as deleteServerList,
  createTask as createServerTask,
  updateTask as updateServerTask,
  deleteTask as deleteServerTask,
  updateTaskStatus as updateServerTaskStatus,
  addComment as addServerComment,
  uploadAttachment as addServerAttachment,
  searchTasks as searchServerTasks,
} from "./board-actions"
import { isDemoMode } from "./auth-client"

// Get all boards
export async function getBoards(page = 1, limit = 10) {
  if (await isDemoMode()) {
    return {
      boards: [
        {
          id: "demo-board-1",
          name: "Project Alpha",
          description: "Main project board",
          background: "gradient-blue",
          isStarred: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "demo-board-2",
          name: "Marketing Campaign",
          description: "Q2 marketing initiatives",
          background: "gradient-purple",
          isStarred: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      pagination: {
        total: 2,
        page,
        limit,
        totalPages: 1,
      },
    }
  }
  return getServerBoards(page, limit)
}

// Get a specific board
export async function getBoard(id: string) {
  if (await isDemoMode()) {
    return {
      id: "demo-board-1",
      name: "Project Alpha",
      description: "Main project board",
      background: "gradient-blue",
      isStarred: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }
  return getServerBoard(id)
}

// Get all lists for a board
export async function getLists(boardId: string) {
  if (await isDemoMode()) {
    return {
      lists: [
        {
          id: "demo-list-1",
          name: "To Do",
          position: 0,
          boardId: "demo-board-1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "demo-list-2",
          name: "In Progress",
          position: 1,
          boardId: "demo-board-1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    }
  }
  return getServerLists(boardId)
}

// Get tasks for a list
export async function getTasks(listId: string, page = 1, limit = 20) {
  if (await isDemoMode()) {
    return {
      tasks: [
        {
          id: "demo-task-1",
          title: "Research competitors",
          description: "Analyze top 3 competitors",
          priority: "High",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          listId: "demo-list-1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      pagination: {
        total: 1,
        page,
        limit,
        totalPages: 1,
      },
    }
  }
  return getServerTasks(listId, page, limit)
}

// Create a new board
export async function createBoard(data: {
  name: string
  description?: string
  background?: string
}) {
  if (await isDemoMode()) {
    return { success: true, boardId: "demo-board-new" }
  }
  const formData = new FormData()
  formData.append("name", data.name)
  if (data.description) formData.append("description", data.description)
  if (data.background) formData.append("background", data.background)

  return createServerBoard(formData)
}

// Update a board
export async function updateBoard(data: {
  id: string
  name: string
  description?: string
  background?: string
  isStarred?: boolean
}) {
  if (await isDemoMode()) {
    return { success: true }
  }
  const formData = new FormData()
  formData.append("id", data.id)
  formData.append("name", data.name)
  if (data.description) formData.append("description", data.description)
  if (data.background) formData.append("background", data.background)
  if (data.isStarred !== undefined) formData.append("isStarred", data.isStarred.toString())

  return updateServerBoard(formData)
}

// Delete a board
export async function deleteBoard(id: string) {
  if (await isDemoMode()) {
    return { success: true }
  }
  return deleteServerBoard(id)
}

// Create a new list
export async function createList(data: {
  name: string
  boardId: string
}) {
  if (await isDemoMode()) {
    return { success: true, listId: "demo-list-new" }
  }
  const formData = new FormData()
  formData.append("name", data.name)
  formData.append("boardId", data.boardId)

  return createServerList(formData)
}

// Update a list
export async function updateList(data: {
  id: string
  name: string
  position?: number
}) {
  if (await isDemoMode()) {
    return { success: true }
  }
  const formData = new FormData()
  formData.append("id", data.id)
  formData.append("name", data.name)
  if (data.position !== undefined) formData.append("position", data.position.toString())

  return updateServerList(formData)
}

// Delete a list
export async function deleteList(id: string) {
  if (await isDemoMode()) {
    return { success: true }
  }
  return deleteServerList(id)
}

// Create a new task
export async function createTask(data: {
  title: string
  description?: string
  listId: string
  priority?: string
  dueDate?: string
  assigneeId?: string
}) {
  if (await isDemoMode()) {
    return { success: true, taskId: "demo-task-new" }
  }
  const formData = new FormData()
  formData.append("title", data.title)
  if (data.description) formData.append("description", data.description)
  formData.append("listId", data.listId)
  if (data.priority) formData.append("priority", data.priority)
  if (data.dueDate) formData.append("dueDate", data.dueDate)
  if (data.assigneeId) formData.append("assigneeId", data.assigneeId)

  return createServerTask(formData)
}

// Update a task
export async function updateTask(data: {
  id: string
  title: string
  description?: string
  priority?: string
  dueDate?: string | null
  assigneeId?: string
  isPinned?: boolean
  isRecurring?: boolean
  recurringPattern?: string
  reminderDate?: string
  category?: string
  labels?: { name: string; color: string }[]
  tags?: { name: string; color: string }[]
}) {
  if (await isDemoMode()) {
    return { success: true }
  }
  const formData = new FormData()
  formData.append("id", data.id)
  formData.append("title", data.title)
  if (data.description !== undefined) formData.append("description", data.description)
  if (data.priority) formData.append("priority", data.priority)
  if (data.dueDate) formData.append("dueDate", data.dueDate)
  if (data.assigneeId) formData.append("assigneeId", data.assigneeId)
  if (data.isPinned !== undefined) formData.append("isPinned", data.isPinned.toString())
  if (data.isRecurring !== undefined) formData.append("isRecurring", data.isRecurring.toString())
  if (data.recurringPattern) formData.append("recurringPattern", data.recurringPattern)
  if (data.reminderDate) formData.append("reminderDate", data.reminderDate)
  if (data.category) formData.append("category", data.category)
  if (data.labels) {
    data.labels.forEach((label, index) => {
      formData.append(`labels[${index}][name]`, label.name)
      formData.append(`labels[${index}][color]`, label.color)
    })
  }
  if (data.tags) {
    data.tags.forEach((tag, index) => {
      formData.append(`tags[${index}][name]`, tag.name)
      formData.append(`tags[${index}][color]`, tag.color || "#808080")
    })
  }

  return updateServerTask(formData)
}

// Delete a task
export async function deleteTask(id: string) {
  if (await isDemoMode()) {
    return { success: true }
  }
  return deleteServerTask(id)
}

// Update task status (move to another list)
export async function updateTaskStatus(taskId: string, newListId: string) {
  if (await isDemoMode()) {
    return { success: true }
  }
  return updateServerTaskStatus(taskId, newListId)
}

// Add a comment to a task
export async function addComment(data: {
  taskId: string
  text: string
}) {
  if (await isDemoMode()) {
    return { success: true, commentId: "demo-comment-new" }
  }
  const formData = new FormData()
  formData.append("taskId", data.taskId)
  formData.append("text", data.text)

  return addServerComment(formData)
}

// Add an attachment to a task
export async function addAttachment(data: {
  taskId: string
  file: File
}) {
  if (await isDemoMode()) {
    return { success: true, attachmentId: "demo-attachment-new" }
  }
  const formData = new FormData()
  formData.append("taskId", data.taskId)
  formData.append("file", data.file)

  return addServerAttachment(formData)
}

// Add a label to a task
export async function addLabel(data: {
  taskId: string
  name: string
  color: string
}) {
  if (await isDemoMode()) {
    return { success: true }
  }
  const formData = new FormData()
  formData.append("taskId", data.taskId)
  formData.append("name", data.name)
  formData.append("color", data.color)
  formData.append("type", "label")

  // Use the updateTask function to add a label
  return updateTask({
    id: data.taskId,
    title: "", // We don't need to update the title
    labels: [{ name: data.name, color: data.color }]
  })
}

// Add a tag to a task
export async function addTag(data: {
  taskId: string
  name: string
  color?: string
}) {
  if (await isDemoMode()) {
    return { success: true }
  }
  const formData = new FormData()
  formData.append("taskId", data.taskId)
  formData.append("name", data.name)
  if (data.color) formData.append("color", data.color)
  formData.append("type", "tag")

  // Use the updateTask function to add a tag
  return updateTask({
    id: data.taskId,
    title: "", // We don't need to update the title
    tags: [{ name: data.name, color: data.color || "#808080" }]
  })
}

