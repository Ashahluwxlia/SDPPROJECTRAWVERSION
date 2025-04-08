"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Download, Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useSession } from "next-auth/react"
import { toast } from "@/components/ui/use-toast"

export function ExportReports() {
  const { data: session } = useSession()
  const [reportType, setReportType] = useState("tasks")
  const [dateRange, setDateRange] = useState("last30days")
  const [format, setFormat] = useState("csv")
  const [isExporting, setIsExporting] = useState(false)
  const [includeOptions, setIncludeOptions] = useState({
    taskDetails: true,
    comments: true,
    attachments: false,
    history: true,
  })

  const handleExport = async () => {
    setIsExporting(true)

    try {
      if (session?.user) {
        // In a real app, this would call an API to generate the report
        const response = await fetch('/api/reports/export', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reportType,
            dateRange,
            format,
            includeOptions,
          }),
        })

        if (response.ok) {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          const fileName = `${reportType}-report-${new Date().toISOString().split("T")[0]}.${format}`
          a.href = url
          a.download = fileName
          a.click()
          window.URL.revokeObjectURL(url)
          
          toast({
            title: "Report exported",
            description: `Your ${reportType} report has been downloaded.`,
          })
        } else {
          throw new Error('Failed to export report')
        }
      } else {
        // Demo mode - simulate export process
        setTimeout(() => {
          // Simulate download
          const a = document.createElement("a")
          const fileName = `${reportType}-report-${new Date().toISOString().split("T")[0]}.${format}`
          a.href = "#"
          a.download = fileName
          a.click()
          
          toast({
            title: "Demo report exported",
            description: `Your ${reportType} report has been downloaded (demo mode).`,
          })
        }, 2000)
      }
    } catch (error) {
      console.error('Error exporting report:', error)
      toast({
        title: "Export failed",
        description: "There was an error exporting your report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleIncludeOptionChange = (option: string, checked: boolean) => {
    setIncludeOptions({
      ...includeOptions,
      [option]: checked,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Reports</CardTitle>
        <CardDescription>
          {session?.user 
            ? "Generate and download reports for your tasks and team activity" 
            : "Demo mode: Generate and download sample reports"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Report Type</Label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tasks">Tasks Report</SelectItem>
              <SelectItem value="users">User Activity Report</SelectItem>
              <SelectItem value="completion">Task Completion Report</SelectItem>
              <SelectItem value="overdue">Overdue Tasks Report</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Date Range</Label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger>
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="last7days">Last 7 Days</SelectItem>
              <SelectItem value="last30days">Last 30 Days</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label>Include in Report</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="taskDetails"
                checked={includeOptions.taskDetails}
                onCheckedChange={(checked) => handleIncludeOptionChange("taskDetails", checked as boolean)}
              />
              <Label htmlFor="taskDetails">Task Details</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="comments"
                checked={includeOptions.comments}
                onCheckedChange={(checked) => handleIncludeOptionChange("comments", checked as boolean)}
              />
              <Label htmlFor="comments">Comments</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="attachments"
                checked={includeOptions.attachments}
                onCheckedChange={(checked) => handleIncludeOptionChange("attachments", checked as boolean)}
              />
              <Label htmlFor="attachments">Attachments</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="history"
                checked={includeOptions.history}
                onCheckedChange={(checked) => handleIncludeOptionChange("history", checked as boolean)}
              />
              <Label htmlFor="history">Task History</Label>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label>Export Format</Label>
          <RadioGroup value={format} onValueChange={setFormat} className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="csv" id="csv" />
              <Label htmlFor="csv">CSV</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pdf" id="pdf" />
              <Label htmlFor="pdf">PDF</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="json" id="json" />
              <Label htmlFor="json">JSON</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleExport} disabled={isExporting} className="w-full">
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Report...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" /> Export Report
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

