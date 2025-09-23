"use client"

import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Sidebar } from "@/components/dashboard/sidebar"
import { ProfileEditForm } from "@/components/profile/profile-edit-form"
import { PasswordChangeForm } from "@/components/profile/password-change-form"
import { NotificationSettings } from "@/components/profile/notification-settings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        redirect("/auth/login")
        return
      }

      const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (!userProfile) {
        redirect("/auth/login")
        return
      }

      setProfile(userProfile)
      setLoading(false)
    }

    fetchProfile()
  }, [])

  const handleProfileUpdate = (updatedProfile: any) => {
    setProfile(updatedProfile)
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
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-slate-400 mt-2">Manage your account settings and preferences</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="bg-slate-800 border-slate-700">
              <TabsTrigger value="profile" className="data-[state=active]:bg-slate-700 text-slate-300">
                Profile
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-slate-700 text-slate-300">
                Security
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-slate-700 text-slate-300">
                Notifications
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <ProfileEditForm profile={profile} onUpdate={handleProfileUpdate} />
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <PasswordChangeForm />
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <NotificationSettings />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
