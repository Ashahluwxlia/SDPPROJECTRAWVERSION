import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { BadgeInfo, Zap, Bell, Shield, UserCog, Database } from "lucide-react"
import { getCurrentUser } from "@/lib/auth-actions"

export default async function SettingsPage() {
  const user = await getCurrentUser()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-4xl mb-8">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <BadgeInfo className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">API</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card className="max-w-4xl">
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account information and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <p className="text-sm text-muted-foreground">Your display name</p>
                  </div>
                  <Input id="name" defaultValue={user?.name || ""} className="max-w-xs" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <p className="text-sm text-muted-foreground">Your email address</p>
                  </div>
                  <Input id="email" defaultValue={user?.email || ""} className="max-w-xs" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="max-w-4xl">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how TaskFlow looks and feels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Theme</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 cursor-pointer hover:border-primary">
                    <div className="h-20 bg-white rounded-md border mb-3"></div>
                    <div className="flex justify-between items-center">
                      <span>Light</span>
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 cursor-pointer hover:border-primary">
                    <div className="h-20 bg-gray-900 rounded-md border mb-3"></div>
                    <div className="flex justify-between items-center">
                      <span>Dark</span>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 cursor-pointer hover:border-primary">
                    <div className="h-20 bg-gradient-to-b from-white to-gray-900 rounded-md border mb-3"></div>
                    <div className="flex justify-between items-center">
                      <span>System</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Layout</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="compact-view" className="block">
                        Compact View
                      </Label>
                      <p className="text-sm text-muted-foreground">Use a more compact layout to show more content</p>
                    </div>
                    <Switch id="compact-view" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="fullwidth" className="block">
                        Full Width
                      </Label>
                      <p className="text-sm text-muted-foreground">Use the full width of the screen</p>
                    </div>
                    <Switch id="fullwidth" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="max-w-4xl">
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Control how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Notifications</h3>
                <div className="space-y-3">
                  {["Task assignments", "Task comments", "Due date reminders", "Status changes"].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Label htmlFor={`email-${i}`}>{item}</Label>
                      <Switch id={`email-${i}`} defaultChecked={i < 3} />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">In-App Notifications</h3>
                <div className="space-y-3">
                  {["Task assignments", "Task comments", "Due date reminders", "Status changes"].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Label htmlFor={`app-${i}`}>{item}</Label>
                      <Switch id={`app-${i}`} defaultChecked />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="max-w-4xl">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security and privacy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Password</h3>
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
                <Button>Update Password</Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="2fa" className="block">
                      Enable 2FA
                    </Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch id="2fa" />
                </div>
                <Button variant="outline">Setup Two-Factor Authentication</Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Sessions</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <p className="font-medium">Current Session</p>
                      <p className="text-sm text-muted-foreground">Last active: Just now</p>
                    </div>
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
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

        <TabsContent value="api">
          <Card className="max-w-4xl">
            <CardHeader>
              <CardTitle>API Settings</CardTitle>
              <CardDescription>Manage API keys and access for integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">API Keys</h3>
                <div className="p-4 border rounded-md">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="font-medium">Primary API Key</p>
                      <p className="text-sm text-muted-foreground">Created on {new Date().toLocaleDateString()}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Regenerate
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Input value="••••••••••••••••••••••••••••••" readOnly className="font-mono" />
                    <Button variant="outline" size="sm">
                      Copy
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Webhooks</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="webhooks" className="block">
                      Enable Webhooks
                    </Label>
                    <p className="text-sm text-muted-foreground">Receive event notifications via HTTP callbacks</p>
                  </div>
                  <Switch id="webhooks" />
                </div>
                <Button variant="outline">Configure Webhooks</Button>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

