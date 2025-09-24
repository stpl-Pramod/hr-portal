import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <CardTitle className="text-xl font-bold text-red-600 dark:text-red-400">
            Something went wrong
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            We apologize for the inconvenience. An unexpected error occurred.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="text-left">
              <summary className="cursor-pointer text-sm font-medium mb-2">
                Error Details
              </summary>
              <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                {error.message}
              </pre>
            </details>
          )}

          <div className="flex gap-2 justify-center">
            <Button 
              onClick={resetError} 
              variant="default"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            <Button 
              onClick={() => window.location.href = '/'} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function SimpleErrorFallback({ message = "Something went wrong" }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-center">
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}