-- Remover função antiga se existir
DROP FUNCTION IF EXISTS get_user_permissions(uuid);

-- Criar nova função get_user_permissions que funciona com a estrutura de módulos
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
    
    -- Se for super_admin, retornar todas as permissões para todos os módulos
    IF user_role_name = 'super_admin' THEN
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