import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
export async function createClient() {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Check if environment variables are properly configured
  if (!supabaseUrl || supabaseUrl === 'https://your-project-ref.supabase.co') {
    throw new Error(
      'Missing or invalid NEXT_PUBLIC_SUPABASE_URL. Please check your .env.local file and add your actual Supabase project URL.\n' +
      'Get it from: https://supabase.com/dashboard/project/_/settings/api'
    )
  }
  
  if (!supabaseAnonKey || supabaseAnonKey.includes('replace-with-your-actual-key')) {
    throw new Error(
      'Missing or invalid NEXT_PUBLIC_SUPABASE_ANON_KEY. Please check your .env.local file and add your actual Supabase anon key.\n' +
      'Get it from: https://supabase.com/dashboard/project/_/settings/api'
    )
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The "setAll" method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}
