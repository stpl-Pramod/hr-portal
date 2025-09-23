"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, FileText, User } from "lucide-react"
import Link from "next/link"
import { logComponent, logNavigation } from "@/lib/logger"
import { usePathname } from "next/navigation"

export function QuickActions() {
  const pathname = usePathname()

  const handleQuickAction = (action: { title: string; href: string; description: string }) => {
    logComponent("QuickActions", "quick_action_clicked", {
      action_title: action.title,
      action_href: action.href,
      action_description: action.description,
      from_page: pathname
    })
    
    logNavigation("quick_action_navigation", pathname, action.href)
  }
  const actions = [
    {
      title: "Request Leave",
      description: "Submit a new leave request",
      icon: Calendar,
      href: "/dashboard/leaves/new",
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      title: "Clock In/Out",
      description: "Mark your attendance",
      icon: Clock,
      href: "/dashboard/attendance",
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      title: "View Salary Slip",
      description: "Download latest salary slip",
      icon: FileText,
      href: "/dashboard/salary",
      color: "bg-purple-600 hover:bg-purple-700",
    },
    {
      title: "Update Profile",
      description: "Edit your profile information",
      icon: User,
      href: "/dashboard/profile",
      color: "bg-orange-600 hover:bg-orange-700",
    },
  ]

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Link key={action.title} href={action.href}>
              <Button
                variant="outline"
                className={`w-full h-auto p-4 flex flex-col items-center gap-2 border-slate-600 hover:border-slate-500 ${action.color} text-white border-0`}
                onClick={() => handleQuickAction(action)}
              >
                <Icon className="h-6 w-6" />
                <div className="text-center">
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className="text-xs opacity-80">{action.description}</p>
                </div>
              </Button>
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}
