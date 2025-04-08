"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createBoard } from "@/lib/board-actions"
import { toast } from "@/components/ui/use-toast"

export default function NewBoardPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [background, setBackground] = useState("")

  const handleCreateBoard = async () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("background", background);
      
      const result = await createBoard(formData);

      if (result.success && result.boardId) {
        toast({
          title: "Board created",
          description: `Successfully created board "${name}"`,
        })
        router.push(`/board/${result.boardId}`)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create board",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create New Board</h1>

      <Card>
        <CardHeader>
          <CardTitle>Board Details</CardTitle>
          <CardDescription>Create a new board to organize your tasks.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Board Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter board name" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the purpose of this board"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="background">Background (optional)</Label>
            <Input
              id="background"
              type="color"
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              defaultValue="#f5f5f5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team">Team</Label>
            <Select>
              <SelectTrigger id="team">
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="design">Design Team</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={handleCreateBoard} disabled={isPending}>
            Create Board
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

