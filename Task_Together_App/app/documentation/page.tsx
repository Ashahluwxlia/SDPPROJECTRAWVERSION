"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Layout, ChevronRight, Search, Book, Code, FileText, HelpCircle, ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"

export default function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const sections = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: <Book className="h-5 w-5" />,
      content: [
        {
          title: "Introduction",
          description: "Learn about TaskTogether and how it can help your team manage tasks efficiently.",
          link: "#introduction",
        },
        {
          title: "Creating an Account",
          description: "Step-by-step guide to creating your TaskTogether account and setting up your profile.",
          link: "#creating-account",
        },
        {
          title: "Creating Your First Board",
          description: "Learn how to create and customize your first Kanban board.",
          link: "#first-board",
        },
      ],
    },
    {
      id: "features",
      title: "Features",
      icon: <FileText className="h-5 w-5" />,
      content: [
        {
          title: "Kanban Boards",
          description: "Learn how to use Kanban boards to visualize and manage your workflow.",
          link: "#kanban-boards",
        },
        {
          title: "Task Management",
          description: "Create, edit, and organize tasks with custom fields, priorities, and due dates.",
          link: "#task-management",
        },
        {
          title: "Team Collaboration",
          description: "Invite team members, assign tasks, and collaborate in real-time.",
          link: "#team-collaboration",
        },
        {
          title: "Analytics & Reporting",
          description: "Track progress and gain insights with visual dashboards and reports.",
          link: "#analytics",
        },
      ],
    },
    {
      id: "api",
      title: "API Reference",
      icon: <Code className="h-5 w-5" />,
      content: [
        {
          title: "Authentication",
          description: "Learn how to authenticate with the TaskTogether API.",
          link: "#api-authentication",
        },
        {
          title: "Boards API",
          description: "Endpoints for creating and managing boards.",
          link: "#boards-api",
        },
        {
          title: "Tasks API",
          description: "Endpoints for creating and managing tasks.",
          link: "#tasks-api",
        },
      ],
    },
    {
      id: "faq",
      title: "FAQ",
      icon: <HelpCircle className="h-5 w-5" />,
      content: [
        {
          title: "Account Management",
          description: "Frequently asked questions about account settings and management.",
          link: "#account-faq",
        },
        {
          title: "Billing & Subscriptions",
          description: "Information about billing, subscriptions, and payment methods.",
          link: "#billing-faq",
        },
        {
          title: "Troubleshooting",
          description: "Common issues and how to resolve them.",
          link: "#troubleshooting",
        },
      ],
    },
  ]

  const filteredSections = sections
    .map((section) => ({
      ...section,
      content: section.content.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((section) => section.content.length > 0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-950 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <Layout className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">TaskTogether</span>
              </Link>
              <span className="text-lg font-medium text-gray-500 dark:text-gray-400 ml-2">Documentation</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
                </Button>
              </Link>
              <Link href="/login">
                <Button size="sm">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto mb-12">
          <motion.h1
            className="text-4xl font-bold mb-4 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            TaskTogether Documentation
          </motion.h1>
          <motion.p
            className="text-xl text-gray-600 dark:text-gray-400 text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Everything you need to know about using TaskTogether effectively
          </motion.p>

          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search documentation..."
              className="pl-10 py-6 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="getting-started" className="max-w-5xl mx-auto">
          <TabsList className="grid grid-cols-4 mb-8">
            {sections.map((section) => (
              <TabsTrigger key={section.id} value={section.id} className="flex items-center gap-2">
                {section.icon}
                <span className="hidden md:inline">{section.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {sections.map((section) => (
            <TabsContent key={section.id} value={section.id} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                {(searchQuery ? filteredSections.find((s) => s.id === section.id)?.content : section.content)?.map(
                  (item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                    >
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{item.description}</p>
                      <Link href={item.link} className="text-primary flex items-center hover:underline">
                        Read more <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </motion.div>
                  ),
                )}
              </div>

              {section.id === "getting-started" && (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm mt-8" id="introduction">
                  <h2 className="text-2xl font-bold mb-4">Introduction to TaskTogether</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    TaskTogether is a powerful task management platform designed to help teams collaborate effectively and
                    manage projects with ease. With its intuitive interface and comprehensive feature set, TaskFlow
                    streamlines your workflow and boosts productivity.
                  </p>
                  <h3 className="text-xl font-bold mt-6 mb-3">Key Features</h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                    <li>Visual Kanban boards for intuitive task management</li>
                    <li>Detailed task cards with descriptions, attachments, and comments</li>
                    <li>Team collaboration tools for seamless communication</li>
                    <li>Customizable workflows to match your team's processes</li>
                    <li>Analytics and reporting to track progress and identify bottlenecks</li>
                    <li>Mobile apps for managing tasks on the go</li>
                  </ul>
                  <h3 className="text-xl font-bold mt-6 mb-3">Getting Started</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    To get started with TaskTogether, you'll need to create an account and set up your first board. Follow
                    the guides in this section to learn how to create and customize your workspace, invite team members,
                    and start managing your tasks effectively.
                  </p>
                  <div className="mt-6">
                    <Link href="#creating-account">
                      <Button>
                        Next: Creating an Account <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}

