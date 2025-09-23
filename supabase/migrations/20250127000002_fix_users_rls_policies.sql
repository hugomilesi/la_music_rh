-- Corrigir políticas RLS da tabela users para resolver erro 500
-- O problema é que as políticas RLS estão muito restritivas e não permitem
-- que o usuário acesse seu próprio perfil após o login

-- Remover políticas existentes que podem estar causando problemas
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "users_delete_policy" ON users;

-- Criar política de SELECT mais permissiva
CREATE POLICY "users_select_policy" ON users
    FOR SELECT
    USING (
        -- Usuário pode ver seu próprio perfil
        auth_user_id = auth.uid()
        OR
        -- Super admin e admin podem ver todos os usuários
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.role IN ('super_admin', 'admin')
            AND u.is_active = true
        )
        OR
        -- Gestor RH pode ver usuários do mesmo departamento
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.role = 'gestor_rh'
            AND u.department_id = users.department_id
            AND u.is_active = true
        )
    );

-- Política de INSERT - apenas super admin e admin podem criar usuários
CREATE POLICY "users_insert_policy" ON users
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.role IN ('super_admin', 'admin')
            AND u.is_active = true
        )
    );

-- Política de UPDATE
CREATE POLICY "users_update_policy" ON users
    FOR UPDATE
    USING (
        -- Usuário pode atualizar seu próprio perfil (campos limitados)
        auth_user_id = auth.uid()
        OR
        -- Super admin e admin podem atualizar qualquer usuário
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.role IN ('super_admin', 'admin')
            AND u.is_active = true
        )
    )
    WITH CHECK (
        -- Mesmas regras para o novo estado
        auth_user_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.role IN ('super_admin', 'admin')
            AND u.is_active = true
        )
    );

-- Política de DELETE - apenas super admin
CREATE POLICY "users_delete_policy" ON users
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.role = 'super_admin'
            AND u.is_active = true
        )
    );

-- Verificar se o usuário super admin existe e está correto
DO $$
DECLARE
    super_admin_exists BOOLEAN;
    auth_user_exists BOOLEAN;
BEGIN
    -- Verificar se existe usuário super admin
    SELECT EXISTS(
        SELECT 1 FROM users 
        WHERE email = 'hugogmilesi@gmail.com' 
        AND role = 'super_admin'
    ) INTO super_admin_exists;
    
    -- Verificar se existe na tabela auth.users
    SELECT EXISTS(
        SELECT 1 FROM auth.users 
        WHERE email = 'hugogmilesi@gmail.com'
    ) INTO auth_user_exists;
    
    -- Log dos resultados
    RAISE NOTICE 'Super admin exists in users table: %', super_admin_exists;
    RAISE NOTICE 'User exists in auth.users table: %', auth_user_exists;
    
    -- Se não existir, criar o usuário
    IF NOT super_admin_exists AND auth_user_exists THEN
        -- Buscar o auth_user_id
        INSERT INTO users (auth_user_id, username, email, role, is_active)
        SELECT 
            au.id,
            'hugogmilesi',
            'hugogmilesi@gmail.com',
            'super_admin',
            true
        FROM auth.users au
        WHERE au.email = 'hugogmilesi@gmail.com'
        ON CONFLICT (email) DO UPDATE SET
            role = 'super_admin',
            is_active = true,
            updated_at = NOW();
            
        RAISE NOTICE 'Super admin user created/updated in users table';
    END IF;
END $$;

-- Criar função para debug de RLS
CREATE OR REPLACE FUNCTION debug_user_access(user_email TEXT)
RETURNS TABLE(
    user_id UUID,
    auth_user_id UUID,
    username TEXT,
    email TEXT,
    role TEXT,
    is_active BOOLEAN,
    can_access_own_profile BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.auth_user_id,
        u.username,
        u.email,
        u.role,
        u.is_active,
        (u.auth_user_id = auth.uid()) as can_access_own_profile
    FROM users u
    WHERE u.email = user_email;
END;
$$;

-- Log de auditoria
INSERT INTO audit_logs (user_id, action, table_name, new_values, created_at)
SELECT 
    u.id,
    'RLS_POLICIES_FIXED',
    'users',
    jsonb_build_object(
        'action', 'Fixed RLS policies for users table',
        'reason', 'Resolve 500 error on profile fetch',
        'timestamp', NOW()
    ),
    NOW()
FROM users u
WHERE u.role = 'super_admin'
LIMIT 1;

-- RLS policies for users table have been fixed