-- Criar usuário super admin
-- Email: hugogmilesi@gmail.com
-- Senha: anamae22
-- Role: super_admin

-- 1. Primeiro, verificar se o usuário já existe
DO $$
DECLARE
    auth_user_uuid UUID;
    existing_user_count INTEGER;
BEGIN
    -- Verificar se já existe um usuário com este email na tabela auth.users
    SELECT COUNT(*) INTO existing_user_count 
    FROM auth.users 
    WHERE email = 'hugogmilesi@gmail.com';
    
    IF existing_user_count = 0 THEN
        -- Criar usuário na tabela auth.users
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            role
        ) VALUES (
            gen_random_uuid(),
            '00000000-0000-0000-0000-000000000000',
            'hugogmilesi@gmail.com',
            crypt('anamae22', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{}',
            false,
            'authenticated'
        ) RETURNING id INTO auth_user_uuid;
        
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
        
        RAISE NOTICE 'Super admin user created successfully: hugogmilesi@gmail.com';
    ELSE
        -- Verificar se existe na tabela users
        SELECT COUNT(*) INTO existing_user_count 
        FROM users 
        WHERE email = 'hugogmilesi@gmail.com';
        
        IF existing_user_count = 0 THEN
            -- Usuário existe no auth mas não na tabela users, criar o registro
            SELECT id INTO auth_user_uuid 
            FROM auth.users 
            WHERE email = 'hugogmilesi@gmail.com';
            
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
            
            RAISE NOTICE 'User profile created for existing auth user: hugogmilesi@gmail.com';
        ELSE
            -- Atualizar role para super_admin se necessário
            UPDATE users 
            SET role = 'super_admin', 
                updated_at = NOW()
            WHERE email = 'hugogmilesi@gmail.com' 
            AND role != 'super_admin';
            
            RAISE NOTICE 'User already exists: hugogmilesi@gmail.com';
        END IF;
    END IF;
END $$;

-- Verificar se o usuário foi criado corretamente
SELECT 
    u.id,
    u.username,
    u.email,
    u.role,
    u.is_active,
    u.created_at
FROM users u
WHERE u.email = 'hugogmilesi@gmail.com';

-- Log da criação do usuário
INSERT INTO audit_logs (
    user_email,
    action,
    table_name,
    new_values,
    created_at
) VALUES (
    'system',
    'CREATE_SUPER_ADMIN',
    'users',
    '{"email": "hugogmilesi@gmail.com", "role": "super_admin", "created_by": "migration"}',
    NOW()
);