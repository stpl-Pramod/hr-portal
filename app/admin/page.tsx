import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/dashboard/sidebar"
import { StatsCard } from "@/components/dashboard/stats-card"
import { AnalyticsCharts } from "@/components/admin/analytics-charts"
import { PendingApprovals } from "@/components/admin/pending-approvals"
import { Users, UserCheck, Calendar, Clock } from "lucide-react"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile and check admin access
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || !["hr_admin", "super_admin"].includes(profile.role)) {
    redirect("/dashboard")
  }

  // Get admin statistics
  const { data: allEmployees } = await supabase.from("profiles").select("*")
  const { data: pendingLeaves } = await supabase
    .from("leave_requests")
    .select("*, profiles!inner(*)")
    .eq("status", "pending")

  const { data: todayAttendance } = await supabase
    .from("attendance")
    .select("*")
    .eq("date", new Date().toISOString().split("T")[0])

  const totalEmployees = allEmployees?.length || 0
  const activeEmployees = allEmployees?.filter((emp) => emp.status === "active").length || 0
  const pendingLeaveCount = pendingLeaves?.length || 0
  const presentToday = todayAttendance?.filter((att) => att.status === "present").length || 0

  // Mock pending approvals data
  const pendingApprovals = [
    {
      id: "1",
      type: "leave" as const,
      employee: {
        name: "John Smith",
        department: "Engineering",
      },
      title: "Annual Leave Request",
      description: "Vacation leave for family trip",
      date: "Dec 25-30, 2024",
      duration: "5 days",
    },
    {
      id: "2",
      type: "leave" as const,
      employee: {
        name: "Sarah Johnson",
        department: "Marketing",
      },
      title: "Sick Leave Request",
      description: "Medical appointment and recovery",
      date: "Dec 22, 2024",
      duration: "1 day",
    },
  ]

  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar profile={profile} />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">HR Admin Dashboard</h1>
            <p className="text-slate-400 mt-2">Manage employees, track performance, and oversee operations</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard title="Total Employees" value={totalEmployees} description="All employees" icon={Users} />
            <StatsCard
              title="Active Employees"
              value={activeEmployees}
              description="Currently active"
              icon={UserCheck}
            />
            <StatsCard
              title="Present Today"
              value={presentToday}
              description="Checked in today"
              icon={Clock}
              trend={{ value: 5, isPositive: true }}
            />
            <StatsCard
              title="Pending Approvals"
              value={pendingLeaveCount}
              description="Awaiting review"
              icon={Calendar}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <AnalyticsCharts />
            </div>
            <div>
              <PendingApprovals approvals={pendingApprovals} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
