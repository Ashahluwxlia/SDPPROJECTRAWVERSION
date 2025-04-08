"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, Users, CheckSquare } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

interface SearchResultsProps {
  query: string
  isDemoMode?: boolean
}

export function SearchResults({ query, isDemoMode = false }: SearchResultsProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [results, setResults] = useState<any>({
    tasks: [],
    boards: [],
    documents: [],
    people: [],
  })

  useEffect(() => {
    // Simulate loading
    setIsLoading(true)

    // Mock search results
    const mockSearch = setTimeout(() => {
      if (!query) {
        setResults({
          tasks: [],
          boards: [],
          documents: [],
          people: [],
        })
        setIsLoading(false)
        return
      }

      setResults({
        tasks: [
          {
            id: 1,
            title: `Design ${query} UI Components`,
            status: "In Progress",
            dueDate: "Apr 15",
            assignee: "Alex Kim",
          },
          {
            id: 2,
            title: `Implement ${query} API Integration`,
            status: "To Do",
            dueDate: "Apr 20",
            assignee: "Sarah Chen",
          },
          {
            id: 3,
            title: `Test ${query} Functionality`,
            status: "In Review",
            dueDate: "Apr 18",
            assignee: "Jordan Lee",
          },
        ],
        boards: [
          { id: 1, title: `${query} Development`, description: "Main development board", members: 5 },
          { id: 2, title: `${query} Marketing Campaign`, description: "Campaign planning and execution", members: 3 },
        ],
        documents: [
          {
            id: 1,
            title: `${query} Requirements Doc`,
            type: "Google Doc",
            lastUpdated: "2 days ago",
            author: "Taylor Swift",
          },
          { id: 2, title: `${query} Design System`, type: "Figma", lastUpdated: "Yesterday", author: "David Kim" },
        ],
        people: [
          { id: 1, name: "Alex Kim", role: "UI Designer", avatar: "/placeholder.svg" },
          { id: 2, name: "Sarah Chen", role: "Frontend Developer", avatar: "/placeholder.svg" },
        ],
      })
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(mockSearch)
  }, [query])

  const totalResults = results.tasks.length + results.boards.length + results.documents.length + results.people.length

  const handleItemClick = (type: string, id: number) => {
    if (isDemoMode && !session) {
      toast.success(`Viewing ${type} in demo mode`)
    }
    
    // In a real app, this would navigate to the actual item
    // For demo mode, we'll just show a toast
    if (!isDemoMode || session) {
      switch (type) {
        case "task":
          router.push(`/board/1?task=${id}`)
          break
        case "board":
          router.push(`/board/${id}`)
          break
        case "document":
          router.push(`/documents/${id}`)
          break
        case "person":
          router.push(`/team/members/${id}`)
          break
      }
    }
  }

  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-medium mb-2">Enter a search term</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Search for tasks, boards, documents, or team members to find what you need.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return <SearchResultsSkeleton />
  }

  if (totalResults === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-medium mb-2">No results found</h2>
        <p className="text-muted-foreground text-center max-w-md">
          We couldn't find any matches for "{query}". Try adjusting your search terms.
        </p>
      </div>
    )
  }

  return (
    <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="all">All ({totalResults})</TabsTrigger>
        <TabsTrigger value="tasks">Tasks ({results.tasks.length})</TabsTrigger>
        <TabsTrigger value="boards">Boards ({results.boards.length})</TabsTrigger>
        <TabsTrigger value="documents">Documents ({results.documents.length})</TabsTrigger>
        <TabsTrigger value="people">People ({results.people.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-6">
        {results.tasks.length > 0 && (
          <div>
            <h2 className="text-lg font-medium mb-3 flex items-center">
              <CheckSquare className="mr-2 h-5 w-5" /> Tasks
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {results.tasks.slice(0, 2).map((task: any) => (
                <Card
                  key={task.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleItemClick("task", task.id)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{task.title}</CardTitle>
                    <CardDescription>Due {task.dueDate}</CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-2 flex justify-between">
                    <Badge
                      variant={
                        task.status === "In Progress" ? "default" : task.status === "To Do" ? "outline" : "secondary"
                      }
                    >
                      {task.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{task.assignee}</span>
                  </CardFooter>
                </Card>
              ))}
            </div>
            {results.tasks.length > 2 && (
              <Button variant="link" className="mt-2 p-0" onClick={() => setActiveTab("tasks")}>
                View all {results.tasks.length} tasks
              </Button>
            )}
          </div>
        )}

        {/* Similar sections for boards, documents, and people */}
        {/* Boards section */}
        {results.boards.length > 0 && (
          <div>
            <h2 className="text-lg font-medium mb-3 flex items-center">
              <Users className="mr-2 h-5 w-5" /> Boards
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {results.boards.slice(0, 2).map((board: any) => (
                <Card
                  key={board.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleItemClick("board", board.id)}
                >
                  <CardHeader>
                    <CardTitle className="text-base">{board.title}</CardTitle>
                    <CardDescription>{board.description}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <span className="text-sm text-muted-foreground">{board.members} members</span>
                  </CardFooter>
                </Card>
              ))}
            </div>
            {results.boards.length > 2 && (
              <Button variant="link" className="mt-2 p-0" onClick={() => setActiveTab("boards")}>
                View all {results.boards.length} boards
              </Button>
            )}
          </div>
        )}

        {/* People section */}
        {results.people.length > 0 && (
          <div>
            <h2 className="text-lg font-medium mb-3 flex items-center">
              <Users className="mr-2 h-5 w-5" /> People
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {results.people.map((person: any) => (
                <Card
                  key={person.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleItemClick("person", person.id)}
                >
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <Avatar>
                      <AvatarImage src={person.avatar} alt={person.name} />
                      <AvatarFallback>
                        {person.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{person.name}</CardTitle>
                      <CardDescription>{person.role}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="tasks">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {results.tasks.map((task: any) => (
            <Card
              key={task.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleItemClick("task", task.id)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{task.title}</CardTitle>
                <CardDescription>Due {task.dueDate}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-2 flex justify-between">
                <Badge
                  variant={
                    task.status === "In Progress" ? "default" : task.status === "To Do" ? "outline" : "secondary"
                  }
                >
                  {task.status}
                </Badge>
                <span className="text-sm text-muted-foreground">{task.assignee}</span>
              </CardFooter>
            </Card>
          ))}
        </div>
      </TabsContent>

      {/* Similar content for other tabs */}
      <TabsContent value="boards">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {results.boards.map((board: any) => (
            <Card
              key={board.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleItemClick("board", board.id)}
            >
              <CardHeader>
                <CardTitle className="text-base">{board.title}</CardTitle>
                <CardDescription>{board.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <span className="text-sm text-muted-foreground">{board.members} members</span>
              </CardFooter>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="documents">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {results.documents.map((doc: any) => (
            <Card
              key={doc.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleItemClick("document", doc.id)}
            >
              <CardHeader>
                <CardTitle className="text-base">{doc.title}</CardTitle>
                <CardDescription>{doc.type}</CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between">
                <span className="text-sm text-muted-foreground">By {doc.author}</span>
                <span className="text-sm text-muted-foreground">{doc.lastUpdated}</span>
              </CardFooter>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="people">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {results.people.map((person: any) => (
            <Card
              key={person.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleItemClick("person", person.id)}
            >
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar>
                  <AvatarImage src={person.avatar} alt={person.name} />
                  <AvatarFallback>
                    {person.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{person.name}</CardTitle>
                  <CardDescription>{person.role}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </TabsContent>

      {/* Demo mode indicator */}
      {isDemoMode && !session && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-md shadow-lg">
          Demo Mode: Search results are simulated
        </div>
      )}
    </Tabs>
  )
}

function SearchResultsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-7 w-32 mb-3" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[140px] w-full rounded-lg" />
          <Skeleton className="h-[140px] w-full rounded-lg" />
        </div>
      </div>
      <div>
        <Skeleton className="h-7 w-32 mb-3" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[140px] w-full rounded-lg" />
          <Skeleton className="h-[140px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}

