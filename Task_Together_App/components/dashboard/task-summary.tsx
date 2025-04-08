"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ArrowDown, ArrowUp, CheckCircle, Clock, AlertTriangle, Calendar } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

interface TaskSummaryData {
  completed: number
  inProgress: number
  overdue: number
  upcoming: number
  totalTasks: number
  completionRate: number
}

export default function TaskSummary() {
  const { data: session } = useSession()
  const [taskData, setTaskData] = useState<TaskSummaryData>({
    completed: 0,
    inProgress: 0,
    overdue: 0,
    upcoming: 0,
    totalTasks: 0,
    completionRate: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  // Demo data for non-authenticated users
  const demoData = {
    completed: 24,
    inProgress: 8,
    overdue: 3,
    upcoming: 5,
    totalTasks: 40,
    completionRate: 60,
  }

  useEffect(() => {
    const fetchTaskData = async () => {
      setIsLoading(true)
      
      if (session?.user) {
        try {
          // In a real app, this would fetch data from your API
          const response = await fetch('/api/tasks/summary')
          if (response.ok) {
            const data = await response.json()
            setTaskData(data)
          } else {
            // Fallback to demo data if API fails
            setTaskData(demoData)
          }
        } catch (error) {
          console.error('Error fetching task summary:', error)
          // Fallback to demo data on error
          setTaskData(demoData)
        }
      } else {
        // Use demo data for non-authenticated users
        setTaskData(demoData)
      }
      
      setIsLoading(false)
    }

    fetchTaskData()
  }, [session])

  if (isLoading) {
    return <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-muted/20">
            <CardContent className="p-4">
              <div className="h-5 w-5 bg-muted rounded-full mb-2"></div>
              <div className="h-4 w-20 bg-muted rounded mb-2"></div>
              <div className="h-8 w-12 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6">
        <div className="h-4 w-40 bg-muted rounded mb-2"></div>
        <div className="h-2 w-full bg-muted rounded"></div>
      </div>
    </div>
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium text-green-500 flex items-center">
                <ArrowUp className="h-3 w-3 mr-1" />
                +12%
              </span>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Completed</h3>
            <p className="text-2xl font-bold">{taskData.completed}</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span className="text-xs font-medium text-blue-500 flex items-center">
                <ArrowUp className="h-3 w-3 mr-1" />
                +5%
              </span>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">In Progress</h3>
            <p className="text-2xl font-bold">{taskData.inProgress}</p>
          </CardContent>
        </Card>

        <Card className="bg-red-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-xs font-medium text-red-500 flex items-center">
                <ArrowDown className="h-3 w-3 mr-1" />
                -8%
              </span>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Overdue</h3>
            <p className="text-2xl font-bold">{taskData.overdue}</p>
          </CardContent>
        </Card>

        <Card className="bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-5 w-5 text-amber-500" />
              <span className="text-xs font-medium text-amber-500 flex items-center">
                <ArrowUp className="h-3 w-3 mr-1" />
                +3%
              </span>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Upcoming</h3>
            <p className="text-2xl font-bold">{taskData.upcoming}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">Overall Completion</h3>
          <span className="text-sm font-medium">{taskData.completionRate}%</span>
        </div>
        <Progress value={taskData.completionRate} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">
          {taskData.completed} of {taskData.totalTasks} tasks completed
        </p>
      </div>
    </div>
  )
}

