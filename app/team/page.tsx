"use client"

import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Sidebar } from "@/components/dashboard/sidebar"
import { TeamOverviewCards } from "@/components/team/team-overview-cards"
import { TeamMembersList } from "@/components/team/team-members-list"
import { LeaveApprovals } from "@/components/team/leave-approvals"
import { TeamAttendanceChart } from "@/components/team/team-attendance-chart"

export default function TeamDashboardPage() {
  const [profile, setProfile] = useState<any>(null)
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        redirect("/auth/login")
        return
      }

      // Get user profile
      const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (!userProfile || userProfile.role !== "team_lead") {
        redirect("/dashboard")
        return
      }

      setProfile(userProfile)

      // Get team members (employees reporting to this team lead)
      const { data: members } = await supabase
        .from("profiles")
        .select("*")
        .eq("manager_id", user.id)
        .eq("status", "active")

      setTeamMembers(members || [])

      // Get pending leave requests from team members
      const memberIds = members?.map((m) => m.id) || []
      if (memberIds.length > 0) {
        const { data: leaves } = await supabase
          .from("leave_requests")
          .select(`
            *,
            profiles!inner(*),
            leave_types(*)
          `)
          .in("employee_id", memberIds)
          .eq("status", "pending")
          .order("created_at", { ascending: false })

        setPendingLeaves(leaves || [])
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  const handleLeaveUpdate = () => {
    // Refresh pending leaves
    const fetchPendingLeaves = async () => {
      const supabase = createClient()
      const memberIds = teamMembers.map((m) => m.id)
      if (memberIds.length > 0) {
        const { data: leaves } = await supabase
          .from("leave_requests")
          .select(`
            *,
            profiles!inner(*),
            leave_types(*)
          `)
          .in("employee_id", memberIds)
          .eq("status", "pending")
          .order("created_at", { ascending: false })

        setPendingLeaves(leaves || [])
      }
    }
    fetchPendingLeaves()
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-900 items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!profile) {
    redirect("/dashboard")
    return null
  }

  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar profile={profile} />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Team Dashboard</h1>
            <p className="text-slate-400 mt-2">Manage your team, approve requests, and track performance</p>
          </div>

          {/* Overview Cards */}
          <div className="mb-8">
            <TeamOverviewCards
              teamMembers={teamMembers}
              presentToday={Math.floor(teamMembers.length * 0.85)} // Mock data
              pendingLeaves={pendingLeaves.length}
              teamPerformance={92} // Mock data
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <TeamMembersList teamMembers={teamMembers} />
            <LeaveApprovals leaveRequests={pendingLeaves} onUpdate={handleLeaveUpdate} />
          </div>

          {/* Attendance Chart */}
          <div className="mb-8">
            <TeamAttendanceChart />
          </div>
        </div>
      </main>
    </div>
  )
}
