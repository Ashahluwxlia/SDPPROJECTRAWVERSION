"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  Star,
  InboxIcon,
  Send,
  Archive,
  Trash2,
  Tag,
  Filter,
  Plus,
  MoreHorizontal,
  ChevronLeft,
  Reply,
  Forward,
  Paperclip,
  Download,
  X,
} from "lucide-react"
import { motion } from "framer-motion"
import type { User } from "@/lib/types"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

interface Email {
  id: string
  subject: string
  sender: {
    name: string
    email: string
    avatar?: string
  }
  recipients: string[]
  content: string
  date: Date
  isRead: boolean
  isStarred: boolean
  isArchived: boolean
  labels?: string[]
  attachments?: {
    name: string
    size: string
    type: string
  }[]
}

interface InboxInterfaceProps {
  currentUser: User
  isDemoMode?: boolean
}

export function InboxInterface({ currentUser, isDemoMode = false }: InboxInterfaceProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [emails, setEmails] = useState<Email[]>([])
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [activeTab, setActiveTab] = useState("inbox")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isComposing, setIsComposing] = useState(false)
  const [composeData, setComposeData] = useState({
    to: "",
    subject: "",
    message: "",
  })

  useEffect(() => {
    // Simulate loading emails
    const loadEmails = async () => {
      setIsLoading(true)

      // Mock emails data
      const mockEmails: Email[] = [
        {
          id: "1",
          subject: "Project Update: Homepage Redesign",
          sender: {
            name: "Alex Johnson",
            email: "alex@example.com",
            avatar: "https://randomuser.me/api/portraits/men/32.jpg",
          },
          recipients: [currentUser.email],
          content: `
            <p>Hi team,</p>
            <p>I've completed the initial designs for the homepage redesign. You can find the mockups attached to this email.</p>
            <p>Key changes include:</p>
            <ul>
              <li>New hero section with animated background</li>
              <li>Improved navigation layout</li>
              <li>Updated color scheme to match our new branding</li>
            </ul>
            <p>Please review and provide feedback by Friday.</p>
            <p>Best regards,<br>Alex</p>
          `,
          date: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          isRead: false,
          isStarred: true,
          isArchived: false,
          labels: ["Design", "Important"],
          attachments: [
            {
              name: "homepage-mockup.png",
              size: "2.4 MB",
              type: "image/png",
            },
            {
              name: "design-specs.pdf",
              size: "1.2 MB",
              type: "application/pdf",
            },
          ],
        },
        {
          id: "2",
          subject: "Team Meeting - Tomorrow at 10 AM",
          sender: {
            name: "Sarah Williams",
            email: "sarah@example.com",
            avatar: "https://randomuser.me/api/portraits/women/44.jpg",
          },
          recipients: [currentUser.email, "team@example.com"],
          content: `
            <p>Hello everyone,</p>
            <p>This is a reminder about our team meeting tomorrow at 10 AM in the main conference room.</p>
            <p>Agenda:</p>
            <ol>
              <li>Project status updates</li>
              <li>Q2 planning</li>
              <li>New team member introductions</li>
            </ol>
            <p>Please come prepared with your updates.</p>
            <p>Thanks,<br>Sarah</p>
          `,
          date: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
          isRead: true,
          isStarred: false,
          isArchived: false,
          labels: ["Meeting"],
        },
        {
          id: "3",
          subject: "New Task Assignment: API Integration",
          sender: {
            name: "Michael Chen",
            email: "michael@example.com",
            avatar: "https://randomuser.me/api/portraits/men/22.jpg",
          },
          recipients: [currentUser.email],
          content: `
            <p>Hi there,</p>
            <p>I've assigned you to the API integration task for the new feature. The details are in the attached document.</p>
            <p>Key requirements:</p>
            <ul>
              <li>OAuth 2.0 authentication</li>
              <li>Rate limiting implementation</li>
              <li>Error handling and logging</li>
            </ul>
            <p>The deadline is next Wednesday. Let me know if you have any questions.</p>
            <p>Regards,<br>Michael</p>
          `,
          date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          isRead: true,
          isStarred: false,
          isArchived: false,
          labels: ["Development"],
          attachments: [
            {
              name: "api-specs.docx",
              size: "845 KB",
              type: "application/docx",
            },
          ],
        },
        {
          id: "4",
          subject: "Feedback on Your Recent Presentation",
          sender: {
            name: "Emily Rodriguez",
            email: "emily@example.com",
            avatar: "https://randomuser.me/api/portraits/women/28.jpg",
          },
          recipients: [currentUser.email],
          content: `
            <p>Hello,</p>
            <p>I wanted to provide some feedback on your presentation from yesterday's client meeting.</p>
            <p>You did an excellent job explaining our approach and addressing their concerns. The client was particularly impressed with the data visualization section.</p>
            <p>For future presentations, you might want to include more case studies to support your points.</p>
            <p>Overall, great work!</p>
            <p>Best,<br>Emily</p>
          `,
          date: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
          isRead: true,
          isStarred: true,
          isArchived: false,
          labels: ["Feedback"],
        },
        {
          id: "5",
          subject: "Invoice #INV-2023-056",
          sender: {
            name: "Accounting Department",
            email: "accounting@example.com",
            avatar: "https://randomuser.me/api/portraits/men/41.jpg",
          },
          recipients: [currentUser.email],
          content: `
            <p>Dear Team Member,</p>
            <p>Please find attached the invoice for your recent equipment purchase.</p>
            <p>Invoice details:</p>
            <ul>
              <li>Invoice Number: INV-2023-056</li>
              <li>Date: ${new Date(Date.now() - 1000 * 60 * 60 * 72).toLocaleDateString()}</li>
              <li>Amount: $1,249.99</li>
              <li>Due Date: ${new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toLocaleDateString()}</li>
            </ul>
            <p>If you have any questions, please contact the accounting department.</p>
            <p>Thank you,<br>Accounting Department</p>
          `,
          date: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
          isRead: true,
          isStarred: false,
          isArchived: true,
          labels: ["Finance"],
          attachments: [
            {
              name: "invoice-2023-056.pdf",
              size: "320 KB",
              type: "application/pdf",
            },
          ],
        },
      ]

      setEmails(mockEmails)
      setIsLoading(false)
    }

    loadEmails()
  }, [currentUser.email])

  const filteredEmails = emails.filter((email) => {
    // Filter by tab
    if (activeTab === "inbox" && email.isArchived) return false
    if (activeTab === "starred" && !email.isStarred) return false
    if (activeTab === "sent") return false // No sent emails in our mock data
    if (activeTab === "archived" && !email.isArchived) return false

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        email.subject.toLowerCase().includes(query) ||
        email.sender.name.toLowerCase().includes(query) ||
        email.sender.email.toLowerCase().includes(query) ||
        email.content.toLowerCase().includes(query)
      )
    }

    return true
  })

  const handleStarEmail = (emailId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    setEmails(emails.map((email) => (email.id === emailId ? { ...email, isStarred: !email.isStarred } : email)))

    if (isDemoMode && !session) {
      toast.success("Email starred/unstarred in demo mode")
    } else {
      toast.success("Email starred/unstarred")
    }
  }

  const handleArchiveEmail = (emailId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    setEmails(emails.map((email) => (email.id === emailId ? { ...email, isArchived: !email.isArchived } : email)))

    if (isDemoMode && !session) {
      toast.success("Email archived in demo mode")
    } else {
      toast.success("Email archived")
    }

    if (selectedEmail?.id === emailId) {
      setSelectedEmail(null)
    }
  }

  const handleDeleteEmail = (emailId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    setEmails(emails.filter((email) => email.id !== emailId))

    if (isDemoMode && !session) {
      toast.success("Email deleted in demo mode")
    } else {
      toast.success("Email deleted")
    }

    if (selectedEmail?.id === emailId) {
      setSelectedEmail(null)
    }
  }

  const handleSelectEmail = (email: Email) => {
    // Mark as read when selected
    if (!email.isRead) {
      setEmails(emails.map((e) => (e.id === email.id ? { ...e, isRead: true } : e)))
    }

    setSelectedEmail(email)
  }

  const handleBackToList = () => {
    setSelectedEmail(null)
  }

  const handleComposeEmail = () => {
    setIsComposing(true)
  }

  const handleSendEmail = () => {
    if (!composeData.to || !composeData.subject) {
      toast.error("Please fill in all required fields")
      return
    }

    if (isDemoMode && !session) {
      toast.success("Email sent in demo mode")
    } else {
      toast.success("Email sent")
    }

    // Reset compose form
    setComposeData({
      to: "",
      subject: "",
      message: "",
    })
    setIsComposing(false)
  }

  const handleCancelCompose = () => {
    setIsComposing(false)
    setComposeData({
      to: "",
      subject: "",
      message: "",
    })
  }

  const handleReply = () => {
    if (!selectedEmail) return

    setIsComposing(true)
    setComposeData({
      to: selectedEmail.sender.email,
      subject: `Re: ${selectedEmail.subject}`,
      message: `\n\n-------- Original Message --------\nFrom: ${selectedEmail.sender.name} <${selectedEmail.sender.email}>\nDate: ${selectedEmail.date.toLocaleString()}\nSubject: ${selectedEmail.subject}\n\n`,
    })
  }

  const handleForward = () => {
    if (!selectedEmail) return

    setIsComposing(true)
    setComposeData({
      to: "",
      subject: `Fwd: ${selectedEmail.subject}`,
      message: `\n\n-------- Forwarded Message --------\nFrom: ${selectedEmail.sender.name} <${selectedEmail.sender.email}>\nDate: ${selectedEmail.date.toLocaleString()}\nSubject: ${selectedEmail.subject}\n\n${selectedEmail.content.replace(/<[^>]*>/g, "")}`,
    })
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInDays < 7) {
      const options: Intl.DateTimeFormatOptions = { weekday: "short" }
      return date.toLocaleDateString(undefined, options)
    } else {
      const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
      return date.toLocaleDateString(undefined, options)
    }
  }

  const getAttachmentIcon = (type: string) => {
    if (type.includes("image")) return "🖼️"
    if (type.includes("pdf")) return "📄"
    if (type.includes("doc")) return "📝"
    if (type.includes("sheet") || type.includes("excel")) return "📊"
    if (type.includes("zip") || type.includes("rar")) return "🗜️"
    return "📎"
  }

  const handleDownloadAttachment = (attachmentName: string) => {
    if (isDemoMode && !session) {
      toast.success(`Downloading ${attachmentName} in demo mode`)
    } else {
      toast.success(`Downloading ${attachmentName}`)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Inbox</h2>
          <Button onClick={handleComposeEmail}>
            <Plus className="h-4 w-4 mr-2" />
            Compose
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search emails..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="inbox" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b">
          <TabsList className="w-full justify-start rounded-none border-b-0 bg-transparent p-0">
            <TabsTrigger
              value="inbox"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <InboxIcon className="h-4 w-4 mr-2" />
              Inbox
              {emails.filter((e) => !e.isRead && !e.isArchived).length > 0 && (
                <Badge className="ml-2 bg-primary text-primary-foreground">
                  {emails.filter((e) => !e.isRead && !e.isArchived).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="starred"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <Star className="h-4 w-4 mr-2" />
              Starred
            </TabsTrigger>
            <TabsTrigger
              value="sent"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <Send className="h-4 w-4 mr-2" />
              Sent
            </TabsTrigger>
            <TabsTrigger
              value="archived"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <Archive className="h-4 w-4 mr-2" />
              Archived
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 flex">
          {/* Email list */}
          <TabsContent value="inbox" className="m-0 flex-1 h-full">
            <div className={`border-r ${selectedEmail ? "hidden md:block md:w-1/3" : "w-full"}`}>
              <div className="p-2 border-b flex justify-between items-center">
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    <Filter className="h-4 w-4 mr-1" />
                    Filter
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  {filteredEmails.length} {filteredEmails.length === 1 ? "email" : "emails"}
                </div>
              </div>

              <ScrollArea className="h-[calc(100vh-13rem)]">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading emails...</p>
                  </div>
                ) : filteredEmails.length === 0 ? (
                  <div className="p-8 text-center">
                    <InboxIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium mb-1">No emails found</h3>
                    <p className="text-muted-foreground">Your {activeTab} is empty</p>
                  </div>
                ) : (
                  <div>
                    {filteredEmails.map((email) => (
                      <motion.div
                        key={email.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                          !email.isRead ? "bg-primary/5" : ""
                        } ${selectedEmail?.id === email.id ? "bg-muted" : ""}`}
                        onClick={() => handleSelectEmail(email)}
                      >
                        <div className="p-3">
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={email.sender.avatar} alt={email.sender.name} />
                                <AvatarFallback>
                                  {email.sender.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{email.sender.name}</div>
                                <div className="text-xs text-muted-foreground">{email.sender.email}</div>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">{formatDate(email.date)}</div>
                          </div>

                          <div className="ml-10">
                            <div className="font-medium mb-1">{email.subject}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {email.content.replace(/<[^>]*>/g, " ")}
                            </div>

                            {(email.labels?.length || email.attachments?.length) && (
                              <div className="flex gap-2 mt-2">
                                {email.labels?.map((label, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {label}
                                  </Badge>
                                ))}

                                {email.attachments?.length && (
                                  <Badge variant="outline" className="text-xs">
                                    <Paperclip className="h-3 w-3 mr-1" />
                                    {email.attachments.length}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end px-3 pb-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => handleStarEmail(email.id, e)}
                          >
                            <Star className={`h-4 w-4 ${email.isStarred ? "fill-yellow-400 text-yellow-400" : ""}`} />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => handleArchiveEmail(email.id, e)}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => handleDeleteEmail(email.id, e)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Email detail view */}
            {selectedEmail && (
              <div className={`${selectedEmail ? "w-full md:w-2/3" : "hidden"}`}>
                <div className="p-3 border-b flex items-center justify-between">
                  <Button variant="ghost" size="sm" onClick={handleBackToList}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>

                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleReply}>
                      <Reply className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleForward}>
                      <Forward className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => handleDeleteEmail(selectedEmail.id, e as React.MouseEvent)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <ScrollArea className="h-[calc(100vh-13rem)]">
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-6">{selectedEmail.subject}</h2>

                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={selectedEmail.sender.avatar} alt={selectedEmail.sender.name} />
                          <AvatarFallback>
                            {selectedEmail.sender.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <div className="font-medium">{selectedEmail.sender.name}</div>
                          <div className="text-sm text-muted-foreground">{selectedEmail.sender.email}</div>
                          <div className="text-sm mt-1">To: {selectedEmail.recipients.join(", ")}</div>
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {selectedEmail.date.toLocaleString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    {selectedEmail.labels && selectedEmail.labels.length > 0 && (
                      <div className="flex gap-2 mb-4">
                        {selectedEmail.labels.map((label, index) => (
                          <Badge key={index} variant="outline">
                            <Tag className="h-3 w-3 mr-1" />
                            {label}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <Separator className="my-4" />

                    <div
                      className="prose dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: selectedEmail.content }}
                    />

                    {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                      <div className="mt-8">
                        <h3 className="font-medium mb-3">Attachments ({selectedEmail.attachments.length})</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {selectedEmail.attachments.map((attachment, index) => (
                            <div key={index} className="border rounded-md p-3 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="text-2xl">{getAttachmentIcon(attachment.type)}</div>
                                <div>
                                  <div className="font-medium text-sm">{attachment.name}</div>
                                  <div className="text-xs text-muted-foreground">{attachment.size}</div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleDownloadAttachment(attachment.name)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
          </TabsContent>

          <TabsContent value="starred" className="m-0 flex-1 h-full">
            <div className="p-8 text-center">
              <Star className="h-12 w-12 mx-auto text-yellow-400 mb-4" />
              <h3 className="text-lg font-medium mb-1">Starred Emails</h3>
              <p className="text-muted-foreground">
                {filteredEmails.length > 0
                  ? `You have ${filteredEmails.length} starred emails`
                  : "No starred emails yet"}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="sent" className="m-0 flex-1 h-full">
            <div className="p-8 text-center">
              <Send className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-1">Sent Emails</h3>
              <p className="text-muted-foreground">Your sent emails will appear here</p>
            </div>
          </TabsContent>

          <TabsContent value="archived" className="m-0 flex-1 h-full">
            <div className="p-8 text-center">
              <Archive className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-1">Archived Emails</h3>
              <p className="text-muted-foreground">
                {filteredEmails.length > 0
                  ? `You have ${filteredEmails.length} archived emails`
                  : "No archived emails yet"}
              </p>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Compose Email Modal */}
      {isComposing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-background rounded-lg shadow-lg w-full max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-medium">Compose Email</h3>
              <Button variant="ghost" size="icon" onClick={handleCancelCompose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">To:</label>
                <Input
                  value={composeData.to}
                  onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                  placeholder="recipient@example.com"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Subject:</label>
                <Input
                  value={composeData.subject}
                  onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                  placeholder="Email subject"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Message:</label>
                <textarea
                  className="w-full min-h-[200px] p-3 border rounded-md bg-background"
                  value={composeData.message}
                  onChange={(e) => setComposeData({ ...composeData, message: e.target.value })}
                  placeholder="Write your message here..."
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Paperclip className="h-4 w-4 mr-1" />
                    Attach
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancelCompose}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendEmail}>
                    <Send className="h-4 w-4 mr-1" />
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add demo mode indicator */}
      {isDemoMode && !session && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-md shadow-lg">
          Demo Mode: Changes will not be saved
        </div>
      )}
    </div>
  )
}

