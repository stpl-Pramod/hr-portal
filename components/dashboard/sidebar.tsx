"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Home, Calendar, Clock, User, FileText, Bell, Settings, LogOut, Users, BarChart3 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { createLoggedClient } from "@/lib/supabase/logged-client"
import { logAuth, logNavigation, logComponent } from "@/lib/logger"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface SidebarProps {
  profile: {
    first_name: string
    last_name: string
    role: string
    department: string
    position: string
    avatar_url?: string
  }
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  // Log navigation changes when pathname changes
  useEffect(() => {
    if (pathname !== '/') {
      logNavigation("page_navigation", "previous_page", pathname)
    }
  }, [pathname])

  const handleSignOut = async () => {
    logAuth("logout_initiated", {
      user: `${profile.first_name} ${profile.last_name}`,
      role: profile.role,
      department: profile.department
    })

    const supabase = createLoggedClient()
    await supabase.auth.signOut()

    logAuth("logout_completed", {
      user: `${profile.first_name} ${profile.last_name}`,
      redirectTo: "/auth/login"
    })

    logNavigation("logout_redirect", pathname, "/auth/login")
    router.push("/auth/login")
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "My Profile", href: "/dashboard/profile", icon: User },
    { name: "Attendance", href: "/dashboard/attendance", icon: Clock },
    { name: "Leave Requests", href: "/dashboard/leaves", icon: Calendar },
    { name: "Salary Slips", href: "/dashboard/salary", icon: FileText },
    { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  ]

  // Add admin/lead specific navigation
  if (profile.role === "hr_admin" || profile.role === "super_admin") {
    navigation.push(
      { name: "HR Admin", href: "/admin", icon: BarChart3 },
      { name: "All Employees", href: "/admin/employees", icon: Users },
    )
  }

  if (profile.role === "team_lead") {
    navigation.push({ name: "Team Management", href: "/team", icon: Users })
  }

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 border-r border-slate-700">
      {/* Profile Section */}
      <div className="flex items-center gap-3 p-6 border-b border-slate-700">
        <Avatar className="h-10 w-10">
          <AvatarImage src={profile.avatar_url || "/placeholder.svg"} />
          <AvatarFallback className="bg-blue-600 text-white">
            {profile.first_name && profile.last_name ? (
              <>
                {profile.first_name[0]}
                {profile.last_name[0]}
              </>
            ) : (
              <User className="h-5 w-5" />
            )}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {profile.first_name} {profile.last_name}
          </p>
          <p className="text-xs text-slate-400 truncate">{profile.position}</p>
          <Badge variant="secondary" className="mt-1 text-xs">
            {profile.role.replace("_", " ").toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 text-slate-300 hover:text-white hover:bg-slate-800",
                  isActive && "bg-slate-800 text-white",
                )}
                onClick={() => {
                  logComponent("Sidebar", "menu_item_clicked", {
                    menu_item: item.name,
                    from: pathname,
                    to: item.href,
                    user_role: profile.role
                  })
                }}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 space-y-2">
        <Link href="/dashboard/settings">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-slate-300 hover:text-white hover:bg-slate-800"
            onClick={() => {
              logComponent("Sidebar", "settings_clicked", {
                from: pathname,
                to: "/dashboard/settings",
                user_role: profile.role
              })
            }}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </Link>
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full justify-start gap-3 text-slate-300 hover:text-white hover:bg-slate-800"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
