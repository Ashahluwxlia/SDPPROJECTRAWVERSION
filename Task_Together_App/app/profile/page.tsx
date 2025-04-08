import Link from "next/link"
import { getCurrentUser } from "@/lib/auth-actions"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { User, Bell, Shield, CheckCircle, Clock, BarChart } from "lucide-react"

export default async function ProfilePage() {
  // Get the current user server-side - now returns a demo user if not logged in
  const user = await getCurrentUser()

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <DashboardSidebar />
      <div className="flex-1 ml-[var(--sidebar-width)]">
        <DashboardHeader user={user || undefined} />
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Profile</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
            {user?.role === "demo" && (
              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-md text-sm">
                You're viewing the profile in demo mode.{" "}
                <Link href="/register" className="font-medium underline">
                  Sign up
                </Link>{" "}
                or{" "}
                <Link href="/login" className="font-medium underline">
                  log in
                </Link>{" "}
                to save your data.
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="lg:col-span-1">
              <CardContent className="p-6 flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={user?.avatar || undefined} alt={user?.name || "User"} />
                  <AvatarFallback className="text-2xl">
                    {user?.name
                      ? user.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()
                      : "U"}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{user?.name || "User"}</h2>
                <p className="text-muted-foreground mb-4">{user?.email || ""}</p>
                <Button className="w-full mb-2">Edit Profile</Button>
                <Button variant="outline" className="w-full">
                  Change Photo
                </Button>

                <Separator className="my-6" />

                <div className="w-full space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Member since</span>
                    <span className="text-sm text-muted-foreground">Jan 2023</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Role</span>
                    <Badge>{user?.role === "demo" ? "Demo User" : user?.role || "User"}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Status</span>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-3 space-y-6">
              <Tabs defaultValue="account" className="w-full">
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="account" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Account</span>
                  </TabsTrigger>
                  <TabsTrigger value="security" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">Security</span>
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span className="hidden sm:inline">Notifications</span>
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="flex items-center gap-2">
                    <BarChart className="h-4 w-4" />
                    <span className="hidden sm:inline">Activity</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="account">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Information</CardTitle>
                      <CardDescription>Update your account details and personal information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input id="name" defaultValue={user?.name || ""} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" defaultValue={user?.email || ""} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="job-title">Job Title</Label>
                          <Input id="job-title" defaultValue={user?.role === "demo" ? "Product Manager" : user?.role || ""} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="department">Department</Label>
                          <Input id="department" defaultValue="Product" />
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <textarea
                          id="bio"
                          className="w-full min-h-32 p-2 border rounded-md bg-background"
                          defaultValue="Product Manager with 5+ years of experience in SaaS products. Passionate about creating intuitive user experiences and driving product growth."
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button>Save Changes</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="security">
                  <Card>
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                      <CardDescription>Manage your password and security preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Change Password</h3>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input id="current-password" type="password" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input id="new-password" type="password" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input id="confirm-password" type="password" />
                          </div>
                        </div>
                        <Button>Update Password</Button>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account by enabling two-factor authentication.
                        </p>
                        <Button variant="outline">Enable 2FA</Button>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Sessions</h3>
                        <p className="text-sm text-muted-foreground">
                          Manage your active sessions and sign out from other devices.
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-3 border rounded-md">
                            <div>
                              <p className="font-medium">Current Session</p>
                              <p className="text-sm text-muted-foreground">Last active: Just now</p>
                            </div>
                            <Badge>Current</Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 border rounded-md">
                            <div>
                              <p className="font-medium">Chrome on Windows</p>
                              <p className="text-sm text-muted-foreground">Last active: 2 days ago</p>
                            </div>
                            <Button variant="outline" size="sm">
                              Sign Out
                            </Button>
                          </div>
                        </div>
                        <Button variant="outline">Sign Out All Devices</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="notifications">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Preferences</CardTitle>
                      <CardDescription>Manage how and when you receive notifications</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Email Notifications</h3>
                        <div className="space-y-2">
                          {[
                            "Task assignments",
                            "Task comments",
                            "Due date reminders",
                            "Board updates",
                            "Team announcements",
                          ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between">
                              <span>{item}</span>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" defaultChecked={i < 3} className="sr-only peer" />
                                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Push Notifications</h3>
                        <div className="space-y-2">
                          {["Task assignments", "Task comments", "Due date reminders", "Board updates"].map(
                            (item, i) => (
                              <div key={i} className="flex items-center justify-between">
                                <span>{item}</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" defaultChecked={i < 2} className="sr-only peer" />
                                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                              </div>
                            ),
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button>Save Preferences</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity">
                  <Card>
                    <CardHeader>
                      <CardTitle>Activity Overview</CardTitle>
                      <CardDescription>Your recent activity and statistics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="flex items-center gap-4">
                          <div className="bg-blue-500/10 p-3 rounded-full">
                            <CheckCircle className="h-6 w-6 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Completed Tasks</p>
                            <p className="text-2xl font-bold">128</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="bg-amber-500/10 p-3 rounded-full">
                            <Clock className="h-6 w-6 text-amber-500" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Hours Logged</p>
                            <p className="text-2xl font-bold">87.5</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="bg-green-500/10 p-3 rounded-full">
                            <BarChart className="h-6 w-6 text-green-500" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Productivity</p>
                            <p className="text-2xl font-bold">92%</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Recent Activity</h3>
                        <div className="space-y-4">
                          {[
                            { action: "Completed task", item: "Update user documentation", time: "2 hours ago" },
                            { action: "Created board", item: "Q2 Marketing Campaign", time: "1 day ago" },
                            { action: "Commented on", item: "Homepage redesign task", time: "2 days ago" },
                            { action: "Completed task", item: "Fix navigation bug", time: "3 days ago" },
                          ].map((activity, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                              <div>
                                <p className="text-sm">
                                  <span className="font-medium">{activity.action}</span> {activity.item}
                                </p>
                                <p className="text-xs text-muted-foreground">{activity.time}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

