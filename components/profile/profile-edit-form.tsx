"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, Loader2, User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { createLoggedClient } from "@/lib/supabase/logged-client"
import { logForm, logException } from "@/lib/logger"

interface ProfileEditFormProps {
  profile: {
    id: string
    employee_id: string
    first_name: string
    last_name: string
    email: string
    phone?: string
    department: string
    position: string
    role: string
    hire_date: string
    address?: string
    emergency_contact_name?: string
    emergency_contact_phone?: string
    avatar_url?: string
  }
  onUpdate: (updatedProfile: any) => void
}

export function ProfileEditForm({ profile, onUpdate }: ProfileEditFormProps) {
  const [formData, setFormData] = useState({
    first_name: profile.first_name,
    last_name: profile.last_name,
    phone: profile.phone || "",
    address: profile.address || "",
    emergency_contact_name: profile.emergency_contact_name || "",
    emergency_contact_phone: profile.emergency_contact_phone || "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    // Log profile update attempt
    logForm("profile_update_form_submitted", "ProfileEditForm", {
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone,
      address: formData.address,
      emergency_contact_name: formData.emergency_contact_name,
      emergency_contact_phone: formData.emergency_contact_phone,
      profile_id: profile.id
    }, profile.id)

    const supabase = createLoggedClient()

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          address: formData.address,
          emergency_contact_name: formData.emergency_contact_name,
          emergency_contact_phone: formData.emergency_contact_phone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)
        .select()
        .single()

      if (error) throw error

      logForm("profile_update_successful", "ProfileEditForm", {
        profile_id: profile.id,
        updated_fields: {
          first_name: formData.first_name !== profile.first_name,
          last_name: formData.last_name !== profile.last_name,
          phone: formData.phone !== profile.phone,
          address: formData.address !== profile.address,
          emergency_contact_name: formData.emergency_contact_name !== profile.emergency_contact_name,
          emergency_contact_phone: formData.emergency_contact_phone !== profile.emergency_contact_phone
        }
      }, profile.id)

      setSuccess(true)
      onUpdate({ ...profile, ...formData })
      setTimeout(() => setSuccess(false), 3000)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred"
      
      logException(error instanceof Error ? error : new Error(errorMessage), {
        component: "ProfileEditForm",
        action: "update_profile",
        payload: {
          profile_id: profile.id,
          form_data: formData
        },
        userId: profile.id
      })

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="bg-blue-600 text-white text-lg">
                {profile.first_name && profile.last_name ? (
                  <>
                    {profile.first_name[0]}
                    {profile.last_name[0]}
                  </>
                ) : (
                  <User className="h-8 w-8" />
                )}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button
                type="button"
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
              >
                <Upload className="h-4 w-4 mr-2" />
                Change Photo
              </Button>
              <p className="text-xs text-slate-400 mt-2">JPG, PNG or GIF. Max size 2MB.</p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="first_name" className="text-slate-200">
                First Name
              </Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name" className="text-slate-200">
                Last Name
              </Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>
          </div>

          {/* Read-only fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-slate-200">Email</Label>
              <Input
                value={profile.email}
                disabled
                className="bg-slate-600 border-slate-500 text-slate-300 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200">Employee ID</Label>
              <Input
                value={profile.employee_id}
                disabled
                className="bg-slate-600 border-slate-500 text-slate-300 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-slate-200">Department</Label>
              <Input
                value={profile.department}
                disabled
                className="bg-slate-600 border-slate-500 text-slate-300 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200">Position</Label>
              <Input
                value={profile.position}
                disabled
                className="bg-slate-600 border-slate-500 text-slate-300 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-slate-200">
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-slate-200">
              Address
            </Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Enter your full address"
              rows={3}
            />
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name" className="text-slate-200">
                  Contact Name
                </Label>
                <Input
                  id="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone" className="text-slate-200">
                  Contact Phone
                </Label>
                <Input
                  id="emergency_contact_phone"
                  type="tel"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-md border border-red-800">{error}</div>
          )}

          {success && (
            <div className="text-green-400 text-sm bg-green-900/20 p-3 rounded-md border border-green-800">
              Profile updated successfully!
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
