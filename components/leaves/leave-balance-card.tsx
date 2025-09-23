import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface LeaveBalance {
  type: string
  used: number
  total: number
  color: string
}

interface LeaveBalanceCardProps {
  balances: LeaveBalance[]
}

export function LeaveBalanceCard({ balances }: LeaveBalanceCardProps) {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Leave Balance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {balances.map((balance) => {
          const percentage = (balance.used / balance.total) * 100
          const remaining = balance.total - balance.used

          return (
            <div key={balance.type} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: balance.color }} />
                  <span className="text-slate-200 font-medium">{balance.type}</span>
                </div>
                <span className="text-slate-400 text-sm">
                  {remaining} of {balance.total} days left
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
              <div className="flex justify-between text-xs text-slate-400">
                <span>Used: {balance.used} days</span>
                <span>{percentage.toFixed(0)}% used</span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
