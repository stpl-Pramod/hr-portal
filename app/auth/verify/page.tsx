"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { logAuth, logException, logNavigation, logForm } from "@/lib/logger"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

export default function VerifyPage() {
  const [email, setEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    }
  }, [searchParams])

  const handleResendEmail = async () => {
    if (!email) {
      setError("Please enter your email address")
      return
    }

    const supabase = createClient()
    setIsResending(true)
    setError(null)
    setSuccess(null)

    logAuth("verification_resend_attempt", { email })

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      logAuth("verification_resend_success", { email })
      setSuccess("Verification email sent! Please check your inbox.")
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to resend verification email"
      logAuth("verification_resend_failed", { 
        email, 
        error: errorMessage 
      })
      logException(error instanceof Error ? error : new Error(errorMessage), {
        component: "VerifyPage",
        action: "resend_verification"
      })
      setError(errorMessage)
    } finally {
      setIsResending(false)
    }
  }

  const handleCodeVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !verificationCode) {
      setError("Please enter both email and verification code")
      return
    }

    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    logAuth("email_verification_attempt", { 
      email,
      codeLength: verificationCode.length 
    })

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: verificationCode,
        type: "signup",
      })

      if (error) throw error

      logAuth("email_verification_success", { email })
      logNavigation("verification_redirect", "/auth/verify", "/dashboard")
      
      setSuccess("Email verified successfully! Redirecting to dashboard...")
      setTimeout(() => {
        window.location.href = "/dashboard"
      }, 2000)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Invalid verification code"
      logAuth("email_verification_failed", { 
        email,
        error: errorMessage 
      })
      logException(error instanceof Error ? error : new Error(errorMessage), {
        component: "VerifyPage",
        action: "code_verification"
      })
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">Verify Your Email</CardTitle>
            <CardDescription className="text-slate-300">Choose your preferred verification method</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-700">
                <TabsTrigger value="email" className="data-[state=active]:bg-slate-600">
                  Email Link
                </TabsTrigger>
                <TabsTrigger value="code" className="data-[state=active]:bg-slate-600">
                  Verification Code
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-200">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <Button
                  onClick={handleResendEmail}
                  disabled={isResending || !email}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isResending ? "Sending..." : "Send Verification Email"}
                </Button>

                <p className="text-sm text-slate-400 text-center">
                  We'll send you a fresh verification link that won't expire for 24 hours.
                </p>
              </TabsContent>

              <TabsContent value="code" className="space-y-4 mt-4">
                <form onSubmit={handleCodeVerification} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-code" className="text-slate-200">
                      Email Address
                    </Label>
                    <Input
                      id="email-code"
                      type="email"
                      placeholder="john@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-slate-200">
                      Verification Code
                    </Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      maxLength={6}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !email || !verificationCode}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isLoading ? "Verifying..." : "Verify Code"}
                  </Button>
                </form>

                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={handleResendEmail}
                    disabled={isResending || !email}
                    className="text-blue-400 hover:text-blue-300 p-0 h-auto"
                  >
                    {isResending ? "Sending..." : "Send me a verification code"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {error && (
              <div className="mt-4 text-red-400 text-sm bg-red-900/20 p-3 rounded-md border border-red-800">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-4 text-green-400 text-sm bg-green-900/20 p-3 rounded-md border border-green-800">
                {success}
              </div>
            )}

            <div className="mt-6 text-center text-sm text-slate-400">
              Already verified?{" "}
              <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 underline">
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
