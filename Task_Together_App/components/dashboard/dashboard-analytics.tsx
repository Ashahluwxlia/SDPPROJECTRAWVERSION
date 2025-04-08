"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Download } from "lucide-react"
import { useSession } from "next-auth/react"
import { toast } from "@/components/ui/use-toast"

// Mock data for the charts
const demoTaskCompletionData = [
  { name: "Mon", completed: 5 },
  { name: "Tue", completed: 8 },
  { name: "Wed", completed: 12 },
  { name: "Thu", completed: 7 },
  { name: "Fri", completed: 10 },
  { name: "Sat", completed: 3 },
  { name: "Sun", completed: 2 },
]

const demoTasksByPriorityData = [
  { name: "Critical", value: 8, color: "#c084fc" },
  { name: "High", value: 15, color: "#f87171" },
  { name: "Medium", value: 22, color: "#facc15" },
  { name: "Low", value: 18, color: "#4ade80" },
]

const demoTasksByStatusData = [
  { name: "To-Do", value: 18, color: "#60a5fa" },
  { name: "In Progress", value: 12, color: "#facc15" },
  { name: "Review", value: 8, color: "#c084fc" },
  { name: "Completed", value: 25, color: "#4ade80" },
]

export function DashboardAnalytics() {
  const { data: session } = useSession()
  const [period, setPeriod] = useState("week")
  const [isLoading, setIsLoading] = useState(true)
  const [taskCompletionData, setTaskCompletionData] = useState(demoTaskCompletionData)
  const [tasksByPriorityData, setTasksByPriorityData] = useState(demoTasksByPriorityData)
  const [tasksByStatusData, setTasksByStatusData] = useState(demoTasksByStatusData)
  const [summaryData, setSummaryData] = useState({
    totalTasks: 63,
    completed: 25,
    overdue: 8,
    completionRate: 40,
  })

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true)
      
      if (session?.user) {
        try {
          // In a real app, this would fetch data from your API
          const response = await fetch(`/api/analytics?period=${period}`)
          if (response.ok) {
            const data = await response.json()
            setTaskCompletionData(data.taskCompletion || demoTaskCompletionData)
            setTasksByPriorityData(data.tasksByPriority || demoTasksByPriorityData)
            setTasksByStatusData(data.tasksByStatus || demoTasksByStatusData)
            setSummaryData(data.summary || {
              totalTasks: 63,
              completed: 25,
              overdue: 8,
              completionRate: 40,
            })
          } else {
            // Fallback to demo data if API fails
            setTaskCompletionData(demoTaskCompletionData)
            setTasksByPriorityData(demoTasksByPriorityData)
            setTasksByStatusData(demoTasksByStatusData)
          }
        } catch (error) {
          console.error('Error fetching analytics data:', error)
          // Fallback to demo data on error
          setTaskCompletionData(demoTaskCompletionData)
          setTasksByPriorityData(demoTasksByPriorityData)
          setTasksByStatusData(demoTasksByStatusData)
        }
      } else {
        // Use demo data for non-authenticated users
        setTaskCompletionData(demoTaskCompletionData)
        setTasksByPriorityData(demoTasksByPriorityData)
        setTasksByStatusData(demoTasksByStatusData)
      }
      
      setIsLoading(false)
    }

    fetchAnalyticsData()
  }, [session, period])

  const handleExport = async () => {
    try {
      if (session?.user) {
        // In a real app, this would call an API to export the analytics
        const response = await fetch('/api/analytics/export', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ period }),
        })

        if (response.ok) {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `analytics-${period}-${new Date().toISOString().split("T")[0]}.csv`
          a.click()
          window.URL.revokeObjectURL(url)
          
          toast({
            title: "Analytics exported",
            description: `Your analytics data has been downloaded.`,
          })
        } else {
          throw new Error('Failed to export analytics')
        }
      } else {
        // Demo mode - simulate export
        toast({
          title: "Demo export",
          description: "In demo mode, this would export your analytics data.",
        })
      }
    } catch (error) {
      console.error('Error exporting analytics:', error)
      toast({
        title: "Export failed",
        description: "There was an error exporting your analytics. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="flex justify-end gap-2">
          <div className="h-9 w-[120px] bg-muted rounded"></div>
          <div className="h-9 w-20 bg-muted rounded"></div>
        </div>
        <div className="h-8 w-40 bg-muted rounded"></div>
        <div className="h-80 w-full bg-muted rounded"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-end gap-2 mb-4">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" /> Export
        </Button>
      </div>

      <Tabs defaultValue="completion">
        <TabsList className="mb-4">
          <TabsTrigger value="completion">Task Completion</TabsTrigger>
          <TabsTrigger value="priority">By Priority</TabsTrigger>
          <TabsTrigger value="status">By Status</TabsTrigger>
        </TabsList>

        <TabsContent value="completion" className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={taskCompletionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="priority" className="h-80">
          <div className="flex items-center justify-center h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tasksByPriorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {tasksByPriorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="status" className="h-80">
          <div className="flex items-center justify-center h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tasksByStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {tasksByStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-muted/50 p-3 rounded-md">
          <div className="text-sm text-muted-foreground">Total Tasks</div>
          <div className="text-2xl font-bold">{summaryData.totalTasks}</div>
        </div>
        <div className="bg-muted/50 p-3 rounded-md">
          <div className="text-sm text-muted-foreground">Completed</div>
          <div className="text-2xl font-bold">{summaryData.completed}</div>
        </div>
        <div className="bg-muted/50 p-3 rounded-md">
          <div className="text-sm text-muted-foreground">Overdue</div>
          <div className="text-2xl font-bold text-red-500">{summaryData.overdue}</div>
        </div>
        <div className="bg-muted/50 p-3 rounded-md">
          <div className="text-sm text-muted-foreground">Completion Rate</div>
          <div className="text-2xl font-bold text-green-500">{summaryData.completionRate}%</div>
        </div>
      </div>
    </div>
  )
}

