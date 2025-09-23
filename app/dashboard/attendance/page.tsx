import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, CheckCircle, XCircle } from "lucide-react"

export default async function AttendancePage() {
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

  // Get today's attendance
  const today = new Date().toISOString().split("T")[0]
  const { data: todayAttendance } = await supabase
    .from("attendance")
    .select("*")
    .eq("employee_id", user.id)
    .eq("date", today)
    .single()

  // Get recent attendance records
  const { data: recentAttendance } = await supabase
    .from("attendance")
    .select("*")
    .eq("employee_id", user.id)
    .order("date", { ascending: false })
    .limit(10)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-600"
      case "absent":
        return "bg-red-600"
      case "late":
        return "bg-yellow-600"
      case "half_day":
        return "bg-blue-600"
      case "on_leave":
        return "bg-purple-600"
      default:
        return "bg-slate-600"
    }
  }

  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar profile={profile} />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Attendance</h1>
            <p className="text-slate-400 mt-2">Track your daily attendance and work hours</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Today's Attendance */}
            <div className="lg:col-span-1">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Today's Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {todayAttendance ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Status:</span>
                        <Badge className={`${getStatusColor(todayAttendance.status)} text-white`}>
                          {todayAttendance.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>
                      {todayAttendance.check_in && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Check In:</span>
                          <span className="text-white">{new Date(todayAttendance.check_in).toLocaleTimeString()}</span>
                        </div>
                      )}
                      {todayAttendance.check_out && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Check Out:</span>
                          <span className="text-white">{new Date(todayAttendance.check_out).toLocaleTimeString()}</span>
                        </div>
                      )}
                      {todayAttendance.total_hours && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Total Hours:</span>
                          <span className="text-white">{todayAttendance.total_hours}h</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-slate-400 mb-4">No attendance record for today</p>
                      <div className="space-y-2">
                        <Button className="w-full bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Check In
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Mark Absent
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Attendance */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Recent Attendance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentAttendance && recentAttendance.length > 0 ? (
                      recentAttendance.map((record) => (
                        <div key={record.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                          <div>
                            <p className="text-white font-medium">{new Date(record.date).toLocaleDateString()}</p>
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                              {record.check_in && <span>In: {new Date(record.check_in).toLocaleTimeString()}</span>}
                              {record.check_out && <span>Out: {new Date(record.check_out).toLocaleTimeString()}</span>}
                              {record.total_hours && <span>Hours: {record.total_hours}h</span>}
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(record.status)} text-white`}>
                            {record.status.replace("_", " ").toUpperCase()}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-center py-4">No attendance records found</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
