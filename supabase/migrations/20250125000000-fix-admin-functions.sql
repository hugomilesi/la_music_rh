-- Fix is_super_user and is_admin functions to include preferences check

-- Drop existing functions
DROP FUNCTION IF EXISTS is_super_user();
DROP FUNCTION IF EXISTS is_admin();

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
    AND (
      role = 'super_admin' 
      OR nivel = 'super_admin'
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
    AND (
      role IN ('admin', 'super_admin') 
      OR nivel IN ('admin', 'super_admin')
      OR (preferences->>'super_user')::boolean = true
    )
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_super_user() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- Test the functions with a known admin user
DO $$
DECLARE
  test_result BOOLEAN;
BEGIN
  -- Test with a known admin user (Luciano)
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth_user_id = '3818876c-dc03-44b0-9018-ee901091bad7'
    AND (
      role IN ('admin', 'super_admin') 
      OR nivel IN ('admin', 'super_admin')
      OR (preferences->>'super_user')::boolean = true
    )
  ) INTO test_result;
  
  IF test_result THEN
    RAISE NOTICE 'Admin functions updated successfully - test user has admin privileges';
  ELSE
    RAISE WARNING 'Admin functions may not be working correctly - test user does not have admin privileges';
  END IF;
END;
$$;