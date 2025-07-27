-- Fix users RLS policies to restrict DELETE operations
-- Drop the existing permissive policy
DROP POLICY IF EXISTS "Allow all operations on users" ON public.users;

-- Create specific policies for each operation
-- SELECT: All authenticated users can view users
CREATE POLICY "users_select" ON public.users
  FOR SELECT TO authenticated
  USING (true);

-- INSERT: All authenticated users can create users
CREATE POLICY "users_insert" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- UPDATE: Only superusers and admins can update users
CREATE POLICY "users_update" ON public.users
  FOR UPDATE TO authenticated
  USING (is_super_user() OR is_admin())
  WITH CHECK (is_super_user() OR is_admin());

-- DELETE: Only superusers and admins can delete users
CREATE POLICY "users_delete" ON public.users
  FOR DELETE TO authenticated
  USING (is_super_user() OR is_admin());

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;