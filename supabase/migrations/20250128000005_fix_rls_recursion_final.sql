-- Drop all existing RLS policies on users table
DROP POLICY IF EXISTS "users_own_profile_select" ON public.users;
DROP POLICY IF EXISTS "users_own_profile_update" ON public.users;
DROP POLICY IF EXISTS "super_admin_admin_full_access" ON public.users;
DROP POLICY IF EXISTS "hr_managers_view_users" ON public.users;
DROP POLICY IF EXISTS "service_role_insert_users" ON public.users;

-- Create a function to get user role without causing recursion
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM users WHERE auth_user_id = user_id LIMIT 1;
$$;

-- Create non-recursive RLS policies
-- Policy for users to view their own profile
CREATE POLICY "users_own_profile_select" ON public.users
  FOR SELECT
  TO public
  USING (auth.uid() = auth_user_id);

-- Policy for users to update their own profile
CREATE POLICY "users_own_profile_update" ON public.users
  FOR UPDATE
  TO public
  USING (auth.uid() = auth_user_id);

-- Policy for service role to insert users
CREATE POLICY "service_role_insert_users" ON public.users
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy for authenticated users to insert (for registration)
CREATE POLICY "authenticated_insert_users" ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_user_id);

-- Policy for super_admin and admin to have full access
CREATE POLICY "super_admin_admin_full_access" ON public.users
  FOR ALL
  TO public
  USING (
    CASE 
      WHEN auth.uid() IS NULL THEN false
      ELSE get_user_role(auth.uid()) IN ('super_admin', 'admin')
    END
  );

-- Policy for HR and managers to view users
CREATE POLICY "hr_managers_view_users" ON public.users
  FOR SELECT
  TO public
  USING (
    CASE 
      WHEN auth.uid() IS NULL THEN false
      ELSE get_user_role(auth.uid()) IN ('gestor_rh', 'gerente')
    END
  );