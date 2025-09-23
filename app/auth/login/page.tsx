"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { createLoggedClient } from "@/lib/supabase/logged-client"
import { logAuth, logException, logNavigation } from "@/lib/logger"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const urlError = searchParams.get("error")
    const errorCode = searchParams.get("error_code")
    const errorDescription = searchParams.get("error_description")

    logNavigation("page_accessed", undefined, "/auth/login")

    if (urlError) {
      logAuth("login_page_error_displayed", {
        error: urlError,
        errorCode,
        errorDescription
      })
      
      if (errorCode === "otp_expired") {
        setError("Your email confirmation link has expired. Please request a new one below.")
      } else {
        setError(errorDescription || urlError)
      }
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Input validation
    if (!email.trim()) {
      setError("Please enter your email address")
      return
    }
    
    if (!password.trim()) {
      setError("Please enter your password")
      return
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    logAuth("login_attempt", { email })

    try {
      setIsLoading(true)
      setError(null)
      
      const supabase = createLoggedClient()
      
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      })

      if (error) {
        logAuth("login_failure", { 
          email, 
          error: error.message,
          errorCode: error.name
        })
        setError(error.message)
        return
      }

      logAuth("login_success", { email })

      logNavigation("redirect_after_login", "/login", "/dashboard")

      router.push("/dashboard")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      const error = err instanceof Error ? err : new Error(errorMessage)
      
      logException(error, {
        component: "LoginPage",
        action: "login_process",
        payload: { email }
      })
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

    const handleResendConfirmation = async () => {
    if (!email.trim()) {
      setError("Please enter your email address first")
      return
    }

    logAuth("resend_confirmation_attempt", { email })

    try {
      setIsResending(true)
      
      const supabase = createLoggedClient()
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      })

      if (error) {
        logAuth("resend_confirmation_failure", { 
          email, 
          error: error.message,
          errorCode: error.name
        })
        setError(error.message)
        return
      }

      logAuth("resend_confirmation_success", { email })
      setError("") // Clear any previous errors
      alert("Confirmation email sent! Please check your inbox.")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to resend confirmation email"
      const error = err instanceof Error ? err : new Error(errorMessage)
      
      logException(error, {
        component: "LoginPage",
        action: "resend_confirmation",
        payload: { email }
      })
      
      setError(errorMessage)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">HR Portal Login</CardTitle>
            <CardDescription className="text-slate-300">Enter your credentials to access the HR system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@company.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-md border border-red-800">
                  {error}
                  {error.includes("confirmation link has expired") && (
                    <div className="mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleResendConfirmation}
                        disabled={isResending}
                        className="bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600"
                      >
                        {isResending ? "Sending..." : "Resend Confirmation Email"}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {resendSuccess && (
                <div className="text-green-400 text-sm bg-green-900/20 p-3 rounded-md border border-green-800">
                  Confirmation email sent! Please check your inbox and click the link to verify your account.
                </div>
              )}

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-slate-400">
              Need an account?{" "}
              <Link href="/auth/register" className="text-blue-400 hover:text-blue-300 underline">
                Contact HR Admin
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
