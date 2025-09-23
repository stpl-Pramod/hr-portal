import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { logAuth, logNavigation, logException } from "@/lib/logger"
import { Sidebar } from "@/components/dashboard/sidebar"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { Calendar, Clock, FileText, TrendingUp } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    logAuth("dashboard_access_denied", { reason: "no_user" })
    redirect("/auth/login")
  }

  logAuth("dashboard_access_granted", { 
    userId: user.id, 
    email: user.email 
  })

  // Get user profile
  let profile = null
  try {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    profile = data
  } catch (error) {
    // If profiles table doesn't exist yet, use basic user info
    console.log("Profiles table not found, using basic user info")
    profile = {
      id: user.id,
      first_name: user.user_metadata?.first_name || "User",
      last_name: user.user_metadata?.last_name || "",
      email: user.email,
      department: "Engineering",
      position: "Employee",
      role: "employee"
    }
  }

  // Ensure we always have a profile (even with fallback data)
  if (!profile) {
    profile = {
      id: user.id,
      first_name: user.user_metadata?.first_name || "User",
      last_name: user.user_metadata?.last_name || "",
      email: user.email,
      department: user.user_metadata?.department || "Engineering",
      position: user.user_metadata?.position || "Employee",
      role: user.user_metadata?.role || "employee"
    }
  }

  // Get user stats
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  // Get attendance stats (with fallback)
  let attendanceData = []
  try {
    const { data } = await supabase
      .from("attendance")
      .select("*")
      .eq("employee_id", user.id)
      .gte("date", `${currentYear}-${currentMonth.toString().padStart(2, "0")}-01`)
    attendanceData = data || []
  } catch (error) {
    console.log("Attendance table not found, using mock data")
    attendanceData = []
  }

  // Get leave requests (with fallback)
  let leaveData = []
  try {
    const { data } = await supabase
      .from("leave_requests")
      .select("*")
      .eq("employee_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)
    leaveData = data || []
  } catch (error) {
    console.log("Leave requests table not found, using mock data")
    leaveData = []
  }

  // Get recent activities (mock data for now)
  const recentActivities = [
    {
      id: "1",
      type: "attendance" as const,
      title: "Clocked In",
      description: "Started work day",
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      type: "leave" as const,
      title: "Leave Request Submitted",
      description: "Annual leave for Dec 25-26",
      timestamp: "1 day ago",
      status: "pending" as const,
    },
  ]

  const attendanceCount = attendanceData?.length || 0
  const pendingLeaves = leaveData?.filter((leave) => leave.status === "pending").length || 0

  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar profile={profile} />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Welcome back, {profile.first_name}!</h1>
            <p className="text-slate-400 mt-2">Here's what's happening with your account today.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard title="Days Present" value={attendanceCount} description="This month" icon={Clock} />
            <StatsCard title="Pending Leaves" value={pendingLeaves} description="Awaiting approval" icon={Calendar} />
            <StatsCard title="Leave Balance" value="18" description="Days remaining" icon={FileText} />
            <StatsCard
              title="Performance"
              value="95%"
              description="This quarter"
              icon={TrendingUp}
              trend={{ value: 5, isPositive: true }}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <QuickActions />
            </div>
            <div className="space-y-6">
              <RecentActivity activities={recentActivities} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
