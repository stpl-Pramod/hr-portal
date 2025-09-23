import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/dashboard/sidebar"
import { LeaveRequestForm } from "@/components/leaves/leave-request-form"

export default async function NewLeaveRequestPage() {
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

  // Get leave types
  const { data: leaveTypes } = await supabase.from("leave_types").select("*").eq("is_active", true)

  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar profile={profile} />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Request Leave</h1>
            <p className="text-slate-400 mt-2">Submit a new leave request for approval</p>
          </div>

          <div className="max-w-2xl">
            <LeaveRequestForm leaveTypes={leaveTypes || []} employeeId={user.id} />
          </div>
        </div>
      </main>
    </div>
  )
}
