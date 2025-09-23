import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
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

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
