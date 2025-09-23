-- Corrigir problema de autenticação do super admin
-- Email: hugogmilesi@gmail.com
-- Senha: anamae22

-- 1. Remover usuário existente se houver problemas
DO $$
DECLARE
    auth_user_uuid UUID;
    user_exists BOOLEAN := FALSE;
BEGIN
    -- Verificar se o usuário existe
    SELECT EXISTS(
        SELECT 1 FROM auth.users WHERE email = 'hugogmilesi@gmail.com'
    ) INTO user_exists;
    
    IF user_exists THEN
        -- Obter o ID do usuário auth
        SELECT id INTO auth_user_uuid 
        FROM auth.users 
        WHERE email = 'hugogmilesi@gmail.com';
        
        -- Remover da tabela users primeiro (devido à foreign key)
        DELETE FROM users WHERE auth_user_id = auth_user_uuid;
        
        -- Remover da tabela auth.users
        DELETE FROM auth.users WHERE id = auth_user_uuid;
        
        RAISE NOTICE 'Existing user removed: hugogmilesi@gmail.com';
    END IF;
END $$;

-- 2. Criar usuário corretamente
DO $$
DECLARE
    auth_user_uuid UUID := gen_random_uuid();
    hashed_password TEXT;
BEGIN
    -- Gerar hash da senha usando o método correto do Supabase
    SELECT crypt('anamae22', gen_salt('bf', 10)) INTO hashed_password;
    
    -- Criar usuário na tabela auth.users com configurações corretas
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        confirmation_sent_at,
        recovery_sent_at,
        email_change_sent_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        role,
        aud,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change
    ) VALUES (
        auth_user_uuid,
        '00000000-0000-0000-0000-000000000000',
        'hugogmilesi@gmail.com',
        hashed_password,
        NOW(), -- Email já confirmado
        NOW(),
        NOW(),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        false,
        'authenticated',
        'authenticated',
        '',
        '',
        '',
        ''
    );
    
    -- Criar registro na tabela users
    INSERT INTO users (
        id,
        auth_user_id,
        username,
        email,
        role,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        auth_user_uuid,
        'hugogmilesi',
        'hugogmilesi@gmail.com',
        'super_admin',
        true,
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Super admin user created successfully with proper authentication: hugogmilesi@gmail.com';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating user: %', SQLERRM;
        RAISE;
END $$;

-- 3. Verificar se o usuário foi criado corretamente
SELECT 
    'Verification' as status,
    au.id as auth_user_id,
    au.email as auth_email,
    au.email_confirmed_at IS NOT NULL as email_confirmed,
    u.id as user_id,
    u.email as user_email,
    u.role,
    u.is_active
FROM auth.users au
JOIN users u ON au.id = u.auth_user_id
WHERE au.email = 'hugogmilesi@gmail.com';

-- 4. Log da correção
INSERT INTO audit_logs (
    user_email,
    action,
    table_name,
    new_values,
    created_at
) VALUES (
    'system',
    'FIX_SUPER_ADMIN_AUTH',
    'auth.users',
    '{"email": "hugogmilesi@gmail.com", "role": "super_admin", "action": "recreated_with_proper_auth"}',
    NOW()
);

-- 5. Garantir que as políticas RLS permitam acesso ao super admin
DO $$
BEGIN
    -- Verificar se as políticas existem e estão corretas
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'users_select_policy'
    ) THEN
        -- Criar política se não existir
        CREATE POLICY "users_select_policy" ON users
            FOR SELECT
            USING (
                -- Super admin e admin podem ver todos
                EXISTS (
                    SELECT 1 FROM users u 
                    WHERE u.auth_user_id = auth.uid() 
                    AND u.role IN ('super_admin', 'admin')
                )
                OR
                -- Usuário pode ver seu próprio perfil
                auth_user_id = auth.uid()
            );
    END IF;
END $$;