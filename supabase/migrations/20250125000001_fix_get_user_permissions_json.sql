-- Corrigir função get_user_permissions para retornar JSON como esperado pelo frontend
DROP FUNCTION IF EXISTS get_user_permissions(uuid);

CREATE OR REPLACE FUNCTION get_user_permissions(user_auth_id uuid)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role_name TEXT;
    permissions_json JSON;
BEGIN
    -- Buscar role do usuário usando auth_user_id
    SELECT role INTO user_role_name 
    FROM users 
    WHERE auth_user_id = user_auth_id;
    
    -- Se não encontrar o usuário, retornar array vazio
    IF user_role_name IS NULL THEN
        RETURN '[]'::JSON;
    END IF;
    
    -- Se for super_admin, retornar todas as permissões para todos os módulos
    IF user_role_name = 'super_admin' THEN
        SELECT json_agg(
            json_build_object(
                'name', module_name,
                'description', 'Permissão para ' || module_name
            )
        ) INTO permissions_json
        FROM (
            SELECT 'dashboard' as module_name
            UNION ALL SELECT 'usuarios'
            UNION ALL SELECT 'folha_pagamento'
            UNION ALL SELECT 'ferias'
            UNION ALL SELECT 'beneficios'
            UNION ALL SELECT 'avaliacoes'
            UNION ALL SELECT 'documentos'
            UNION ALL SELECT 'agenda'
            UNION ALL SELECT 'ocorrencias'
            UNION ALL SELECT 'reconhecimento'
            UNION ALL SELECT 'nps'
            UNION ALL SELECT 'notificacoes'
            UNION ALL SELECT 'whatsapp'
            UNION ALL SELECT 'configuracoes'
            UNION ALL SELECT 'permissoes'
        ) modules;
    ELSE
        -- Para outros roles, buscar permissões da tabela role_permissions
        -- Retornar apenas módulos onde can_view = true
        SELECT json_agg(
            json_build_object(
                'name', rp.module_name,
                'description', 'Permissão para ' || rp.module_name
            )
        ) INTO permissions_json
        FROM role_permissions rp
        WHERE rp.role_name = user_role_name
        AND rp.can_view = true;
    END IF;
    
    -- Se não houver permissões, retornar array vazio
    IF permissions_json IS NULL THEN
        RETURN '[]'::JSON;
    END IF;
    
    RETURN permissions_json;
END;
$$;