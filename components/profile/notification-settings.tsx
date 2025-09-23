"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function NotificationSettings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    leaveUpdates: true,
    birthdayReminders: true,
    attendanceAlerts: false,
    salarySlipNotifications: true,
    teamUpdates: true,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSuccess(true)
    setIsLoading(false)
    setTimeout(() => setSuccess(false), 3000)
  }

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Notification Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-slate-200">Email Notifications</Label>
              <p className="text-sm text-slate-400">Receive notifications via email</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-slate-200">Leave Updates</Label>
              <p className="text-sm text-slate-400">Get notified about leave request status changes</p>
            </div>
            <Switch
              checked={settings.leaveUpdates}
              onCheckedChange={(checked) => updateSetting("leaveUpdates", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-slate-200">Birthday Reminders</Label>
              <p className="text-sm text-slate-400">Receive birthday notifications for colleagues</p>
            </div>
            <Switch
              checked={settings.birthdayReminders}
              onCheckedChange={(checked) => updateSetting("birthdayReminders", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-slate-200">Attendance Alerts</Label>
              <p className="text-sm text-slate-400">Get reminded to mark attendance</p>
            </div>
            <Switch
              checked={settings.attendanceAlerts}
              onCheckedChange={(checked) => updateSetting("attendanceAlerts", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-slate-200">Salary Slip Notifications</Label>
              <p className="text-sm text-slate-400">Get notified when salary slips are available</p>
            </div>
            <Switch
              checked={settings.salarySlipNotifications}
              onCheckedChange={(checked) => updateSetting("salarySlipNotifications", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-slate-200">Team Updates</Label>
              <p className="text-sm text-slate-400">Receive updates about your team</p>
            </div>
            <Switch
              checked={settings.teamUpdates}
              onCheckedChange={(checked) => updateSetting("teamUpdates", checked)}
            />
          </div>
        </div>

        {success && (
          <div className="text-green-400 text-sm bg-green-900/20 p-3 rounded-md border border-green-800">
            Notification settings saved successfully!
          </div>
        )}

        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
      </CardContent>
    </Card>
  )
}
