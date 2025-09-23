-- Migração: Criar dados iniciais e finalizar sistema de permissões
-- Data: 2025-01-27
-- Descrição: Dados iniciais, usuário super admin e configurações finais

-- 1. Inserir departamentos iniciais
INSERT INTO departments (name, description) VALUES
('Recursos Humanos', 'Departamento de gestão de pessoas e processos de RH'),
('Administração', 'Departamento administrativo e financeiro'),
('Operações', 'Departamento de operações e produção'),
('Tecnologia', 'Departamento de tecnologia da informação'),
('Comercial', 'Departamento comercial e vendas');

-- 2. Função para criar usuário super admin inicial
CREATE OR REPLACE FUNCTION create_super_admin(
    p_auth_user_id UUID,
    p_username TEXT,
    p_email TEXT,
    p_department_name TEXT DEFAULT 'Administração'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id UUID;
    dept_id UUID;
BEGIN
    -- Buscar departamento
    SELECT id INTO dept_id FROM departments WHERE name = p_department_name;
    
    -- Se não encontrar departamento, usar o primeiro disponível
    IF dept_id IS NULL THEN
        SELECT id INTO dept_id FROM departments LIMIT 1;
    END IF;
    
    -- Inserir usuário super admin
    INSERT INTO users (
        auth_user_id, username, email, role, department_id, is_active
    ) VALUES (
        p_auth_user_id, p_username, p_email, 'super_admin', dept_id, true
    ) RETURNING id INTO user_id;
    
    -- Registrar log de criação
    PERFORM log_system_event(
        'INFO',
        'Super admin criado',
        jsonb_build_object(
            'user_id', user_id,
            'username', p_username,
            'email', p_email
        ),
        'system_setup'
    );
    
    RETURN user_id;
END;
$$;

-- 3. Função para configurar permissões padrão avançadas
CREATE OR REPLACE FUNCTION setup_advanced_permissions()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Limpar permissões existentes para reconfigurar
    DELETE FROM role_permissions;
    
    -- Permissões para gestor_rh (mais amplas)
    INSERT INTO role_permissions (role_name, module_name, can_view, can_create, can_edit, can_delete) VALUES
    ('gestor_rh', 'dashboard', true, false, false, false),
    ('gestor_rh', 'employees', true, true, true, true),
    ('gestor_rh', 'payroll', true, true, true, true),
    ('gestor_rh', 'benefits', true, true, true, false),
    ('gestor_rh', 'vacation', true, true, true, false),
    ('gestor_rh', 'evaluation', true, true, true, false),
    ('gestor_rh', 'reports', true, true, false, false),
    ('gestor_rh', 'settings', true, false, false, false),
    ('gestor_rh', 'users', true, true, true, false),
    ('gestor_rh', 'support', true, true, true, false),
    ('gestor_rh', 'nps', true, true, true, false);
    
    -- Permissões para gerente (mais limitadas)
    INSERT INTO role_permissions (role_name, module_name, can_view, can_create, can_edit, can_delete) VALUES
    ('gerente', 'dashboard', true, false, false, false),
    ('gerente', 'employees', true, false, true, false),
    ('gerente', 'payroll', true, false, false, false),
    ('gerente', 'benefits', true, false, false, false),
    ('gerente', 'vacation', true, true, true, false),
    ('gerente', 'evaluation', true, true, true, false),
    ('gerente', 'reports', true, false, false, false),
    ('gerente', 'settings', false, false, false, false),
    ('gerente', 'users', true, false, false, false),
    ('gerente', 'support', true, true, false, false),
    ('gerente', 'nps', true, false, false, false);
    
    -- Registrar configuração
    PERFORM log_system_event(
        'INFO',
        'Permissões padrão configuradas',
        jsonb_build_object(
            'gestor_rh_permissions', 11,
            'gerente_permissions', 11
        ),
        'system_setup'
    );
END;
$$;

-- 4. Função para validar integridade do sistema de permissões
CREATE OR REPLACE FUNCTION validate_permissions_integrity()
RETURNS TABLE(
    check_name TEXT,
    status TEXT,
    details TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar se todos os módulos têm permissões definidas
    RETURN QUERY
    SELECT 
        'modules_coverage'::TEXT,
        CASE 
            WHEN missing_count = 0 THEN 'OK'
            ELSE 'WARNING'
        END,
        CASE 
            WHEN missing_count = 0 THEN 'Todos os módulos têm permissões definidas'
            ELSE 'Módulos sem permissões: ' || missing_count::TEXT
        END
    FROM (
        SELECT COUNT(*) as missing_count
        FROM (
            SELECT unnest(ARRAY['dashboard', 'employees', 'payroll', 'benefits', 'vacation', 'evaluation', 'reports', 'settings', 'users', 'support', 'nps']) as module
        ) modules
        WHERE module NOT IN (
            SELECT DISTINCT module_name FROM role_permissions
        )
    ) t;
    
    -- Verificar se há usuários sem departamento
    RETURN QUERY
    SELECT 
        'users_departments'::TEXT,
        CASE 
            WHEN orphan_count = 0 THEN 'OK'
            ELSE 'WARNING'
        END,
        CASE 
            WHEN orphan_count = 0 THEN 'Todos os usuários têm departamento'
            ELSE 'Usuários sem departamento: ' || orphan_count::TEXT
        END
    FROM (
        SELECT COUNT(*) as orphan_count
        FROM users 
        WHERE department_id IS NULL AND role NOT IN ('super_admin')
    ) t;
    
    -- Verificar se há pelo menos um super admin
    RETURN QUERY
    SELECT 
        'super_admin_exists'::TEXT,
        CASE 
            WHEN admin_count > 0 THEN 'OK'
            ELSE 'ERROR'
        END,
        CASE 
            WHEN admin_count > 0 THEN 'Super admin configurado: ' || admin_count::TEXT
            ELSE 'ERRO: Nenhum super admin encontrado'
        END
    FROM (
        SELECT COUNT(*) as admin_count
        FROM users 
        WHERE role = 'super_admin' AND is_active = true
    ) t;
    
    -- Verificar políticas RLS
    RETURN QUERY
    SELECT 
        'rls_policies'::TEXT,
        'INFO'::TEXT,
        'Políticas RLS ativas: ' || COUNT(*)::TEXT
    FROM pg_policies 
    WHERE schemaname = 'public';
END;
$$;

-- 5. Função para obter resumo do sistema
CREATE OR REPLACE FUNCTION get_system_summary()
RETURNS TABLE(
    total_users BIGINT,
    users_by_role JSONB,
    total_departments BIGINT,
    total_permissions BIGINT,
    system_health JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar se usuário é admin
    IF NOT is_admin_user(auth.uid()) THEN
        RAISE EXCEPTION 'Acesso negado: apenas administradores podem ver resumo do sistema';
    END IF;
    
    RETURN QUERY
    SELECT 
        -- Total de usuários
        (SELECT COUNT(*) FROM users WHERE is_active = true),
        
        -- Usuários por role
        (SELECT jsonb_object_agg(role, count) 
         FROM (
             SELECT role, COUNT(*) as count 
             FROM users 
             WHERE is_active = true
             GROUP BY role
         ) t),
        
        -- Total de departamentos
        (SELECT COUNT(*) FROM departments),
        
        -- Total de permissões
        (SELECT COUNT(*) FROM role_permissions),
        
        -- Saúde do sistema
        (SELECT jsonb_object_agg(check_name, jsonb_build_object('status', status, 'details', details))
         FROM validate_permissions_integrity());
END;
$$;

-- 6. Executar configuração inicial
SELECT setup_advanced_permissions();

-- 7. Inserir alguns benefícios padrão
INSERT INTO benefits (name, description, benefit_type_id, cost, employer_contribution, employee_contribution, is_active) 
SELECT 
    'Plano de Saúde Básico',
    'Plano de saúde com cobertura nacional',
    bt.id,
    300.00,
    200.00,
    100.00,
    true
FROM benefit_types bt WHERE bt.name = 'Saúde';

INSERT INTO benefits (name, description, benefit_type_id, cost, employer_contribution, employee_contribution, is_active) 
SELECT 
    'Vale Alimentação',
    'Auxílio alimentação mensal',
    bt.id,
    400.00,
    400.00,
    0.00,
    true
FROM benefit_types bt WHERE bt.name = 'Alimentação';

INSERT INTO benefits (name, description, benefit_type_id, cost, employer_contribution, employee_contribution, is_active) 
SELECT 
    'Plano Odontológico',
    'Cobertura odontológica completa',
    bt.id,
    80.00,
    60.00,
    20.00,
    true
FROM benefit_types bt WHERE bt.name = 'Odontológico';

-- 8. Inserir alertas de sistema padrão
INSERT INTO system_alerts (alert_type, threshold_value, notification_channels, is_active) VALUES
('failed_login_attempts', 5, '{"email": true, "system": true}', true),
('payroll_processing_errors', 1, '{"email": true, "system": true}', true),
('system_performance', 90, '{"system": true}', true),
('backup_failures', 1, '{"email": true, "system": true}', true);

-- 9. Função para resetar senha (apenas para admins)
CREATE OR REPLACE FUNCTION reset_user_password(
    target_user_id UUID,
    new_password_hash TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_role TEXT;
    target_user_email TEXT;
BEGIN
    -- Verificar se usuário atual é admin
    SELECT role INTO current_user_role 
    FROM users 
    WHERE auth_user_id = auth.uid();
    
    IF current_user_role NOT IN ('super_admin', 'admin') THEN
        RAISE EXCEPTION 'Acesso negado: apenas administradores podem resetar senhas';
    END IF;
    
    -- Buscar email do usuário alvo
    SELECT email INTO target_user_email 
    FROM users 
    WHERE id = target_user_id;
    
    IF target_user_email IS NULL THEN
        RAISE EXCEPTION 'Usuário não encontrado';
    END IF;
    
    -- Registrar ação de reset
    PERFORM log_audit_action(
        (SELECT id FROM users WHERE auth_user_id = auth.uid()),
        'PASSWORD_RESET',
        'users',
        target_user_id,
        NULL,
        jsonb_build_object('target_email', target_user_email)
    );
    
    -- Registrar log de sistema
    PERFORM log_system_event(
        'INFO',
        'Senha resetada por administrador',
        jsonb_build_object(
            'target_user_id', target_user_id,
            'target_email', target_user_email,
            'reset_by', current_user_role
        ),
        'password_reset'
    );
    
    RETURN TRUE;
END;
$$;

-- 10. Registrar inicialização do sistema
SELECT log_system_event(
    'INFO',
    'Sistema de gestão de RH inicializado com sucesso',
    jsonb_build_object(
        'version', '1.0.0',
        'modules', ARRAY['dashboard', 'employees', 'payroll', 'benefits', 'vacation', 'evaluation', 'reports', 'settings', 'users', 'support', 'nps'],
        'roles', ARRAY['super_admin', 'admin', 'gestor_rh', 'gerente'],
        'features', ARRAY['dynamic_permissions', 'audit_logs', 'rls_security', 'multi_unit_payroll']
    ),
    'system_initialization'
);

-- Comentários
COMMENT ON FUNCTION create_super_admin(uuid, text, text, text) IS 'Cria usuário super admin inicial do sistema';
COMMENT ON FUNCTION setup_advanced_permissions() IS 'Configura permissões padrão avançadas para roles';
COMMENT ON FUNCTION validate_permissions_integrity() IS 'Valida integridade do sistema de permissões';
COMMENT ON FUNCTION get_system_summary() IS 'Retorna resumo completo do sistema para administradores';
COMMENT ON FUNCTION reset_user_password(uuid, text) IS 'Permite que administradores resetem senhas de usuários';