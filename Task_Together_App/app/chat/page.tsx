import { getCurrentUser } from "@/lib/auth-actions"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar"
import { ChatInterface } from "@/components/chat/chat-interface"

export default async function ChatPage() {
  const user = await getCurrentUser()

  if (!user) {
    return <div>Please log in to access chat.</div>
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <DashboardSidebar />
      <div className="flex-1">
        <DashboardHeader user={user || undefined} />
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Team Chat</h1>
            <p className="text-muted-foreground">Communicate with your team in real-time</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChatInterface currentUser={user} />
            </div>

            <div>
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-4">Online Team Members</h3>
                <div className="space-y-3">
                  {[
                    { name: "Alex Johnson", avatar: "/placeholder.svg?height=100&width=100&text=AJ", status: "online" },
                    {
                      name: "Sarah Williams",
                      avatar: "/placeholder.svg?height=100&width=100&text=SW",
                      status: "offline",
                    },
                    { name: "Michael Chen", avatar: "/placeholder.svg?height=100&width=100&text=MC", status: "online" },
                  ].map((member, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div
                          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                            member.status === "online" ? "bg-green-500" : "bg-gray-400"
                          }`}
                        ></div>
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {member.status === "online" ? "Online" : "Offline"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

