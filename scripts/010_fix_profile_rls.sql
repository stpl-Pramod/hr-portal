-- Fix RLS policy for profile creation during registration
-- This allows the trigger function to create profiles for new users

-- Drop the existing restrictive policy
drop policy if exists "profiles_insert_hr_admin" on public.profiles;

-- Create a new policy that allows:
-- 1. HR admins to create profiles manually
-- 2. The trigger function to create profiles during registration
create policy "profiles_insert_policy"
  on public.profiles for insert
  with check (
    -- Allow HR admins and super admins to insert
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role in ('hr_admin', 'super_admin')
    )
    OR
    -- Allow insert during user registration (when no profile exists yet)
    not exists (
      select 1 from public.profiles where id = auth.uid()
    )
  );

-- Alternative approach: Create a bypass policy for the trigger function
-- This is more secure as it specifically allows the trigger to work
create policy "profiles_insert_trigger_bypass"
  on public.profiles for insert
  to service_role
  with check (true);