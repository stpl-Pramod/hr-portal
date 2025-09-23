"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { createLoggedClient } from "@/lib/supabase/logged-client"
import { logForm, logException, logNavigation } from "@/lib/logger"
import { useRouter } from "next/navigation"

interface LeaveType {
  id: string
  name: string
  max_days_per_year: number
  color: string
}

interface LeaveRequestFormProps {
  leaveTypes: LeaveType[]
  employeeId: string
}

export function LeaveRequestForm({ leaveTypes, employeeId }: LeaveRequestFormProps) {
  const [formData, setFormData] = useState({
    leave_type_id: "",
    start_date: undefined as Date | undefined,
    end_date: undefined as Date | undefined,
    reason: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const calculateDays = () => {
    if (formData.start_date && formData.end_date) {
      return differenceInDays(formData.end_date, formData.start_date) + 1
    }
    return 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Log form submission attempt
    logForm("leave_request_form_submitted", "LeaveRequestForm", {
      leave_type_id: formData.leave_type_id,
      start_date: formData.start_date?.toISOString().split("T")[0],
      end_date: formData.end_date?.toISOString().split("T")[0],
      reason: formData.reason,
      employee_id: employeeId
    }, employeeId)

    if (!formData.start_date || !formData.end_date) {
      logForm("leave_request_validation_failed", "LeaveRequestForm", {
        error: "missing_dates",
        has_start_date: !!formData.start_date,
        has_end_date: !!formData.end_date
      }, employeeId)
      setError("Please select both start and end dates")
      setIsLoading(false)
      return
    }

    if (formData.end_date < formData.start_date) {
      logForm("leave_request_validation_failed", "LeaveRequestForm", {
        error: "invalid_date_range",
        start_date: formData.start_date.toISOString().split("T")[0],
        end_date: formData.end_date.toISOString().split("T")[0]
      }, employeeId)
      setError("End date must be after start date")
      setIsLoading(false)
      return
    }

    const supabase = createLoggedClient()
    const daysRequested = calculateDays()

    // Log calculated values
    logForm("leave_request_calculation", "LeaveRequestForm", {
      days_requested: daysRequested,
      start_date: formData.start_date.toISOString().split("T")[0],
      end_date: formData.end_date.toISOString().split("T")[0]
    }, employeeId)

    try {
      const { error } = await supabase.from("leave_requests").insert({
        employee_id: employeeId,
        leave_type_id: formData.leave_type_id,
        start_date: formData.start_date.toISOString().split("T")[0],
        end_date: formData.end_date.toISOString().split("T")[0],
        days_requested: daysRequested,
        reason: formData.reason,
        status: "pending",
      })

      if (error) throw error

      logForm("leave_request_submitted_successfully", "LeaveRequestForm", {
        leave_type_id: formData.leave_type_id,
        days_requested: daysRequested,
        status: "pending"
      }, employeeId)

      logNavigation("leave_request_redirect", "/dashboard/leaves/new", "/dashboard/leaves", employeeId)
      router.push("/dashboard/leaves")
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred"
      
      logException(error instanceof Error ? error : new Error(errorMessage), {
        component: "LeaveRequestForm",
        action: "submit_leave_request",
        payload: {
          leave_type_id: formData.leave_type_id,
          days_requested: daysRequested,
          employee_id: employeeId
        },
        userId: employeeId
      })

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Submit Leave Request</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="leave_type" className="text-slate-200">
              Leave Type
            </Label>
            <Select
              value={formData.leave_type_id}
              onValueChange={(value) => setFormData({ ...formData, leave_type_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                      <div>
                        <div className="font-medium">{type.name}</div>
                        <div className="text-xs text-slate-400">{type.max_days_per_year} days/year</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-200">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-slate-700 border-slate-600 text-white hover:bg-slate-600",
                      !formData.start_date && "text-slate-400",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_date ? format(formData.start_date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700">
                  <Calendar
                    mode="single"
                    selected={formData.start_date}
                    onSelect={(date) => setFormData({ ...formData, start_date: date })}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="text-white"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-slate-700 border-slate-600 text-white hover:bg-slate-600",
                      !formData.end_date && "text-slate-400",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.end_date ? format(formData.end_date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700">
                  <Calendar
                    mode="single"
                    selected={formData.end_date}
                    onSelect={(date) => setFormData({ ...formData, end_date: date })}
                    disabled={(date) => date < (formData.start_date || new Date())}
                    initialFocus
                    className="text-white"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {formData.start_date && formData.end_date && (
            <div className="p-4 bg-slate-700 rounded-lg">
              <p className="text-slate-200">
                <span className="font-medium">Duration:</span> {calculateDays()} day{calculateDays() !== 1 ? "s" : ""}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-slate-200">
              Reason
            </Label>
            <Textarea
              id="reason"
              placeholder="Please provide a reason for your leave request..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              rows={4}
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-md border border-red-800">{error}</div>
          )}

          <div className="flex gap-4">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
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
