import { Prisma } from '@prisma/client'

// Re-export Prisma types
export type List = Prisma.ListGetPayload<{
  include: { tasks: true }
}>

export type Task = Prisma.TaskGetPayload<{
  include: { 
    labels: true,
    attachments: true,
    comments: true
  }
}> 