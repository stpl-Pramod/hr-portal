# Environment Variables for Vercel Deployment

## Required Environment Variables

Add these in your Vercel dashboard under Settings → Environment Variables:

### 1. Supabase URL
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://hvegmmsygtwfafieejdp.supabase.co
```

### 2. Supabase API Key
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2ZWdtbXN5Z3R3ZmFmaWVlamRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MzE2OTYsImV4cCI6MjA3NDEwNzY5Nn0.Qri2VK2Fj68k0vyIDY7UBxJWzzqu2IhhPtxQzg5-LHc
```

### 3. Redirect URL (Update with your actual Vercel URL)
```
Name: NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL
Value: https://YOUR-VERCEL-URL.vercel.app/auth/callback
```

## Steps to Fix:

1. **Go to**: https://vercel.com/dashboard
2. **Select your project**: hr-portal
3. **Click**: Settings → Environment Variables
4. **Add** all three variables above
5. **Redeploy** the application

## After Adding Variables:

1. **Redeploy** in Vercel
2. **Update Supabase** redirect URLs to include your production domain
3. **Test** the deployed application

Your local .env.local file is correct - this error only happens in production because Vercel needs these variables configured in their dashboard.