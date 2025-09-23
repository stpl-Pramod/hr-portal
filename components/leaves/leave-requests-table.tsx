"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal, Search, Filter, Eye, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format } from "date-fns"

interface LeaveRequest {
  id: string
  leave_type: {
    name: string
    color: string
  }
  start_date: string
  end_date: string
  days_requested: number
  reason: string
  status: string
  created_at: string
  approved_by?: {
    first_name: string
    last_name: string
  }
  approved_at?: string
  rejection_reason?: string
}

interface LeaveRequestsTableProps {
  requests: LeaveRequest[]
  showEmployeeColumn?: boolean
}

export function LeaveRequestsTable({ requests, showEmployeeColumn = false }: LeaveRequestsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.leave_type.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || request.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-600"
      case "rejected":
        return "bg-red-600"
      case "pending":
        return "bg-yellow-600"
      case "cancelled":
        return "bg-slate-600"
      default:
        return "bg-slate-600"
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border border-slate-700 bg-slate-800">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700 hover:bg-slate-700">
              <TableHead className="text-slate-300">Leave Type</TableHead>
              <TableHead className="text-slate-300">Start Date</TableHead>
              <TableHead className="text-slate-300">End Date</TableHead>
              <TableHead className="text-slate-300">Days</TableHead>
              <TableHead className="text-slate-300">Status</TableHead>
              <TableHead className="text-slate-300">Applied On</TableHead>
              <TableHead className="text-slate-300 w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((request) => (
              <TableRow key={request.id} className="border-slate-700 hover:bg-slate-700">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: request.leave_type.color }} />
                    <span className="text-white font-medium">{request.leave_type.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-slate-300">{format(new Date(request.start_date), "MMM dd, yyyy")}</TableCell>
                <TableCell className="text-slate-300">{format(new Date(request.end_date), "MMM dd, yyyy")}</TableCell>
                <TableCell className="text-slate-300">{request.days_requested}</TableCell>
                <TableCell>
                  <Badge className={`${getStatusColor(request.status)} text-white`}>
                    {request.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-300">{format(new Date(request.created_at), "MMM dd, yyyy")}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                      <DropdownMenuItem className="text-slate-300 hover:bg-slate-700">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      {request.status === "pending" && (
                        <>
                          <DropdownMenuItem className="text-slate-300 hover:bg-slate-700">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Request
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-400 hover:bg-slate-700">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Cancel Request
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <p>No leave requests found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
