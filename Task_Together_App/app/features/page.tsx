import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CheckCircle,
  Clock,
  Users,
  BarChart4,
  Layout,
  ArrowRight,
  Briefcase,
  MessageSquare,
  Lock,
  Zap,
  Layers,
} from "lucide-react"

export default function FeaturesPage() {
  const features = [
    {
      title: "Task Management",
      description: "Create, organize, and track tasks with ease. Assign priorities, due dates, and team members.",
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
      details: [
        "Create and organize tasks with custom fields",
        "Set priorities and due dates",
        "Assign tasks to team members",
        "Track task progress and status",
        "Add attachments and comments",
      ],
    },
    {
      title: "Team Collaboration",
      description: "Work together seamlessly with real-time updates, comments, and shared workspaces.",
      icon: <Users className="h-8 w-8 text-primary" />,
      details: [
        "Real-time collaboration on tasks and projects",
        "Comment threads on tasks",
        "@mentions to notify team members",
        "Shared workspaces for teams",
        "Activity feed to track changes",
      ],
    },
    {
      title: "Progress Tracking",
      description: "Monitor project progress with visual dashboards, reports, and status updates.",
      icon: <BarChart4 className="h-8 w-8 text-primary" />,
      details: [
        "Visual dashboards with project metrics",
        "Progress charts and graphs",
        "Custom reports and analytics",
        "Burndown charts for sprints",
        "Team performance metrics",
      ],
    },
    {
      title: "Time Management",
      description: "Stay on schedule with calendar integration, reminders, and time tracking features.",
      icon: <Clock className="h-8 w-8 text-primary" />,
      details: [
        "Calendar integration with popular services",
        "Automated reminders for due dates",
        "Time tracking for tasks",
        "Workload management",
        "Schedule optimization",
      ],
    },
    {
      title: "Kanban Boards",
      description: "Visualize your workflow with customizable Kanban boards and drag-and-drop functionality.",
      icon: <Layers className="h-8 w-8 text-primary" />,
      details: [
        "Customizable board columns",
        "Drag-and-drop task management",
        "Visual workflow management",
        "WIP limits for columns",
        "Swimlanes for categorization",
      ],
    },
    {
      title: "Advanced Security",
      description: "Keep your data safe with enterprise-grade security features and role-based permissions.",
      icon: <Lock className="h-8 w-8 text-primary" />,
      details: [
        "Role-based access control",
        "Two-factor authentication",
        "Data encryption at rest and in transit",
        "Audit logs for all actions",
        "Compliance with industry standards",
      ],
    },
    {
      title: "Integrations",
      description: "Connect with your favorite tools and services for a seamless workflow.",
      icon: <Zap className="h-8 w-8 text-primary" />,
      details: [
        "Integration with popular productivity tools",
        "API access for custom integrations",
        "Webhooks for automated workflows",
        "Import/export functionality",
        "Single sign-on options",
      ],
    },
    {
      title: "Communication Tools",
      description: "Built-in messaging and notification systems to keep everyone in the loop.",
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      details: [
        "In-app messaging system",
        "Customizable notifications",
        "Email digests and summaries",
        "Team announcements",
        "Discussion threads",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <header className="bg-primary text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Layout className="h-8 w-8" />
            <h1 className="text-3xl font-bold">TaskTogether</h1>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Features</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8 text-white/90">
            Discover all the powerful features that make TaskTogether the perfect solution for your team's productivity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 w-full sm:w-auto">
                Get Started Free
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 w-full sm:w-auto"
              >
                Try Demo
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="overflow-hidden border-t-4 border-t-primary">
              <CardHeader>
                <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of teams who use TaskTogether to organize their work and boost productivity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Sign Up Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/testimonials">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                See What Others Say
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <div className="bg-blue-500/10 p-3 rounded-full w-fit mb-4">
                <Briefcase className="h-6 w-6 text-blue-500" />
              </div>
              <CardTitle>For Small Teams</CardTitle>
              <CardDescription>Perfect for startups and small businesses</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Get your team organized with our easy-to-use platform. No complex setup required.</p>
              <Link href="/register">
                <Button variant="outline" className="w-full">
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="border-primary">
            <CardHeader>
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>For Growing Companies</CardTitle>
              <CardDescription>Scale your workflow as your team grows</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Flexible features that adapt to your changing needs and growing team size.</p>
              <Link href="/register">
                <Button className="w-full">Get Started</Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="bg-purple-500/10 p-3 rounded-full w-fit mb-4">
                <BarChart4 className="h-6 w-6 text-purple-500" />
              </div>
              <CardTitle>For Enterprises</CardTitle>
              <CardDescription>Advanced features for large organizations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Enterprise-grade security and customization for complex organizational needs.</p>
              <Link href="/contact">
                <Button variant="outline" className="w-full">
                  Contact Sales
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Layout className="h-6 w-6" />
              <span className="text-lg font-bold">TaskTogether</span>
            </div>
            <div className="flex flex-wrap gap-6 justify-center">
              <Link href="/features" className="text-sm text-gray-400 hover:text-white">
                Features
              </Link>
              <Link href="/testimonials" className="text-sm text-gray-400 hover:text-white">
                Testimonials
              </Link>
              <Link href="/documentation" className="text-sm text-gray-400 hover:text-white">
                Documentation
              </Link>
              <Link href="/login" className="text-sm text-gray-400 hover:text-white">
                Login
              </Link>
              <Link href="/register" className="text-sm text-gray-400 hover:text-white">
                Sign Up
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400">© {new Date().getFullYear()} TaskTogether. All rights reserved.</div>
            <div className="flex gap-4 mt-4 md:mt-0"></div>
          </div>
        </div>
      </footer>
    </div>
  )
}

