// Test script to check Supabase email configuration
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hvegmmsygtwfafieejdp.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2ZWdtbXN5Z3R3ZmFmaWVlamRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MzE2OTYsImV4cCI6MjA3NDEwNzY5Nn0.Qri2VK2Fj68k0vyIDY7UBxJWzzqu2IhhPtxQzg5-LHc'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testEmailSignup() {
  console.log('Testing Supabase email signup configuration...')
  console.log('Supabase URL:', supabaseUrl)
  console.log('Redirect URL:', 'http://localhost:3000/auth/callback')
  
  try {
    // Test with a temporary email
    const testEmail = `test-${Date.now()}@example.com`
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpassword123',
      options: {
        emailRedirectTo: 'http://localhost:3000/auth/callback',
        data: {
          first_name: 'Test',
          last_name: 'User'
        }
      }
    })
    
    if (error) {
      console.error('Signup error:', error.message)
      if (error.message.includes('email')) {
        console.log('\nPossible causes:')
        console.log('1. Email delivery not configured in Supabase')
        console.log('2. Redirect URL not whitelisted in Supabase Auth settings')
        console.log('3. SMTP settings not configured')
      }
    } else {
      console.log('Signup successful!')
      console.log('User created:', data.user?.id)
      console.log('Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No')
      
      if (!data.user?.email_confirmed_at) {
        console.log('\nEmail confirmation required but email may not be sent.')
        console.log('Check Supabase dashboard:')
        console.log('1. Authentication > Settings > SMTP Settings')
        console.log('2. Authentication > URL Configuration > Redirect URLs')
      }
    }
  } catch (err) {
    console.error('Test failed:', err.message)
  }
}

testEmailSignup()