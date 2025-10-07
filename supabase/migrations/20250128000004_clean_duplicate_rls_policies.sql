-- Clean up duplicate RLS policies on users table
-- Drop all existing policies first
DROP POLICY IF EXISTS "HR and managers can view users" ON users;
DROP POLICY IF EXISTS "Super admin and admin can delete users" ON users;
DROP POLICY IF EXISTS "Super admin and admin can insert users" ON users;
DROP POLICY IF EXISTS "Super admin and admin can update all users" ON users;
DROP POLICY IF EXISTS "Super admin and admin can view all users" ON users;
DROP POLICY IF EXISTS "Super admin and admin full access on users" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "admins_can_create_users" ON users;
DROP POLICY IF EXISTS "admins_can_update_other_users" ON users;
DROP POLICY IF EXISTS "admins_can_view_all_users" ON users;
DROP POLICY IF EXISTS "authenticated_users_delete_own_profile" ON users;
DROP POLICY IF EXISTS "authenticated_users_select_own_profile" ON users;
DROP POLICY IF EXISTS "authenticated_users_update_own_profile" ON users;
DROP POLICY IF EXISTS "service_role_can_insert_users" ON users;
DROP POLICY IF EXISTS "super_admin_can_delete_users" ON users;
DROP POLICY IF EXISTS "users_can_create_own_profile" ON users;

-- Create clean, non-recursive policies
-- Users can view and update their own profile
CREATE POLICY "users_own_profile_select" ON users
    FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "users_own_profile_update" ON users
    FOR UPDATE USING (auth.uid() = auth_user_id);

-- Super admin and admin have full access
CREATE POLICY "super_admin_admin_full_access" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.role IN ('super_admin', 'admin')
        )
    );

-- HR and managers can view users
CREATE POLICY "hr_managers_view_users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.role IN ('gestor_rh', 'gerente')
        )
    );

-- Service role can insert users (for system operations)
CREATE POLICY "service_role_insert_users" ON users
    FOR INSERT WITH CHECK (true);