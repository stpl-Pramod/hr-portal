import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"
import { logMiddleware, logAuth } from "@/lib/logger"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Skip middleware for static files and error pages to prevent redirect loops
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname === '/favicon.ico' ||
    request.nextUrl.pathname.startsWith('/auth/auth-code-error')
  ) {
    return supabaseResponse
  }

  logMiddleware("session_check", request.nextUrl.pathname)

  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey || 
      supabaseUrl === 'https://your-project-ref.supabase.co' || 
      supabaseAnonKey.includes('replace-with-your-actual-key')) {
    // Only redirect if not already on the error page
    if (request.nextUrl.pathname !== '/auth/auth-code-error') {
      logMiddleware("configuration_error", request.nextUrl.pathname, {
        supabaseUrl: !!supabaseUrl,
        supabaseAnonKey: !!supabaseAnonKey
      })
      const url = request.nextUrl.clone()
      url.pathname = '/auth/auth-code-error'
      url.searchParams.set('error', 'configuration_error')
      url.searchParams.set('error_description', 'Supabase credentials not configured')
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getUser() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  logMiddleware("user_check", request.nextUrl.pathname, {
    authenticated: !!user,
    userId: user?.id
  })

  // Handle authenticated users trying to access auth pages
  if (user && request.nextUrl.pathname.startsWith("/auth/")) {
    logAuth("authenticated_user_redirected_from_auth", undefined, user.id)
    logMiddleware("redirect_authenticated_to_dashboard", request.nextUrl.pathname)
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  // Handle unauthenticated users trying to access protected pages
  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/auth") &&
    request.nextUrl.pathname !== "/"
  ) {
    logAuth("unauthenticated_user_redirected_to_login")
    logMiddleware("redirect_unauthenticated_to_login", request.nextUrl.pathname)
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  return supabaseResponse
}
