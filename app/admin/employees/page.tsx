import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/dashboard/sidebar"
import { EmployeeTable } from "@/components/admin/employee-table"

export default async function EmployeesPage() {
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

  // Get all employees
  const { data: employees } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar profile={profile} />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Employee Management</h1>
            <p className="text-slate-400 mt-2">Manage all employees, their roles, and information</p>
          </div>

          <EmployeeTable employees={employees || []} />
        </div>
      </main>
    </div>
  )
}
