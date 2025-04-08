"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MessageSquare, FileText, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import React from "react"

interface Activity {
  id: string
  user: {
    name: string
    avatar: string
    initials: string
  }
  action: string
  task: string
  time: string
  icon: React.ReactNode
  link: string
}

export default function RecentActivityFeed() {
  const { data: session } = useSession()
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Demo data for non-authenticated users
  const demoActivities = [
    {
      id: "1",
      user: {
        name: "John Doe",
        avatar: "/placeholder-user.jpg",
        initials: "JD",
      },
      action: "completed",
      task: "Design homepage mockup",
      time: "2 hours ago",
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      link: "/tasks/task-1",
    },
    {
      id: "2",
      user: {
        name: "Sarah Smith",
        avatar: "/placeholder-user.jpg",
        initials: "SS",
      },
      action: "commented on",
      task: "API integration plan",
      time: "5 hours ago",
      icon: <MessageSquare className="h-4 w-4 text-blue-500" />,
      link: "/tasks/task-2",
    },
    {
      id: "3",
      user: {
        name: "Alex Johnson",
        avatar: "/placeholder-user.jpg",
        initials: "AJ",
      },
      action: "created",
      task: "Backend architecture document",
      time: "1 day ago",
      icon: <FileText className="h-4 w-4 text-purple-500" />,
      link: "/tasks/task-3",
    },
  ]

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true)
      
      if (session?.user) {
        try {
          // In a real app, this would fetch data from your API
          const response = await fetch('/api/activities/recent')
          if (response.ok) {
            const data = await response.json()
            // Transform API data to match our Activity interface
            const transformedData = data.map((item: any) => ({
              id: item.id,
              user: {
                name: item.user.name,
                avatar: item.user.avatar || "/placeholder-user.jpg",
                initials: item.user.initials || item.user.name.split(' ').map((n: string) => n[0]).join(''),
              },
              action: item.action,
              task: item.task,
              time: item.time,
              icon: getIconForAction(item.action),
              link: `/tasks/${item.taskId}`,
            }))
            setActivities(transformedData)
          } else {
            // Fallback to demo data if API fails
            setActivities(demoActivities)
          }
        } catch (error) {
          console.error('Error fetching activities:', error)
          // Fallback to demo data on error
          setActivities(demoActivities)
        }
      } else {
        // Use demo data for non-authenticated users
        setActivities(demoActivities)
      }
      
      setIsLoading(false)
    }

    fetchActivities()
  }, [session])

  const getIconForAction = (action: string) => {
    switch (action) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'commented on':
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      case 'created':
        return <FileText className="h-4 w-4 text-purple-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start gap-4 p-2 rounded-md">
            <div className="h-8 w-8 bg-muted rounded-full"></div>
            <div className="space-y-1 flex-1">
              <div className="h-4 w-3/4 bg-muted rounded"></div>
              <div className="h-3 w-1/4 bg-muted rounded"></div>
            </div>
          </div>
        ))}
        <div className="h-9 w-full bg-muted rounded"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <Link href={activity.link} key={activity.id}>
          <div className="flex items-start gap-4 p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer">
            <Avatar className="h-8 w-8">
              <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
              <AvatarFallback>{activity.user.initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-1">
                {activity.icon}
                <p className="text-sm">
                  <span className="font-medium">{activity.user.name}</span>{" "}
                  <span className="text-muted-foreground">{activity.action}</span>{" "}
                  <span className="font-medium">{activity.task}</span>
                </p>
              </div>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
          </div>
        </Link>
      ))}

      <Link href="/activity">
        <Button variant="ghost" size="sm" className="w-full mt-2">
          View all activity
        </Button>
      </Link>
    </div>
  )
}

