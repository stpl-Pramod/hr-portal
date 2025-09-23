-- IMMEDIATE FIX for "Database error saving new user"
-- This script resolves the RLS policy blocking user registration

-- 1. Drop the problematic insert policy that blocks new users
DROP POLICY IF EXISTS "profiles_insert_hr_admin" ON public.profiles;

-- 2. Create a new policy that allows user registration
CREATE POLICY "profiles_insert_allow_registration" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  -- Allow new users to create their own profile during registration
  auth.uid() = id 
  OR 
  -- Allow HR admins to create profiles
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('hr_admin', 'super_admin')
  )
);

-- 3. Ensure the trigger function can bypass RLS for service operations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER  -- This allows the function to bypass RLS
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
    COALESCE(NEW.raw_user_meta_data ->> 'department', 'Engineering'),
    COALESCE(NEW.raw_user_meta_data ->> 'position', 'Employee'),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'employee'),
    CURRENT_DATE
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 4. Grant proper permissions to service role
GRANT ALL ON public.profiles TO service_role;

-- 5. Add a service role policy to ensure trigger can write
CREATE POLICY "profiles_service_role_full_access"
ON public.profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Alternative: If the above doesn't work, temporarily disable RLS for testing
-- Uncomment the next line ONLY for testing:
-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;