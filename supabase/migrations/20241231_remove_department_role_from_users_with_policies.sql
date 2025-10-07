-- Remove department_id and role columns from users table
-- First, we need to drop the policy that depends on department_id

-- Drop the policy that depends on department_id
DROP POLICY IF EXISTS departments_select_policy ON departments;

-- Create a new policy that doesn't depend on user department_id
-- Only super_admin and admin can see all departments, or managers can see their own departments
CREATE POLICY departments_select_policy ON departments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.auth_user_id = auth.uid() 
    AND u.role = ANY(ARRAY['super_admin', 'admin'])
  ) 
  OR 
  manager_id IN (
    SELECT users.id FROM users 
    WHERE users.auth_user_id = auth.uid()
  )
);

-- Now drop the foreign key constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_department_id_fkey;

-- Remove department_id column
ALTER TABLE users DROP COLUMN IF EXISTS department_id;

-- Remove role column (keeping only the profile-based role system)
-- Note: We need to be careful here as role might be used for permissions
-- Let's first check what roles exist and preserve the permission system

-- Remove department column (text field)
ALTER TABLE users DROP COLUMN IF EXISTS department;

-- Remove position_id column if it exists
ALTER TABLE users DROP COLUMN IF EXISTS position_id;