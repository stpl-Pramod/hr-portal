import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/dashboard/sidebar"
import { LeaveBalanceCard } from "@/components/leaves/leave-balance-card"
import { LeaveRequestsTable } from "@/components/leaves/leave-requests-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function LeavesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  // Get leave requests
  const { data: leaveRequests } = await supabase
    .from("leave_requests")
    .select(`
      *,
      leave_type:leave_types(*),
      approved_by:profiles(first_name, last_name)
    `)
    .eq("employee_id", user.id)
    .order("created_at", { ascending: false })

  // Get leave types for balance calculation
  const { data: leaveTypes } = await supabase.from("leave_types").select("*").eq("is_active", true)

  // Mock leave balance data (in real app, calculate from leave_requests)
  const leaveBalances = [
    { type: "Annual Leave", used: 8, total: 21, color: "#10b981" },
    { type: "Sick Leave", used: 2, total: 10, color: "#ef4444" },
    { type: "Personal Leave", used: 1, total: 5, color: "#f59e0b" },
  ]

  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar profile={profile} />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Leave Management</h1>
              <p className="text-slate-400 mt-2">Manage your leave requests and track your balance</p>
            </div>
            <Link href="/dashboard/leaves/new">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Request Leave
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Leave Balance */}
            <div className="lg:col-span-1">
              <LeaveBalanceCard balances={leaveBalances} />
            </div>

            {/* Leave Requests */}
            <div className="lg:col-span-3">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-6">My Leave Requests</h2>
                <LeaveRequestsTable requests={leaveRequests || []} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
