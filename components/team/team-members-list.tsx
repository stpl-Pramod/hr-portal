import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, MessageCircle, Calendar, User } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface TeamMember {
  id: string
  first_name: string
  last_name: string
  position: string
  status: string
  avatar_url?: string
  email: string
  phone?: string
}

interface TeamMembersListProps {
  teamMembers: TeamMember[]
}

export function TeamMembersList({ teamMembers }: TeamMembersListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-600"
      case "inactive":
        return "bg-yellow-600"
      case "on_leave":
        return "bg-blue-600"
      default:
        return "bg-slate-600"
    }
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Team Members</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {teamMembers.length === 0 ? (
          <p className="text-slate-400 text-center py-4">No team members found</p>
        ) : (
          teamMembers.map((member) => (
            <div key={member.id} className="flex items-center gap-4 p-4 bg-slate-700 rounded-lg">
              <Avatar className="h-12 w-12">
                <AvatarImage src={member.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="bg-blue-600 text-white">
                  {member.first_name && member.last_name ? (
                    <>
                      {member.first_name[0]}
                      {member.last_name[0]}
                    </>
                  ) : (
                    <User className="h-6 w-6" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-white">
                    {member.first_name} {member.last_name}
                  </p>
                  <Badge className={`${getStatusColor(member.status)} text-white text-xs`}>
                    {member.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-slate-300">{member.position}</p>
                <p className="text-xs text-slate-400">{member.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-600 bg-transparent"
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-600 bg-transparent"
                >
                  <Calendar className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                    <DropdownMenuItem className="text-slate-300 hover:bg-slate-700">View Profile</DropdownMenuItem>
                    <DropdownMenuItem className="text-slate-300 hover:bg-slate-700">View Attendance</DropdownMenuItem>
                    <DropdownMenuItem className="text-slate-300 hover:bg-slate-700">
                      Performance Review
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
