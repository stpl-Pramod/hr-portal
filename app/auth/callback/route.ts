import { createClient } from "@/lib/supabase/server"
import { logAuth, logException } from "@/lib/logger"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  logAuth("auth_callback_initiated", { 
    hasCode: !!code, 
    nextDestination: next,
    origin 
  })

  if (code) {
    const supabase = await createClient()
    try {
      logAuth("exchanging_code_for_session", { code: code.substring(0, 10) + "..." })
      
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error && data.user) {
        logAuth("session_exchange_success", { 
          userId: data.user.id,
          email: data.user.email
        })

        const { data: profile } = await supabase.from("profiles").select("id").eq("id", data.user.id).single()

        logAuth("profile_lookup", { 
          userId: data.user.id,
          profileFound: !!profile
        })

        const forwardedHost = request.headers.get("x-forwarded-host")
        const isLocalEnv = process.env.NODE_ENV === "development"

        let redirectUrl = ""
        if (isLocalEnv) {
          redirectUrl = `${origin}${next}`
        } else if (forwardedHost) {
          redirectUrl = `https://${forwardedHost}${next}`
        } else {
          redirectUrl = `${origin}${next}`
        }

        logAuth("auth_callback_redirect", { 
          userId: data.user.id,
          redirectUrl
        })

        return NextResponse.redirect(redirectUrl)
      } else {
        logAuth("session_exchange_failed", { 
          error: error?.message,
          hasUser: !!data.user
        })
      }
    } catch (error) {
      logException(error instanceof Error ? error : new Error("Auth callback error"), {
        component: "AuthCallback",
        action: "exchange_code_for_session",
        payload: { code: code.substring(0, 10) + "..." }
      })
    }
  }

  logAuth("auth_callback_failed", { 
    reason: "no_code_or_exchange_failed",
    redirectTo: "/auth/verify"
  })
  
  return NextResponse.redirect(`${origin}/auth/verify?error=invalid_link`)
}
