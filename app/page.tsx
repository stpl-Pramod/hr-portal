import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function HomePage({
  searchParams,
}: {
  searchParams: { error?: string; error_code?: string; error_description?: string }
}) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Handle authentication errors from email confirmation
    if (searchParams.error) {
      if (searchParams.error_code === "otp_expired") {
        redirect("/auth/login?error=otp_expired")
      } else {
        redirect(`/auth/login?error=${searchParams.error}&error_description=${searchParams.error_description}`)
      }
    }

    if (user) {
      redirect("/dashboard")
    } else {
      redirect("/auth/login")
    }
  } catch (error) {
    // Add more specific error handling
    console.error('Authentication error:', error)
    
    // Check if this is a database/table error vs configuration error
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
      // Database tables not set up yet
      redirect("/auth/auth-code-error?error=database_setup&error_description=Database tables not created. Please run the SQL scripts in Supabase.")
    } else if (errorMessage.includes('Invalid API key') || errorMessage.includes('project not found')) {
      // Actual configuration error
      redirect("/auth/auth-code-error?error=configuration_error&error_description=Invalid Supabase credentials")
    } else {
      // For any other error, just redirect to login
      redirect("/auth/login")
    }
  }
}
