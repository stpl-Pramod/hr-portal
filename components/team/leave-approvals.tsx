"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Check, X, Calendar, Clock, User } from "lucide-react"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase/client"

interface LeaveRequest {
  id: string
  employee_id: string
  start_date: string
  end_date: string
  days_requested: number
  reason: string
  status: string
  created_at: string
  profiles: {
    first_name: string
    last_name: string
    avatar_url?: string
    position: string
  }
  leave_types: {
    name: string
    color: string
  }
}

interface LeaveApprovalsProps {
  leaveRequests: LeaveRequest[]
  onUpdate: () => void
}

export function LeaveApprovals({ leaveRequests, onUpdate }: LeaveApprovalsProps) {
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectionForm, setShowRejectionForm] = useState<string | null>(null)

  const handleApprove = async (requestId: string) => {
    setProcessingId(requestId)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("leave_requests")
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
        })
        .eq("id", requestId)

      if (error) throw error
      onUpdate()
    } catch (error) {
      console.error("Error approving leave:", error)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (requestId: string) => {
    if (!rejectionReason.trim()) return

    setProcessingId(requestId)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("leave_requests")
        .update({
          status: "rejected",
          rejection_reason: rejectionReason,
          approved_at: new Date().toISOString(),
        })
        .eq("id", requestId)

      if (error) throw error
      setRejectionReason("")
      setShowRejectionForm(null)
      onUpdate()
    } catch (error) {
      console.error("Error rejecting leave:", error)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Pending Leave Approvals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {leaveRequests.length === 0 ? (
          <p className="text-slate-400 text-center py-4">No pending leave requests</p>
        ) : (
          leaveRequests.map((request) => (
            <div key={request.id} className="p-4 bg-slate-700 rounded-lg space-y-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={request.profiles.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-blue-600 text-white">
                    {request.profiles.first_name && request.profiles.last_name ? (
                      <>
                        {request.profiles.first_name[0]}
                        {request.profiles.last_name[0]}
                      </>
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-white">
                      {request.profiles.first_name} {request.profiles.last_name}
                    </p>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: request.leave_types.color }} />
                      <Badge variant="secondary" className="text-xs">
                        {request.leave_types.name}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 mb-2">{request.profiles.position}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-400 mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(request.start_date), "MMM dd")} -{" "}
                        {format(new Date(request.end_date), "MMM dd, yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{request.days_requested} days</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300">{request.reason}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    Applied on {format(new Date(request.created_at), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>

              {showRejectionForm === request.id ? (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Please provide a reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="bg-slate-600 border-slate-500 text-white"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(request.id)}
                      disabled={processingId === request.id || !rejectionReason.trim()}
                    >
                      Confirm Rejection
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowRejectionForm(null)
                        setRejectionReason("")
                      }}
                      className="border-slate-600 text-slate-300 hover:bg-slate-600"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(request.id)}
                    disabled={processingId === request.id}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setShowRejectionForm(request.id)}
                    disabled={processingId === request.id}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
