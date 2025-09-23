-- Comprehensive fix for user registration database errors
-- Run this script in your Supabase SQL editor

-- 1. Fix RLS policies for profile insertion
DROP POLICY IF EXISTS "profiles_insert_hr_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_trigger_bypass" ON public.profiles;

-- Allow profile creation during registration and by HR admins
CREATE POLICY "profiles_insert_registration"
  ON public.profiles FOR INSERT
  WITH CHECK (
    -- Allow HR admins and super admins to insert manually
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('hr_admin', 'super_admin')
    )
    OR
    -- Allow insert during registration when no profile exists yet
    NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid()
    )
  );

-- 2. Ensure the trigger function has proper permissions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Use INSERT with proper error handling
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
      COALESCE(NEW.raw_user_meta_data ->> 'department', 'Engineering'),
      COALESCE(NEW.raw_user_meta_data ->> 'position', 'Employee'),
      COALESCE(NEW.raw_user_meta_data ->> 'role', 'employee'),
      CURRENT_DATE
    );
  EXCEPTION
    WHEN unique_violation THEN
      -- Profile already exists, do nothing
      NULL;
    WHEN OTHERS THEN
      -- Log the error but don't fail the user creation
      RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- 3. Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO service_role;

-- 5. Check if there's a service role policy needed
CREATE POLICY "profiles_service_role_access"
  ON public.profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);