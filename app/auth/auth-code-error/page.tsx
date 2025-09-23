import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertTriangle, Settings } from "lucide-react"

interface AuthCodeErrorPageProps {
  searchParams: {
    error?: string
    error_description?: string
  }
}

export default function AuthCodeErrorPage({ searchParams }: AuthCodeErrorPageProps) {
  const isConfigurationError = searchParams.error === 'configuration_error'
  const isDatabaseSetupError = searchParams.error === 'database_setup'
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center">
              {isConfigurationError || isDatabaseSetupError ? (
                <Settings className="w-8 h-8 text-red-400" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-red-400" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              {isConfigurationError ? 'Configuration Error' : 
               isDatabaseSetupError ? 'Database Setup Required' : 
               'Authentication Error'}
            </CardTitle>
            <CardDescription className="text-slate-300">
              {isConfigurationError 
                ? 'Application needs to be configured' 
                : isDatabaseSetupError 
                ? 'Database tables need to be created'
                : 'There was an issue confirming your email'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {isDatabaseSetupError ? (
              <>
                <div className="bg-blue-900/20 p-3 rounded border border-blue-700 text-left">
                  <p className="text-blue-400 text-sm font-medium mb-2">Database Setup Required:</p>
                  <ul className="text-blue-300 text-sm space-y-1">
                    <li>• Go to Supabase Dashboard SQL Editor</li>
                    <li>• Run all scripts from DATABASE_SETUP.md</li>
                    <li>• Create the profiles, departments, and other tables</li>
                  </ul>
                </div>
                <p className="text-slate-300 text-sm">
                  Please follow the DATABASE_SETUP.md instructions to create the required database tables.
                </p>
              </>
            ) : isConfigurationError ? (
              <>
                <div className="bg-yellow-900/20 p-3 rounded border border-yellow-700 text-left">
                  <p className="text-yellow-400 text-sm font-medium mb-2">Configuration Required:</p>
                  <ul className="text-yellow-300 text-sm space-y-1">
                    <li>• Add Supabase URL to .env.local</li>
                    <li>• Add Supabase API key to .env.local</li>
                    <li>• Restart the development server</li>
                  </ul>
                </div>
                <p className="text-slate-300 text-sm">
                  Please check the SUPABASE_SETUP.md file for detailed instructions.
                </p>
              </>
            ) : (
              <>
                <p className="text-slate-300">
                  {searchParams.error_description || 
                   'The confirmation link may have expired or been used already. Please try signing up again or contact support if the issue persists.'}
                </p>
                <div className="flex flex-col gap-2">
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/auth/register">Sign Up Again</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                  >
                    <Link href="/auth/login">Back to Login</Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
