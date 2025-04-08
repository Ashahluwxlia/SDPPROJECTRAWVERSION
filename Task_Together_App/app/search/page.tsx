"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, SearchIcon, Tag, CheckCircle, AlertCircle } from "lucide-react"
import { VirtualizedList } from "@/components/virtualized-list"
import { format } from "date-fns"

interface SearchResult {
  id: string
  title: string
  description: string | null
  priority: string | null
  dueDate: string | null
  listId: string
  listName: string
  boardId: string
  boardName: string
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""

  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)

  const performSearch = async (searchQuery: string, pageNum = 1, append = false) => {
    if (!searchQuery.trim()) {
      setResults([])
      setTotal(0)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&page=${pageNum}&limit=20`)

      if (!response.ok) {
        throw new Error("Search failed")
      }

      const data = await response.json()

      if (append) {
        setResults((prev) => [...prev, ...data.tasks])
      } else {
        setResults(data.tasks)
      }

      setTotal(data.total)
      setHasMore(pageNum < data.pages)
    } catch (error) {
      console.error("Search error:", error)
      setError("An error occurred while searching. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery)
    }
  }, [initialQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    performSearch(query)
  }

  const loadMore = () => {
    if (isLoading || !hasMore) return

    const nextPage = page + 1
    setPage(nextPage)
    performSearch(query, nextPage, true)
  }

  const getPriorityBadge = (priority: string | null) => {
    if (!priority) return null

    const colors: Record<string, string> = {
      Low: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      High: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      Critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    }

    return (
      <Badge variant="outline" className={colors[priority] || ""}>
        {priority === "High" || priority === "Critical" ? <AlertCircle className="h-3 w-3 mr-1" /> : null}
        {priority}
      </Badge>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Search</h1>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tasks, boards, and more..."
              className="pl-10 py-6 text-lg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </form>

        {isLoading && page === 1 ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
            <p className="mt-2 text-muted-foreground">Searching...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
            <Button onClick={() => performSearch(query)} className="mt-4">
              Try Again
            </Button>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-medium mb-2">No results found</h2>
            <p className="text-muted-foreground">
              {initialQuery
                ? `No results found for "${initialQuery}". Try a different search term.`
                : "Enter a search term to find tasks, boards, and more."}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-muted-foreground">
                Found {total} result{total !== 1 ? "s" : ""} for "{query}"
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Search Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <VirtualizedList
                    items={results}
                    itemHeight={120}
                    className="max-h-[600px]"
                    onEndReached={loadMore}
                    renderItem={(result: SearchResult) => (
                      <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <Link
                            href={`/board/${result.boardId}?task=${result.id}`}
                            className="text-lg font-medium hover:underline"
                          >
                            {result.title}
                          </Link>
                          {getPriorityBadge(result.priority)}
                        </div>

                        {result.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {result.description.replace(/<[^>]*>/g, " ")}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2 text-sm">
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {result.listName}
                          </Badge>

                          <Badge variant="outline" className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {result.boardName}
                          </Badge>

                          {result.dueDate && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(result.dueDate), "MMM d, yyyy")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  />

                  {isLoading && page > 1 && (
                    <div className="text-center py-4">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
                      <p className="mt-2 text-sm text-muted-foreground">Loading more results</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

