# Supabase Setup Guide

## Problem
You're getting a NetworkError because the environment variables still contain placeholder values instead of your actual Supabase credentials.

## Solution

### Step 1: Get Your Supabase Credentials

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project** (or create a new one if you don't have one)
3. **Navigate to Settings → API**: https://supabase.com/dashboard/project/_/settings/api
4. **Copy the following values**:
   - **Project URL** (looks like: `https://abcdefghijk.supabase.co`)
   - **anon public key** (starts with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### Step 2: Update Your Environment Variables

1. **Open the `.env.local` file** in your project root
2. **Replace the placeholder values** with your actual credentials:

```bash
# Before (current - causes NetworkError)
NEXT_PUBLIC_SUPABASE_URL=https://supabase.com/dashboard/project/hvegmmsygtwfafieejdp
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2ZWdtbXN5Z3R3ZmFmaWVlamRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MzE2OTYsImV4cCI6MjA3NDEwNzY5Nn0.Qri2VK2Fj68k0vyIDY7UBxJWzzqu2IhhPtxQzg5-LHc

# After (with your actual values)
NEXT_PUBLIC_SUPABASE_URL=https://supabase.com/dashboard/project/hvegmmsygtwfafieejdp
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2ZWdtbXN5Z3R3ZmFmaWVlamRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MzE2OTYsImV4cCI6MjA3NDEwNzY5Nn0.Qri2VK2Fj68k0vyIDY7UBxJWzzqu2IhhPtxQzg5-LHc
```

### Step 3: Restart Your Development Server

After updating the environment variables:

```bash
# Stop your current server (Ctrl+C if running)
# Then restart:
npm run dev
# or
pnpm dev
# or
yarn dev
```

### Step 4: Verify the Fix

The enhanced error handling will now show you exactly what's wrong if the credentials are still invalid. You should see clearer error messages in the console if there are any remaining issues.

## Common Issues

- **Still seeing NetworkError?** - Make sure you saved the `.env.local` file and restarted the server
- **Invalid URL format?** - Ensure your URL starts with `https://` and ends with `.supabase.co`
- **Invalid key format?** - The anon key should be a long JWT token starting with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`

## Don't Have a Supabase Project?

If you don't have a Supabase project yet:
1. Go to https://supabase.com
2. Sign up for a free account
3. Create a new project
4. Follow the steps above to get your credentials