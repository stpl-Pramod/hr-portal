import { createClient } from './client'

/**
 * Test Supabase connectivity and configuration
 */
export async function testSupabaseConnection() {
  try {
    const supabase = createClient()
    
    // Simple health check - try to get the current user session
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Supabase connection error:', error.message)
      return {
        success: false,
        error: error.message,
        details: 'Authentication check failed'
      }
    }
    
    console.log('✅ Supabase connection successful!')
    return {
      success: true,
      message: 'Supabase client initialized successfully',
      sessionExists: !!data.session
    }
    
  } catch (error) {
    console.error('Supabase configuration error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Client initialization failed'
    }
  }
}