-- Migração: Criar funções para gerenciamento de permissões
-- Data: 2025-01-27
-- Descrição: Funções para verificação de permissões, promoção de usuários e validação

-- 1. Função para obter permissões do usuário
CREATE OR REPLACE FUNCTION get_user_permissions(user_auth_id uuid)
RETURNS TABLE(
  module_name text,
  can_view boolean,
  can_create boolean,
  can_edit boolean,
  can_delete boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role_name TEXT;
BEGIN
    -- Buscar role do usuário usando auth_user_id
    SELECT role INTO user_role_name 
    FROM users 
    WHERE auth_user_id = user_auth_id;
    
    -- Se não encontrar o usuário, retornar vazio
    IF user_role_name IS NULL THEN
        RETURN;
    END IF;
    
    -- Se for super_admin ou admin, retornar todas as permissões para todos os módulos
    IF user_role_name IN ('super_admin', 'admin') THEN
        RETURN QUERY
        SELECT DISTINCT 
            'dashboard'::text as module_name,
            true as can_view,
            true as can_create,
            true as can_edit,
            true as can_delete
        UNION ALL
        SELECT DISTINCT 
            'employees'::text as module_name,
            true as can_view,
            true as can_create,
            true as can_edit,
            true as can_delete
        UNION ALL
        SELECT DISTINCT 
            'payroll'::text as module_name,
            true as can_view,
            true as can_create,
            true as can_edit,
            true as can_delete
        UNION ALL
        SELECT DISTINCT 
            'benefits'::text as module_name,
            true as can_view,
            true as can_create,
            true as can_edit,
            true as can_delete
        UNION ALL
        SELECT DISTINCT 
            'vacation'::text as module_name,
            true as can_view,
            true as can_create,
            true as can_edit,
            true as can_delete
        UNION ALL
        SELECT DISTINCT 
            'evaluation'::text as module_name,
            true as can_view,
            true as can_create,
            true as can_edit,
            true as can_delete
        UNION ALL
        SELECT DISTINCT 
            'reports'::text as module_name,
            true as can_view,
            true as can_create,
            true as can_edit,
            true as can_delete
        UNION ALL
        SELECT DISTINCT 
            'settings'::text as module_name,
            true as can_view,
            true as can_create,
            true as can_edit,
            true as can_delete
        UNION ALL
        SELECT DISTINCT 
            'users'::text as module_name,
            true as can_view,
            true as can_create,
            true as can_edit,
            true as can_delete
        UNION ALL
        SELECT DISTINCT 
            'support'::text as module_name,
            true as can_view,
            true as can_create,
            true as can_edit,
            true as can_delete
        UNION ALL
        SELECT DISTINCT 
            'nps'::text as module_name,
            true as can_view,
            true as can_create,
            true as can_edit,
            true as can_delete;
    ELSE
        -- Para outros roles, buscar permissões da tabela role_permissions
        RETURN QUERY
        SELECT 
            rp.module_name,
            rp.can_view,
            rp.can_create,
            rp.can_edit,
            rp.can_delete
        FROM role_permissions rp
        WHERE rp.role_name = user_role_name
        AND (rp.can_view = true OR rp.can_create = true OR rp.can_edit = true OR rp.can_delete = true);
    END IF;
END;
$$;

-- 2. Função para promover usuários
CREATE OR REPLACE FUNCTION promote_user(
    target_user_id UUID,
    new_role TEXT,
    promoted_by UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    promoter_role TEXT;
    current_role TEXT;
BEGIN
    -- Verificar role do promotor
    SELECT role INTO promoter_role 
    FROM users 
    WHERE auth_user_id = promoted_by;
    
    -- Verificar role atual do usuário alvo
    SELECT role INTO current_role 
    FROM users 
    WHERE id = target_user_id;
    
    -- Validar se o novo role é válido
    IF new_role NOT IN ('super_admin', 'admin', 'gestor_rh', 'gerente') THEN
        RETURN FALSE;
    END IF;
    
    -- Regras de promoção
    IF promoter_role = 'super_admin' THEN
        -- Super admin pode promover para qualquer role
        UPDATE users 
        SET role = new_role, updated_at = NOW() 
        WHERE id = target_user_id;
        RETURN TRUE;
    ELSIF promoter_role = 'admin' AND new_role IN ('gestor_rh', 'gerente') THEN
        -- Admin pode promover apenas para gestor_rh e gerente
        UPDATE users 
        SET role = new_role, updated_at = NOW() 
        WHERE id = target_user_id;
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$;

-- 3. Função para validar permissões específicas
CREATE OR REPLACE FUNCTION validate_user_permission(
    user_auth_id UUID,
    module_name TEXT,
    operation TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role TEXT;
    has_permission BOOLEAN := FALSE;
BEGIN
    -- Buscar role do usuário
    SELECT role INTO user_role 
    FROM users 
    WHERE auth_user_id = user_auth_id;
    
    -- Se não encontrar usuário, negar acesso
    IF user_role IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Super admin e admin têm todas as permissões
    IF user_role IN ('super_admin', 'admin') THEN
        RETURN TRUE;
    END IF;
    
    -- Verificar permissões específicas para outros roles
    SELECT 
        CASE operation
            WHEN 'view' THEN can_view
            WHEN 'create' THEN can_create
            WHEN 'edit' THEN can_edit
            WHEN 'delete' THEN can_delete
            ELSE FALSE
        END
    INTO has_permission
    FROM role_permissions
    WHERE role_name = user_role AND module_name = validate_user_permission.module_name;
    
    RETURN COALESCE(has_permission, FALSE);
END;
$$;

-- 4. Função auxiliar para verificar se usuário é admin
CREATE OR REPLACE FUNCTION is_admin_user(user_auth_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role 
    FROM users 
    WHERE auth_user_id = user_auth_id;
    
    RETURN user_role IN ('super_admin', 'admin');
END;
$$;

-- 5. Função para obter informações do usuário atual
CREATE OR REPLACE FUNCTION get_current_user_info(user_auth_id UUID)
RETURNS TABLE(
    user_id UUID,
    username TEXT,
    email TEXT,
    role TEXT,
    department_id UUID,
    department_name TEXT,
    is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.username,
        u.email,
        u.role,
        u.department_id,
        d.name as department_name,
        u.is_active
    FROM users u
    LEFT JOIN departments d ON u.department_id = d.id
    WHERE u.auth_user_id = user_auth_id;
END;
$$;

-- Comentários nas funções
COMMENT ON FUNCTION get_user_permissions(uuid) IS 'Retorna permissões do usuário por módulo baseado em seu role';
COMMENT ON FUNCTION promote_user(uuid, text, uuid) IS 'Promove usuário para novo role respeitando hierarquia de permissões';
COMMENT ON FUNCTION validate_user_permission(uuid, text, text) IS 'Valida se usuário tem permissão específica para operação em módulo';
COMMENT ON FUNCTION is_admin_user(uuid) IS 'Verifica se usuário tem privilégios administrativos';
COMMENT ON FUNCTION get_current_user_info(uuid) IS 'Retorna informações completas do usuário atual';