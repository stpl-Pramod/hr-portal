import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin, Calendar, Building, User } from "lucide-react"

export default async function ProfilePage() {
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

  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar profile={profile} />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">My Profile</h1>
            <p className="text-slate-400 mt-2">Manage your personal information</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Overview */}
            <div className="lg:col-span-1">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src={profile.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="bg-blue-600 text-white text-xl">
                      {profile.first_name && profile.last_name ? (
                        <>
                          {profile.first_name[0]}
                          {profile.last_name[0]}
                        </>
                      ) : (
                        <User className="h-10 w-10" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-white">
                    {profile.first_name} {profile.last_name}
                  </CardTitle>
                  <p className="text-slate-400">{profile.position}</p>
                  <Badge variant="secondary" className="mt-2">
                    {profile.role.replace("_", " ").toUpperCase()}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-300">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{profile.email}</span>
                  </div>
                  {profile.phone && (
                    <div className="flex items-center gap-3 text-slate-300">
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">{profile.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-slate-300">
                    <Building className="h-4 w-4" />
                    <span className="text-sm">{profile.department}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Joined {new Date(profile.hire_date).toLocaleDateString()}</span>
                  </div>
                  {profile.address && (
                    <div className="flex items-center gap-3 text-slate-300">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{profile.address}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Detailed Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-slate-300">Employee ID</label>
                    <p className="text-white mt-1">{profile.employee_id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300">Status</label>
                    <Badge className="mt-1 bg-green-600">{profile.status.toUpperCase()}</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300">Department</label>
                    <p className="text-white mt-1">{profile.department}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300">Position</label>
                    <p className="text-white mt-1">{profile.position}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300">Hire Date</label>
                    <p className="text-white mt-1">{new Date(profile.hire_date).toLocaleDateString()}</p>
                  </div>
                  {profile.manager_id && (
                    <div>
                      <label className="text-sm font-medium text-slate-300">Reporting Manager</label>
                      <p className="text-white mt-1">Manager Name</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-slate-300">Contact Name</label>
                    <p className="text-white mt-1">{profile.emergency_contact_name || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300">Contact Phone</label>
                    <p className="text-white mt-1">{profile.emergency_contact_phone || "Not provided"}</p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button className="bg-blue-600 hover:bg-blue-700">Edit Profile</Button>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent">
                  Change Password
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
