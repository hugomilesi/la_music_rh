-- Fix employees RLS policies to restrict DELETE operations
-- Drop the existing permissive policy
DROP POLICY IF EXISTS "Allow all operations on employees" ON public.employees;

-- Create specific policies for each operation
-- SELECT: All authenticated users can view employees
CREATE POLICY "employees_select" ON public.employees
  FOR SELECT TO authenticated
  USING (true);

-- INSERT: All authenticated users can create employees
CREATE POLICY "employees_insert" ON public.employees
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- UPDATE: Only superusers and admins can update employees
CREATE POLICY "employees_update" ON public.employees
  FOR UPDATE TO authenticated
  USING (is_super_user() OR is_admin())
  WITH CHECK (is_super_user() OR is_admin());

-- DELETE: Only superusers and admins can delete employees
CREATE POLICY "employees_delete" ON public.employees
  FOR DELETE TO authenticated
  USING (is_super_user() OR is_admin());

-- Ensure RLS is enabled
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;