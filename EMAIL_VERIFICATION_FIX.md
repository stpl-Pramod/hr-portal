# Email Verification Issue Resolution Guide

## Problem Analysis
The issue "Verification email sent! Please check your inbox. but email not send" is caused by two main problems:

### 1. Database Error (Primary Issue)
- Error: "Database error saving new user"
- Cause: RLS (Row Level Security) policies are too restrictive
- The trigger that creates user profiles after signup is failing

### 2. Environment Configuration (Secondary Issue)
- Missing NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL environment variable
- ✅ **FIXED**: Added to .env.local

## Solutions Required

### Immediate Database Fix (Critical)
**You need to run this SQL in your Supabase Dashboard > SQL Editor:**

```sql
-- 1. Temporarily disable RLS on profiles table to allow registration
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. After registration works, re-enable with proper policies
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create a proper insert policy for new users
-- DROP POLICY IF EXISTS "profiles_insert_registration" ON public.profiles;
-- CREATE POLICY "profiles_insert_registration"
--   ON public.profiles FOR INSERT
--   WITH CHECK (auth.uid() = id);
```

### Alternative: Fix RLS Policies Properly
```sql
-- Drop existing problematic policies
DROP POLICY IF EXISTS "profiles_insert_hr_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;

-- Create new policy that allows profile creation during registration
CREATE POLICY "profiles_insert_registration"
ON public.profiles FOR INSERT
WITH CHECK (
  -- Allow insert if this is a new user (no existing profile)
  NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
  OR
  -- Allow HR admins to create profiles
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('hr_admin', 'super_admin')
  )
);

-- Ensure the trigger function works properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    employee_id, 
    first_name, 
    last_name, 
    email, 
    department, 
    position, 
    role, 
    hire_date
  )
  VALUES (
    NEW.id,
    'EMP' || LPAD(FLOOR(EXTRACT(EPOCH FROM NOW()))::TEXT, 8, '0'),
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', 'New'),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', 'Employee'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'department', 'General'),
    COALESCE(NEW.raw_user_meta_data ->> 'position', 'Employee'),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'employee'),
    NOW()
  );
  RETURN NEW;
END;
$$;
```

### Supabase Email Configuration Check
After fixing the database, check these settings in your Supabase Dashboard:

1. **Authentication > Settings > SMTP Settings**
   - Ensure email delivery is enabled
   - Configure SMTP if using custom email service

2. **Authentication > URL Configuration**
   - Add to "Redirect URLs": `http://localhost:3000/auth/callback`
   - Add to "Site URL": `http://localhost:3000`

3. **Authentication > Email Templates**
   - Verify email confirmation template is enabled
   - Check if template is properly configured

## Testing Steps
1. Apply the database fix in Supabase SQL Editor
2. Restart your development server
3. Try registering a new user
4. Check if email is actually sent (check spam folder too)

## Environment Variables Added
✅ Added to .env.local:
```
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
```

## Quick Test Command
After applying database fixes, test with:
```bash
node test-email-config.js
```

The registration should work and emails should be sent if Supabase email settings are properly configured.