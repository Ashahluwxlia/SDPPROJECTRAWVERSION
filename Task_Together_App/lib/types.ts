import type { Notification as PrismaNotification } from "@prisma/client"

export interface User {
  id: string
  name: string | null
  email: string
  avatar?: string | null
  role?: string
}

export interface Board {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  ownerId: string
  background?: string
  isStarred?: boolean
  members?: User[]
}

export interface List {
  id: string
  name: string
  boardId: string
  position: number
  tasks: Task[]
}

export interface Task {
  id: string
  title: string
  description?: string
  listId: string
  position: number
  createdAt: string
  updatedAt: string
  dueDate?: string
  priority?: "Low" | "Medium" | "High" | "Critical"
  status?: "To-Do" | "In Progress" | "Review" | "Completed"
  assignee?: {
    id: string
    name: string
    avatar?: string
  }
  labels?: {
    id: string
    name: string
    color: string
  }[]
  attachments?: {
    id: string
    name: string
    url: string
    type: string
    size?: number
    uploadedAt?: string
  }[]
  comments?: Comment[]
  isPinned?: boolean
  isRecurring?: boolean
  recurringPattern?: "Daily" | "Weekly" | "Monthly"
  history?: TaskHistoryEntry[]
  reminderDate?: string
  completedAt?: string
  completedBy?: string
  category?: string
  tags?: string[]
}

export interface Comment {
  id: string
  text: string
  createdAt: string
  user: {
    id: string
    name: string
    avatar?: string
  }
  mentions?: string[] // User IDs that are mentioned
}

export interface TaskHistoryEntry {
  id: string
  taskId: string
  userId: string
  userName: string
  action: string
  field?: string
  oldValue?: string
  newValue?: string
  timestamp: string
}

export type Notification = Omit<PrismaNotification, 'createdAt'> & {
  createdAt: string
}

export interface TeamMember {
  id: string
  userId: string
  teamId: string
  role: "admin" | "manager" | "member"
  createdAt: Date
  updatedAt: Date
  user?: {
    id: string
    name: string | null
    email: string
    avatar?: string | null
  }
}

export interface Team {
  id: string
  name: string
  description?: string | null
  createdAt: Date
  updatedAt: Date
  members: TeamMember[]
  ownerId: string
}

export interface TaskReport {
  period: string
  totalTasks: number
  completedTasks: number
  overdueTasks: number
  tasksByPriority: {
    critical: number
    high: number
    medium: number
    low: number
  }
  tasksByStatus: {
    todo: number
    inProgress: number
    review: number
    completed: number
  }
  averageCompletionTime: number
}

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  taskId?: string
  color?: string
  allDay?: boolean
}

export interface UserPreferences {
  id: string
  userId: string
  theme: "light" | "dark" | "system"
  emailNotifications: boolean
  pushNotifications: boolean
  defaultView: "board" | "list" | "calendar" | "gantt"
  defaultFilter: string
  defaultSort: string
}

