import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, FileText, User } from "lucide-react"

interface Activity {
  id: string
  type: "attendance" | "leave" | "salary" | "profile"
  title: string
  description: string
  timestamp: string
  status?: "pending" | "approved" | "rejected"
}

interface RecentActivityProps {
  activities: Activity[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getIcon = (type: Activity["type"]) => {
    switch (type) {
      case "attendance":
        return Clock
      case "leave":
        return Calendar
      case "salary":
        return FileText
      case "profile":
        return User
      default:
        return Clock
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "approved":
        return "bg-green-600"
      case "rejected":
        return "bg-red-600"
      case "pending":
        return "bg-yellow-600"
      default:
        return "bg-slate-600"
    }
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-slate-400 text-sm">No recent activity</p>
        ) : (
          activities.map((activity) => {
            const Icon = getIcon(activity.type)
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                  <Icon className="h-4 w-4 text-slate-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white">{activity.title}</p>
                    {activity.status && (
                      <Badge className={`text-xs ${getStatusColor(activity.status)}`}>{activity.status}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{activity.description}</p>
                  <p className="text-xs text-slate-500 mt-1">{activity.timestamp}</p>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
