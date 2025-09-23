import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Clock, Calendar, TrendingUp } from "lucide-react"

interface TeamMember {
  id: string
  first_name: string
  last_name: string
  position: string
  status: string
  avatar_url?: string
}

interface TeamOverviewCardsProps {
  teamMembers: TeamMember[]
  presentToday: number
  pendingLeaves: number
  teamPerformance: number
}

export function TeamOverviewCards({
  teamMembers,
  presentToday,
  pendingLeaves,
  teamPerformance,
}: TeamOverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-200">Team Size</CardTitle>
          <Users className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{teamMembers.length}</div>
          <p className="text-xs text-slate-400 mt-1">Active team members</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-200">Present Today</CardTitle>
          <Clock className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{presentToday}</div>
          <p className="text-xs text-slate-400 mt-1">
            {teamMembers.length > 0 ? Math.round((presentToday / teamMembers.length) * 100) : 0}% attendance
          </p>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-200">Pending Approvals</CardTitle>
          <Calendar className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{pendingLeaves}</div>
          <p className="text-xs text-slate-400 mt-1">Leave requests</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-200">Team Performance</CardTitle>
          <TrendingUp className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{teamPerformance}%</div>
          <p className="text-xs text-green-400 mt-1">+5% from last month</p>
        </CardContent>
      </Card>
    </div>
  )
}
