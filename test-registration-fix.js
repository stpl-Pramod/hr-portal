// Simple test to check if registration works after database fix
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Testing user registration after database fix...')

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRegistration() {
  const testEmail = `testuser${Math.floor(Math.random() * 10000)}@gmail.com`
  
  try {
    console.log('\n🧪 Testing registration with email:', testEmail)
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpassword123',
      options: {
        emailRedirectTo: 'http://localhost:3000/auth/callback',
        data: {
          first_name: 'Test',
          last_name: 'User',
          department: 'IT',
          position: 'Developer',
          role: 'employee'
        }
      }
    })
    
    if (error) {
      console.log('❌ Registration failed:', error.message)
      
      if (error.message.includes('Database error')) {
        console.log('\n💡 Database fix may not have been applied yet.')
        console.log('Please run the SQL fix in Supabase Dashboard.')
      }
    } else {
      console.log('✅ Registration successful!')
      console.log('📧 User ID:', data.user?.id)
      console.log('📧 Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No (verification email should be sent)')
      
      if (!data.user?.email_confirmed_at) {
        console.log('\n🎉 SUCCESS! The registration worked!')
        console.log('📬 A verification email should have been sent to:', testEmail)
        console.log('💡 Check your Supabase Auth logs to see if email was sent.')
      }
    }
  } catch (err) {
    console.log('❌ Test error:', err.message)
  }
}

testRegistration()