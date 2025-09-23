-- Corrigir recursão infinita nas políticas RLS da tabela users
-- Data: 2025-01-27
-- Problema: Políticas RLS causando recursão infinita

-- 1. Remover TODAS as políticas RLS existentes da tabela users
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "users_delete_policy" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable update for users based on email" ON users;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON users;

-- 2. Desabilitar RLS temporariamente para limpeza
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 3. Reabilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas RLS simples e diretas SEM recursão

-- Política de SELECT: Usuário pode ver seu próprio perfil
CREATE POLICY "users_select_own_profile" ON users
    FOR SELECT
    USING (auth_user_id = auth.uid());

-- Política de INSERT: Apenas usuários autenticados podem criar perfis
CREATE POLICY "users_insert_authenticated" ON users
    FOR INSERT
    WITH CHECK (auth_user_id = auth.uid());

-- Política de UPDATE: Usuário pode atualizar seu próprio perfil
CREATE POLICY "users_update_own_profile" ON users
    FOR UPDATE
    USING (auth_user_id = auth.uid())
    WITH CHECK (auth_user_id = auth.uid());

-- Política de DELETE: Usuário pode deletar seu próprio perfil
CREATE POLICY "users_delete_own_profile" ON users
    FOR DELETE
    USING (auth_user_id = auth.uid());

-- 5. Verificar se o usuário super admin existe e está correto
DO $$
DECLARE
    super_admin_exists BOOLEAN;
    auth_user_exists BOOLEAN;
BEGIN
    -- Verificar se existe usuário super admin na tabela users
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
    
    RAISE NOTICE 'Super admin exists in users table: %', super_admin_exists;
    RAISE NOTICE 'Auth user exists: %', auth_user_exists;
    
    -- Se não existir na tabela users mas existir em auth.users, criar o registro
    IF NOT super_admin_exists AND auth_user_exists THEN
        INSERT INTO users (auth_user_id, username, email, role, is_active)
        SELECT 
            au.id,
            'Super Admin',
            au.email,
            'super_admin',
            true
        FROM auth.users au
        WHERE au.email = 'hugogmilesi@gmail.com'
        ON CONFLICT (auth_user_id) DO UPDATE SET
            role = 'super_admin',
            is_active = true,
            updated_at = NOW();
        
        RAISE NOTICE 'Super admin profile created/updated in users table';
    END IF;
END $$;

-- 6. Log da correção
INSERT INTO audit_logs (user_id, action, table_name, old_values, new_values)
VALUES (
    NULL,
    'FIX_RLS_INFINITE_RECURSION',
    'users',
    '{"issue": "infinite recursion in RLS policies"}'::jsonb,
    ('{"solution": "removed all policies and created simple direct policies", "timestamp": "' || NOW() || '"}')::jsonb
);