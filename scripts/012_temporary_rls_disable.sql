-- TEMPORARY FIX: Disable RLS for testing registration
-- Use this only if you can't run the comprehensive fix

-- Disable RLS temporarily
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- After testing, remember to re-enable it:
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;