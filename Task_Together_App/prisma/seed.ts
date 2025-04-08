import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Create demo user
  const hashedPassword = await hash("password123", 10)

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@example.com",
      password: hashedPassword,
      avatar: "/placeholder.svg?height=100&width=100&text=DU",
      role: "admin",
      preferences: {
        create: {
          theme: "system",
          notifications: true,
        },
      },
    },
  })

  console.log("Created demo user:", demoUser.email)

  // Create a team
  const team = await prisma.team.create({
    data: {
      name: "Demo Team",
      description: "This is a demo team for testing purposes",
      ownerId: demoUser.id,
      members: {
        create: {
          userId: demoUser.id,
          role: "admin",
        },
      },
    },
  })

  console.log("Created team:", team.name)

  // Create a board
  const board = await prisma.board.create({
    data: {
      name: "Product Development",
      description: "Track the development of our product",
      ownerId: demoUser.id,
      isStarred: true,
      teamId: team.id,
      members: {
        connect: { id: demoUser.id },
      },
    },
  })

  console.log("Created board:", board.name)

  // Create lists
  const todoList = await prisma.list.create({
    data: {
      name: "To Do",
      position: 0,
      boardId: board.id,
    },
  })

  const inProgressList = await prisma.list.create({
    data: {
      name: "In Progress",
      position: 1,
      boardId: board.id,
    },
  })

  const reviewList = await prisma.list.create({
    data: {
      name: "Review",
      position: 2,
      boardId: board.id,
    },
  })

  const doneList = await prisma.list.create({
    data: {
      name: "Done",
      position: 3,
      boardId: board.id,
    },
  })

  console.log("Created lists")

  // Create tasks
  const task1 = await prisma.task.create({
    data: {
      title: "Design user interface",
      description: "Create wireframes and mockups for the new dashboard",
      position: 0,
      priority: "High",
      status: "In Progress",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      listId: inProgressList.id,
      assigneeId: demoUser.id,
      labels: {
        create: [
          { name: "Design", color: "#60a5fa" },
          { name: "Frontend", color: "#4ade80" },
        ],
      },
      tags: {
        create: [
          { name: "UI", color: "#6366F1" },
          { name: "Dashboard", color: "#8B5CF6" },
        ],
      },
    },
  })

  const task2 = await prisma.task.create({
    data: {
      title: "Implement authentication",
      description: "Set up JWT authentication and user management",
      position: 0,
      priority: "High",
      status: "To Do",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      listId: todoList.id,
      assigneeId: demoUser.id,
      labels: {
        create: [
          { name: "Backend", color: "#f87171" },
          { name: "Security", color: "#fbbf24" },
        ],
      },
    },
  })

  const task3 = await prisma.task.create({
    data: {
      title: "Write API documentation",
      description: "Document all API endpoints and parameters",
      position: 1,
      priority: "Medium",
      status: "To Do",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      listId: todoList.id,
      assigneeId: demoUser.id,
      labels: {
        create: [{ name: "Documentation", color: "#c084fc" }],
      },
    },
  })

  console.log("Created tasks")

  // Create comments
  await prisma.comment.create({
    data: {
      text: "I've started working on the wireframes. Will share the progress soon.",
      userId: demoUser.id,
      taskId: task1.id,
    },
  })

  console.log("Created comments")

  // Create activity logs
  await prisma.activityLog.create({
    data: {
      action: "created",
      details: 'Created board "Product Development"',
      entityType: "board",
      entityId: board.id,
      userId: demoUser.id,
      boardId: board.id,
    },
  })

  await prisma.activityLog.create({
    data: {
      action: "created",
      details: 'Created task "Design user interface"',
      entityType: "task",
      entityId: task1.id,
      userId: demoUser.id,
      boardId: board.id,
      taskId: task1.id,
    },
  })

  console.log("Created activity logs")

  console.log("Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

