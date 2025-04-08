"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Paperclip, Send, User, Users, X, Minimize2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { User as UserType } from "@/lib/types"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

interface Message {
  id: string
  content: string
  sender: {
    id: string
    name: string
    avatar: string
  }
  timestamp: Date
  status: "sending" | "sent" | "delivered" | "read"
  attachments?: {
    type: "image" | "file" | "audio"
    url: string
    name: string
    size?: string
  }[]
}

interface ChatInterfaceProps {
  currentUser: UserType
  teamId?: string
  initialMinimized?: boolean
  onClose?: () => void
  isDemoMode?: boolean
}

export function ChatInterface({ currentUser, teamId, initialMinimized = false, onClose, isDemoMode = false }: ChatInterfaceProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [activeTab, setActiveTab] = useState("team")
  const [isMinimized, setIsMinimized] = useState(initialMinimized)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Mock team members
  const teamMembers = [
    {
      id: "1",
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=100&width=100&text=AJ",
      status: "online",
      lastSeen: new Date(),
    },
    {
      id: "2",
      name: "Sarah Williams",
      avatar: "/placeholder.svg?height=100&width=100&text=SW",
      status: "offline",
      lastSeen: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: "3",
      name: "Michael Chen",
      avatar: "/placeholder.svg?height=100&width=100&text=MC",
      status: "online",
      lastSeen: new Date(),
    },
  ]

  // Load initial messages
  useEffect(() => {
    // Simulate loading messages from an API
    const mockMessages: Message[] = [
      {
        id: "1",
        content: "Hi team! I've just updated the homepage design. Can you take a look?",
        sender: {
          id: "1",
          name: "Alex Johnson",
          avatar: "/placeholder.svg?height=100&width=100&text=AJ",
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        status: "read",
      },
      {
        id: "2",
        content: "Looks great! I especially like the new color scheme.",
        sender: {
          id: "2",
          name: "Sarah Williams",
          avatar: "/placeholder.svg?height=100&width=100&text=SW",
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5), // 1.5 hours ago
        status: "read",
      },
      {
        id: "3",
        content: "I've added the wireframes for the new feature we discussed yesterday.",
        sender: {
          id: "3",
          name: "Michael Chen",
          avatar: "/placeholder.svg?height=100&width=100&text=MC",
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        status: "read",
        attachments: [
          {
            type: "image",
            url: "/placeholder.svg?height=300&width=400&text=Wireframe",
            name: "wireframe.png",
            size: "1.2 MB",
          },
        ],
      },
    ]

    setMessages(mockMessages)
  }, [teamId])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Simulate typing indicator
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].sender.id !== currentUser.id) {
      const timeout = setTimeout(() => {
        setIsTyping(true)

        // Simulate a response after typing
        const responseTimeout = setTimeout(() => {
          setIsTyping(false)

          const newMsg: Message = {
            id: `msg-${Date.now()}`,
            content: "Thanks for the update! I'll check it out soon.",
            sender: teamMembers[Math.floor(Math.random() * teamMembers.length)],
            timestamp: new Date(),
            status: "sent",
          }

          setMessages((prev) => [...prev, newMsg])
        }, 3000)

        return () => clearTimeout(responseTimeout)
      }, 10000)

      return () => clearTimeout(timeout)
    }
  }, [messages, currentUser.id])

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      content: newMessage,
      sender: {
        id: currentUser.id,
        name: currentUser.name || "User",
        avatar: currentUser.avatar || "/placeholder.svg",
      },
      timestamp: new Date(),
      status: "sending",
    }

    setMessages((prev) => [...prev, newMsg])
    setNewMessage("")

    // Focus back on input
    inputRef.current?.focus()

    // Simulate message being sent and delivered
    setTimeout(() => {
      setMessages((prev) => prev.map((msg) => (msg.id === newMsg.id ? { ...msg, status: "sent" } : msg)))

      setTimeout(() => {
        setMessages((prev) => prev.map((msg) => (msg.id === newMsg.id ? { ...msg, status: "delivered" } : msg)))

        setTimeout(() => {
          setMessages((prev) => prev.map((msg) => (msg.id === newMsg.id ? { ...msg, status: "read" } : msg)))
          
          // Show demo mode notification if applicable
          if (isDemoMode && !session?.user) {
            toast.success("Message sent (Demo Mode)", {
              description: "Your message has been sent in demo mode",
              duration: 3000,
            })
          }
        }, 1000)
      }, 1000)
    }, 1000)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sending":
        return "·"
      case "sent":
        return "✓"
      case "delivered":
        return "✓✓"
      case "read":
        return <span className="text-blue-500">✓✓</span>
      default:
        return ""
    }
  }

  if (isMinimized) {
    return (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Button
          onClick={() => setIsMinimized(false)}
          className="rounded-full h-14 w-14 shadow-lg bg-primary hover:bg-primary/90"
        >
          <Users className="h-6 w-6" />
        </Button>
      </motion.div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="fixed bottom-4 right-4 z-50 w-80 sm:w-96 shadow-xl"
      >
        <Card className="border-primary/20">
          <CardHeader className="p-3 border-b flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-medium">Team Chat</CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsMinimized(true)}>
                <Minimize2 className="h-4 w-4" />
              </Button>
              {onClose && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>

          <Tabs defaultValue="team" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full rounded-none border-b">
              <TabsTrigger value="team" className="flex-1">
                Team
              </TabsTrigger>
              <TabsTrigger value="direct" className="flex-1">
                Direct
              </TabsTrigger>
              <TabsTrigger value="members" className="flex-1">
                Members
              </TabsTrigger>
            </TabsList>

            <TabsContent value="team" className="m-0">
              <ScrollArea className="h-80">
                <div className="p-3 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender.id === currentUser.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex ${message.sender.id === currentUser.id ? "flex-row-reverse" : "flex-row"} gap-2 max-w-[80%]`}
                      >
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                          <AvatarFallback>
                            {message.sender.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <div
                            className={`rounded-lg p-3 ${
                              message.sender.id === currentUser.id ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                          >
                            {message.sender.id !== currentUser.id && (
                              <p className="text-xs font-medium mb-1">{message.sender.name}</p>
                            )}
                            <p className="text-sm">{message.content}</p>

                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {message.attachments.map((attachment, index) => (
                                  <div key={index} className="rounded overflow-hidden">
                                    {attachment.type === "image" && (
                                      <img
                                        src={attachment.url || "/placeholder.svg"}
                                        alt={attachment.name}
                                        className="max-w-full h-auto rounded"
                                      />
                                    )}
                                    {attachment.type === "file" && (
                                      <div className="bg-background/10 p-2 rounded flex items-center gap-2">
                                        <Paperclip className="h-4 w-4" />
                                        <div>
                                          <p className="text-xs font-medium">{attachment.name}</p>
                                          {attachment.size && <p className="text-xs opacity-70">{attachment.size}</p>}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div
                            className={`flex text-xs text-muted-foreground mt-1 ${
                              message.sender.id === currentUser.id ? "justify-end" : "justify-start"
                            }`}
                          >
                            <span>{formatTime(message.timestamp)}</span>
                            {message.sender.id === currentUser.id && (
                              <span className="ml-1">{getStatusIcon(message.status)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex flex-row gap-2 max-w-[80%]">
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarImage src={teamMembers[0].avatar} alt={teamMembers[0].name} />
                          <AvatarFallback>
                            {teamMembers[0].name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>

                        <div className="rounded-lg p-3 bg-muted">
                          <div className="flex space-x-1">
                            <div
                              className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            ></div>
                            <div
                              className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            ></div>
                            <div
                              className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce"
                              style={{ animationDelay: "600ms" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <CardFooter className="p-3 border-t flex gap-2">
                <Input
                  ref={inputRef}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  className="flex-1"
                />
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9"
                    onClick={() => {
                      if (isDemoMode && !session?.user) {
                        toast.info("File attachment (Demo Mode)", {
                          description: "File attachment is simulated in demo mode",
                          duration: 3000,
                        })
                      }
                    }}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button onClick={handleSendMessage} className="h-9 w-9 p-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
              {isDemoMode && !session?.user && (
                <div className="px-3 pb-2 text-xs text-muted-foreground text-center">
                  Demo Mode: Messages will not be saved
                </div>
              )}
            </TabsContent>

            <TabsContent value="direct" className="m-0">
              <div className="h-80 flex items-center justify-center">
                <div className="text-center p-4">
                  <User className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <h3 className="font-medium">Direct Messages</h3>
                  <p className="text-sm text-muted-foreground">Select a team member to start a conversation</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="members" className="m-0">
              <ScrollArea className="h-80">
                <div className="p-3 space-y-2">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer"
                      onClick={() => {
                        if (isDemoMode && !session?.user) {
                          toast.info("Direct message (Demo Mode)", {
                            description: "Direct messaging is simulated in demo mode",
                            duration: 3000,
                          })
                        }
                      }}
                    >
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                            member.status === "online" ? "bg-green-500" : "bg-gray-400"
                          }`}
                        ></div>
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {member.status === "online"
                            ? "Online"
                            : `Last seen ${new Date(member.lastSeen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

