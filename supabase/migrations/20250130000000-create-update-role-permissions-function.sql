-- Create the update_role_permissions RPC function
-- This function allows updating role permissions through the PermissionsDialog

CREATE OR REPLACE FUNCTION update_role_permissions(role_name TEXT, new_permissions TEXT[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user has permission to update role permissions
  IF NOT (check_permission('system', 'admin') OR check_permission('profiles', 'admin')) THEN
    RAISE EXCEPTION 'Insufficient permissions to update role permissions';
  END IF;

  -- Update or insert the role permissions
  INSERT INTO role_permissions (role, permissions)
  VALUES (role_name, new_permissions)
  ON CONFLICT (role)
  DO UPDATE SET 
    permissions = EXCLUDED.permissions,
    updated_at = NOW();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_role_permissions(TEXT, TEXT[]) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION update_role_permissions(TEXT, TEXT[]) IS 'Updates role permissions for a given role. Requires admin permissions.';

-- Test the function by ensuring it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_role_permissions') THEN
    RAISE NOTICE 'Function update_role_permissions created successfully';
  ELSE
    RAISE WARNING 'Function update_role_permissions was not created';
  END IF;
END;
$$;