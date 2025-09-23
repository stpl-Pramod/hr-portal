import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, X, Calendar, Clock, User } from "lucide-react"

interface PendingApproval {
  id: string
  type: "leave" | "attendance"
  employee: {
    name: string
    avatar?: string
    department: string
  }
  title: string
  description: string
  date: string
  duration?: string
}

interface PendingApprovalsProps {
  approvals: PendingApproval[]
}

export function PendingApprovals({ approvals }: PendingApprovalsProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "leave":
        return Calendar
      case "attendance":
        return Clock
      default:
        return Calendar
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "leave":
        return "bg-blue-600"
      case "attendance":
        return "bg-green-600"
      default:
        return "bg-slate-600"
    }
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Pending Approvals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {approvals.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">No pending approvals</p>
        ) : (
          approvals.map((approval) => {
            const Icon = getIcon(approval.type)
            return (
              <div key={approval.id} className="flex items-start gap-3 p-4 bg-slate-700 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={approval.employee.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-blue-600 text-white">
                    {approval.employee.name ? (
                      approval.employee.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4 text-slate-400" />
                    <Badge className={`${getTypeColor(approval.type)} text-white text-xs`}>
                      {approval.type.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="font-medium text-white text-sm">{approval.title}</p>
                  <p className="text-xs text-slate-400 mb-1">
                    {approval.employee.name} • {approval.employee.department}
                  </p>
                  <p className="text-xs text-slate-300">{approval.description}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                    <span>{approval.date}</span>
                    {approval.duration && <span>• {approval.duration}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
