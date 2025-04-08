"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Layout, ArrowRight, Quote } from "lucide-react"
import { motion } from "framer-motion"

export default function TestimonialsPage() {
  const testimonials = [
    {
      quote:
        "TaskTogether has transformed how our team collaborates. We've increased productivity by 35% since implementing it.",
      author: "Sarah Johnson",
      role: "Product Manager at Acme Inc.",
      avatar: "/placeholder.svg?height=100&width=100&text=SJ",
      company: "Acme Inc.",
      companyLogo: "/placeholder.svg?height=50&width=100&text=Acme",
      rating: 5,
    },
    {
      quote:
        "The intuitive interface and powerful features make TaskTogether the perfect solution for our remote team's project management needs.",
      author: "Michael Chen",
      role: "CTO at TechStart",
      avatar: "/placeholder.svg?height=100&width=100&text=MC",
      company: "TechStart",
      companyLogo: "/placeholder.svg?height=50&width=100&text=TechStart",
      rating: 5,
    },
    {
      quote:
        "We tried many task management tools, but TaskTogether is by far the most comprehensive and user-friendly solution we've found.",
      author: "Emily Rodriguez",
      role: "Team Lead at Design Co.",
      avatar: "/placeholder.svg?height=100&width=100&text=ER",
      company: "Design Co.",
      companyLogo: "/placeholder.svg?height=50&width=100&text=DesignCo",
      rating: 4,
    },
    {
      quote:
        "The analytics and reporting features have given us valuable insights into our team's performance and helped us optimize our workflows.",
      author: "David Wilson",
      role: "Operations Manager at Global Solutions",
      avatar: "/placeholder.svg?height=100&width=100&text=DW",
      company: "Global Solutions",
      companyLogo: "/placeholder.svg?height=50&width=100&text=Global",
      rating: 5,
    },
    {
      quote:
        "TaskTogether's calendar integration and time tracking features have been game-changers for our project timelines.",
      author: "Jennifer Lee",
      role: "Project Manager at Creative Agency",
      avatar: "/placeholder.svg?height=100&width=100&text=JL",
      company: "Creative Agency",
      companyLogo: "/placeholder.svg?height=50&width=100&text=Creative",
      rating: 4,
    },
    {
      quote:
        "The customer support team at TaskTogether is exceptional. They've been responsive and helpful throughout our onboarding process.",
      author: "Robert Martinez",
      role: "IT Director at Education First",
      avatar: "/placeholder.svg?height=100&width=100&text=RM",
      company: "Education First",
      companyLogo: "/placeholder.svg?height=50&width=100&text=EduFirst",
      rating: 5,
    },
  ]

  const featuredTestimonials = [
    {
      quote:
        "TaskTogether has revolutionized how we manage projects across our global teams. The intuitive interface, powerful collaboration tools, and detailed analytics have made a significant impact on our productivity and team morale.",
      author: "Alexandra Thompson",
      role: "VP of Operations at Enterprise Solutions",
      avatar: "/placeholder.svg?height=200&width=200&text=AT",
      company: "Enterprise Solutions",
      companyLogo: "/placeholder.svg?height=50&width=100&text=Enterprise",
      rating: 5,
    },
    {
      quote:
        "After trying numerous project management tools, we finally found TaskTogether. It's the perfect balance of simplicity and power, with all the features we need without the overwhelming complexity of other platforms.",
      author: "James Wilson",
      role: "Founder & CEO at StartupHub",
      avatar: "/placeholder.svg?height=200&width=200&text=JW",
      company: "StartupHub",
      companyLogo: "/placeholder.svg?height=50&width=100&text=StartupHub",
      rating: 5,
    },
  ]

  const stats = [
    { value: "10,000+", label: "Active Users" },
    { value: "500+", label: "Companies" },
    { value: "98%", label: "Customer Satisfaction" },
    { value: "35%", label: "Avg. Productivity Increase" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <header className="bg-primary text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Layout className="h-8 w-8" />
            <h1 className="text-3xl font-bold">TaskTogether</h1>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8 text-white/90">
            Discover why thousands of teams trust TaskTogether for their project management needs.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        {/* Featured testimonials */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {featuredTestimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-primary/5 to-primary/10"
            >
              <CardContent className="p-8">
                <div className="flex flex-col h-full">
                  <div className="mb-6 text-primary">
                    <Quote className="h-12 w-12 opacity-20" />
                  </div>
                  <p className="text-xl mb-8 flex-grow">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/20">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                      <AvatarFallback>
                        {testimonial.author
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-lg">{testimonial.author}</h4>
                      <p className="text-muted-foreground">{testimonial.role}</p>
                      <div className="flex mt-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-${i < testimonial.rating ? "yellow" : "gray"}-400 text-lg`}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats section */}
        <div className="bg-primary/5 rounded-xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">TaskTogether by the Numbers</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="p-4">
                <p className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* All testimonials */}
        <h3 className="text-2xl font-bold text-center mb-8">More Success Stories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="mb-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-${i < testimonial.rating ? "yellow" : "gray"}-400`}>
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="mb-6 flex-grow">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                      <AvatarFallback>
                        {testimonial.author
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{testimonial.author}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Ready to join them?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Experience the benefits of TaskTogether for yourself and see why thousands of teams trust us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Sign Up Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/features">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Explore Features
              </Button>
            </Link>
          </div>
        </div>

        {/* Company logos */}
        <div className="mb-16">
          <h3 className="text-xl font-medium text-center mb-8">Trusted by companies worldwide</h3>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {["Microsoft", "Airbnb", "Spotify", "Slack", "Netflix"].map((company) => (
              <div
                key={company}
                className="grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              >
                <div className="bg-gray-200 dark:bg-gray-700 px-6 py-3 rounded-md">
                  <span className="font-bold text-lg">{company}</span>
                </div>
              </div>
            ))}
          </div>
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
          </div>
        </div>
      </footer>
    </div>
  )
}

