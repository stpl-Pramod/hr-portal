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
    setError(null)
    
    // Validation
    if (!formData.leave_type_id) {
      setError("Please select a leave type")
      return
    }
    
    if (!formData.start_date) {
      setError("Please select a start date")
      return
    }
    
    if (!formData.end_date) {
      setError("Please select an end date")
      return
    }
    
    if (!formData.reason.trim()) {
      setError("Please provide a reason for your leave request")
      return
    }

    if (formData.start_date > formData.end_date) {
      setError("End date must be after or equal to start date")
      return
    }

    setIsLoading(true)

    try {
      logForm("leave_request_form", "submit_started", {
        leave_type_id: formData.leave_type_id,
        start_date: formData.start_date.toISOString(),
        end_date: formData.end_date.toISOString(),
        days_requested: calculateDays(),
        employee_id: employeeId,
      })

      const supabase = createLoggedClient()
      
      const { data, error: submitError } = await supabase
        .from("leave_requests")
        .insert({
          employee_id: employeeId,
          leave_type_id: formData.leave_type_id,
          start_date: formData.start_date.toISOString().split('T')[0],
          end_date: formData.end_date.toISOString().split('T')[0],
          days_requested: calculateDays(),
          reason: formData.reason.trim(),
          status: "pending",
        })
        .select()

      if (submitError) {
        logException(new Error(submitError.message || "Submit failed"), {
          component: "leave_request_form",
          action: "submit_failed",
          userId: employeeId,
        })
        throw submitError
      }

      logForm("leave_request_form", "submit_success", {
        request_id: data?.[0]?.id,
        employee_id: employeeId,
      })

      // Reset form
      setFormData({
        leave_type_id: "",
        start_date: undefined,
        end_date: undefined,
        reason: "",
      })

      // Show success message and redirect
      alert("Leave request submitted successfully!")
      router.refresh()
      
    } catch (error) {
      console.error("Error submitting leave request:", error)
      logException(error instanceof Error ? error : new Error("Unknown error"), {
        component: "leave_request_form",
        action: "submit_error",
        userId: employeeId,
      })
      setError("Failed to submit leave request. Please try again.")
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
                      "w-full justify-start text-left font-normal bg-slate-700 border-slate-600 text-white hover:bg-slate-600 hover:border-slate-500",
                      !formData.start_date && "text-slate-400",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_date ? format(formData.start_date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.start_date}
                    onSelect={(date) => {
                      setFormData({ ...formData, start_date: date })
                      // Reset end date if it's before the new start date
                      if (date && formData.end_date && formData.end_date < date) {
                        setFormData(prev => ({ ...prev, start_date: date, end_date: undefined }))
                      }
                    }}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    className="rounded-md border-0"
                    classNames={{
                      months: "flex w-full flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                      month: "space-y-4",
                      caption: "flex justify-center pt-1 relative items-center text-white",
                      caption_label: "text-sm font-medium text-white",
                      nav: "space-x-1 flex items-center",
                      nav_button: "h-7 w-7 bg-transparent p-0 text-slate-400 hover:text-white hover:bg-slate-700",
                      nav_button_previous: "absolute left-1",
                      nav_button_next: "absolute right-1",
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex",
                      head_cell: "text-slate-400 rounded-md w-9 font-normal text-[0.8rem]",
                      row: "flex w-full mt-2",
                      cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-slate-700 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                      day: "h-9 w-9 p-0 font-normal text-white hover:bg-slate-700 hover:text-white aria-selected:opacity-100",
                      day_selected: "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-600 focus:text-white",
                      day_today: "bg-slate-700 text-white",
                      day_outside: "text-slate-500 opacity-50",
                      day_disabled: "text-slate-500 opacity-50 cursor-not-allowed",
                      day_range_middle: "aria-selected:bg-slate-700 aria-selected:text-white",
                      day_hidden: "invisible",
                    }}
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
                      "w-full justify-start text-left font-normal bg-slate-700 border-slate-600 text-white hover:bg-slate-600 hover:border-slate-500",
                      !formData.end_date && "text-slate-400",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.end_date ? format(formData.end_date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.end_date}
                    onSelect={(date) => setFormData({ ...formData, end_date: date })}
                    disabled={(date) => {
                      const today = new Date(new Date().setHours(0, 0, 0, 0))
                      const startDate = formData.start_date || today
                      return date < startDate
                    }}
                    initialFocus
                    className="rounded-md border-0"
                    classNames={{
                      months: "flex w-full flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                      month: "space-y-4",
                      caption: "flex justify-center pt-1 relative items-center text-white",
                      caption_label: "text-sm font-medium text-white",
                      nav: "space-x-1 flex items-center",
                      nav_button: "h-7 w-7 bg-transparent p-0 text-slate-400 hover:text-white hover:bg-slate-700",
                      nav_button_previous: "absolute left-1",
                      nav_button_next: "absolute right-1",
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex",
                      head_cell: "text-slate-400 rounded-md w-9 font-normal text-[0.8rem]",
                      row: "flex w-full mt-2",
                      cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-slate-700 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                      day: "h-9 w-9 p-0 font-normal text-white hover:bg-slate-700 hover:text-white aria-selected:opacity-100",
                      day_selected: "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-600 focus:text-white",
                      day_today: "bg-slate-700 text-white",
                      day_outside: "text-slate-500 opacity-50",
                      day_disabled: "text-slate-500 opacity-50 cursor-not-allowed",
                      day_range_middle: "aria-selected:bg-slate-700 aria-selected:text-white",
                      day_hidden: "invisible",
                    }}
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
