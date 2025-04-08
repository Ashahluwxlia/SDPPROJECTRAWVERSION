"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addDays, subDays, format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns"
import { motion } from "framer-motion"
import { useSession } from "next-auth/react"

// Mock data for the heatmap
const generateDemoData = () => {
  const today = new Date()
  const startDate = subDays(today, 364) // Last 365 days
  const data: Record<string, number> = {}

  for (let i = 0; i < 365; i++) {
    const date = addDays(startDate, i)
    const dateStr = format(date, "yyyy-MM-dd")

    // Random value between 0 and 4
    const value = Math.floor(Math.random() * 5)

    if (value > 0) {
      data[dateStr] = value
    }
  }

  return data
}

export function ActivityHeatmap() {
  const { data: session } = useSession()
  const [period, setPeriod] = useState("year")
  const [activityData, setActivityData] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchActivityData = async () => {
      setIsLoading(true)
      
      if (session?.user) {
        try {
          // In a real app, this would fetch data from your API
          const response = await fetch(`/api/activity/heatmap?period=${period}`)
          if (response.ok) {
            const data = await response.json()
            setActivityData(data)
          } else {
            // Fallback to demo data if API fails
            setActivityData(generateDemoData())
          }
        } catch (error) {
          console.error('Error fetching activity data:', error)
          // Fallback to demo data on error
          setActivityData(generateDemoData())
        }
      } else {
        // Use demo data for non-authenticated users
        setActivityData(generateDemoData())
      }
      
      setIsLoading(false)
    }

    fetchActivityData()
  }, [session, period])

  // Generate weeks for the heatmap
  const generateWeeks = () => {
    const today = new Date()
    const startDate = subDays(today, 364)
    const endDate = today

    const weeks: Date[][] = []
    let currentWeekStart = startOfWeek(startDate, { weekStartsOn: 1 }) // Monday

    while (currentWeekStart <= endDate) {
      const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 })
      const week = eachDayOfInterval({ start: currentWeekStart, end: weekEnd })
      weeks.push(week)
      currentWeekStart = addDays(weekEnd, 1)
    }

    return weeks
  }

  const weeks = generateWeeks()

  // Get color class based on activity value
  const getColorClass = (value: number) => {
    if (value === 0) return "bg-muted"
    if (value === 1) return "bg-green-100 dark:bg-green-900/30"
    if (value === 2) return "bg-green-200 dark:bg-green-800/40"
    if (value === 3) return "bg-green-300 dark:bg-green-700/60"
    return "bg-green-400 dark:bg-green-600/80"
  }

  // Get activity value for a date
  const getActivityValue = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    return activityData[dateStr] || 0
  }

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <div className="h-6 w-40 bg-muted rounded"></div>
            <div className="h-4 w-60 bg-muted rounded mt-1"></div>
          </div>
          <div className="h-9 w-[120px] bg-muted rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="h-40 w-full bg-muted rounded"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Activity Heatmap</CardTitle>
          <CardDescription>
            {session?.user 
              ? "Your task activity over time" 
              : "Demo: Sample task activity over time"}
          </CardDescription>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="quarter">Last Quarter</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          <div className="flex mb-2">
            <div className="w-8"></div>
            <div className="flex justify-between flex-1 text-xs text-muted-foreground">
              <div>Mon</div>
              <div>Wed</div>
              <div>Fri</div>
            </div>
          </div>

          <div className="flex flex-wrap">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex mb-1">
                {weekIndex % 4 === 0 && (
                  <div className="w-8 text-xs text-muted-foreground flex items-center justify-end pr-2">
                    {format(week[0], "MMM")}
                  </div>
                )}
                {weekIndex % 4 !== 0 && <div className="w-8"></div>}

                <div className="flex gap-1">
                  {week.map((day, dayIndex) => {
                    const value = getActivityValue(day)
                    return (
                      <motion.div
                        key={dayIndex}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: weekIndex * 0.01 + dayIndex * 0.01 }}
                        className={`w-3 h-3 rounded-sm ${getColorClass(value)}`}
                        title={`${format(day, "MMM d, yyyy")}: ${value} activities`}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end mt-4">
            <div className="text-xs text-muted-foreground mr-2">Less</div>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-muted"></div>
              <div className="w-3 h-3 rounded-sm bg-green-100 dark:bg-green-900/30"></div>
              <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-800/40"></div>
              <div className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-700/60"></div>
              <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-600/80"></div>
            </div>
            <div className="text-xs text-muted-foreground ml-2">More</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

