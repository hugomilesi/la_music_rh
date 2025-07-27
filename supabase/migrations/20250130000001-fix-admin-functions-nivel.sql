-- Fix admin functions to properly handle nivel column
-- This migration corrects the is_super_user and is_admin functions

-- Drop existing functions
DROP FUNCTION IF EXISTS is_super_user();
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS is_current_user_admin();
DROP FUNCTION IF EXISTS can_modify_user(uuid);

-- Create improved is_super_user function
CREATE OR REPLACE FUNCTION is_super_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth_user_id = auth.uid() 
    AND status = 'ativo'
    AND (
      role = 'super_admin' 
      OR (nivel IS NOT NULL AND nivel = 'super_admin')
      OR (preferences->>'super_user')::boolean = true
    )
  );
END;
$$;

-- Create improved is_admin function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth_user_id = auth.uid() 
    AND status = 'ativo'
    AND (
      role IN ('admin', 'super_admin') 
      OR (nivel IS NOT NULL AND nivel IN ('admin', 'super_admin'))
      OR (preferences->>'super_user')::boolean = true
    )
  );
END;
$$;

-- Recreate is_current_user_admin function
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth_user_id = auth.uid() 
    AND status = 'ativo'
    AND (
      role IN ('admin', 'super_admin')
      OR (nivel IS NOT NULL AND nivel IN ('admin', 'super_admin'))
      OR (preferences->>'super_user')::boolean = true
    )
  );
END;
$$;

-- Recreate can_modify_user function
CREATE OR REPLACE FUNCTION can_modify_user(target_user_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Allow users to modify their own profile
  IF auth.uid() = target_user_id THEN
    RETURN true;
  END IF;
  
  -- Allow admins to modify any user
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth_user_id = auth.uid() 
    AND status = 'ativo'
    AND (
      role IN ('admin', 'super_admin')
      OR (nivel IS NOT NULL AND nivel IN ('admin', 'super_admin'))
      OR (preferences->>'super_user')::boolean = true
    )
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_super_user() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_current_user_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION can_modify_user(uuid) TO authenticated;

-- Test the functions
DO $$
DECLARE
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count
  FROM public.users 
  WHERE status = 'ativo'
  AND (
    role IN ('admin', 'super_admin')
    OR (nivel IS NOT NULL AND nivel IN ('admin', 'super_admin'))
    OR (preferences->>'super_user')::boolean = true
  );
  
  RAISE NOTICE 'Admin functions updated successfully - found % admin users', admin_count;
END;
$$;