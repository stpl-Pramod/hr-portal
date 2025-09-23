// Script to apply database fixes through Supabase client
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Use service role key for admin operations - you'll need to add this to .env.local
const supabaseUrl = 'https://hvegmmsygtwfafieejdp.supabase.co'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceRoleKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY not found in environment variables')
  console.log('You need to add your service role key to .env.local')
  console.log('Get it from: https://supabase.com/dashboard/project/_/settings/api')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function applySQLFile(filename) {
  try {
    const sqlContent = fs.readFileSync(filename, 'utf8')
    console.log(`Applying SQL from ${filename}...`)
    
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent })
    
    if (error) {
      console.error('SQL execution error:', error)
    } else {
      console.log('SQL applied successfully!')
    }
  } catch (err) {
    console.error('File reading error:', err.message)
  }
}

// Apply the comprehensive registration fix
applySQLFile('./scripts/011_comprehensive_registration_fix.sql')