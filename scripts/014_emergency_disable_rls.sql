-- EMERGENCY FIX: Temporarily disable RLS to allow user registration
-- Use this ONLY for immediate testing, then re-enable RLS

-- Disable RLS temporarily
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- After testing and confirming registration works, re-enable RLS:
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;