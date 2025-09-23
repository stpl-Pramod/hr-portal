// Test with updated port configuration
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const redirectUrl = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL

console.log('🔧 Testing updated configuration...')
console.log('Redirect URL:', redirectUrl)

const supabase = createClient(supabaseUrl, supabaseKey)

async function testWithUpdatedConfig() {
  const testEmail = `testuser${Math.floor(Math.random() * 10000)}@gmail.com`
  
  try {
    console.log('\n🧪 Testing with updated port configuration...')
    console.log('📧 Test email:', testEmail)
    console.log('🔗 Redirect URL:', redirectUrl)
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpassword123',
      options: {
        emailRedirectTo: redirectUrl,
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
    } else {
      console.log('✅ Registration successful!')
      console.log('📧 User ID:', data.user?.id)
      console.log('📧 Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No')
      
      if (!data.user?.email_confirmed_at) {
        console.log('\n🎉 Configuration updated successfully!')
        console.log('📬 Verification email should be sent to:', testEmail)
        console.log('🔗 With redirect to:', redirectUrl)
        console.log('\n📋 Next steps:')
        console.log('1. Open http://localhost:3002/auth/register')
        console.log('2. Register with your real email address')
        console.log('3. Check your email inbox (and spam folder)')
        console.log('4. Update Supabase redirect URLs to include port 3002')
      }
    }
  } catch (err) {
    console.log('❌ Test error:', err.message)
  }
}

testWithUpdatedConfig()