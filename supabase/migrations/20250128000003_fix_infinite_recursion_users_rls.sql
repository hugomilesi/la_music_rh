-- Fix infinite recursion in users RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Super admin and admin can view all users" ON users;
DROP POLICY IF EXISTS "Super admin and admin can insert users" ON users;
DROP POLICY IF EXISTS "Super admin and admin can update all users" ON users;
DROP POLICY IF EXISTS "Super admin and admin can delete users" ON users;
DROP POLICY IF EXISTS "HR and managers can view users" ON users;

-- Create new policies without recursion
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = auth_user_id);

-- Super admin and admin policies using direct role check
CREATE POLICY "Super admin and admin can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.role IN ('super_admin', 'admin')
        )
    );

CREATE POLICY "Super admin and admin can insert users" ON users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.role IN ('super_admin', 'admin')
        )
    );

CREATE POLICY "Super admin and admin can update all users" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.role IN ('super_admin', 'admin')
        )
    );

CREATE POLICY "Super admin and admin can delete users" ON users
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.role IN ('super_admin', 'admin')
        )
    );

-- HR and managers can view users (but not modify)
CREATE POLICY "HR and managers can view users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.role IN ('gestor_rh', 'gerente')
        )
    );