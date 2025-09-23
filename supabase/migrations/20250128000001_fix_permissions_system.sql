-- Migração para corrigir sistema de permissões
-- Garantir que permissões sejam baseadas em roles (super_admin, admin, gestor_rh, gerente)
-- ao invés de cargos específicos (Gerente de Vendas, Analista de RH, etc)

-- 1. Verificar e corrigir roles na tabela users
-- Garantir que apenas os roles corretos existam
UPDATE public.users 
SET role = CASE 
    WHEN role IN ('super_admin', 'admin', 'gestor_rh', 'gerente') THEN role
    WHEN position LIKE '%Gerente%' OR position LIKE '%Manager%' THEN 'gerente'
    WHEN position LIKE '%RH%' OR position LIKE '%Recursos Humanos%' OR position LIKE '%Analista%' THEN 'gestor_rh'
    ELSE 'gerente' -- Default para outros casos
END
WHERE role NOT IN ('super_admin', 'admin', 'gestor_rh', 'gerente');

-- 2. Garantir que existe pelo menos um super_admin
-- Se não existir nenhum super_admin, promover o primeiro admin
DO $$
DECLARE
    admin_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE role = 'super_admin' AND is_active = true) THEN
        SELECT id INTO admin_id
        FROM public.users 
        WHERE role = 'admin' 
        AND is_active = true 
        ORDER BY created_at ASC 
        LIMIT 1;
        
        IF admin_id IS NOT NULL THEN
            UPDATE public.users 
            SET role = 'super_admin'
            WHERE id = admin_id;
        END IF;
    END IF;
END $$;

-- 3. Atualizar função get_user_permissions para usar roles corretos
-- Primeiro remover a função existente
DROP FUNCTION IF EXISTS public.get_user_permissions(UUID);

-- Recriar a função com o tipo correto
CREATE FUNCTION public.get_user_permissions(user_auth_id UUID)
RETURNS JSON AS $$
DECLARE
    user_role TEXT;
    permissions JSON;
BEGIN
    -- Buscar role do usuário
    SELECT role INTO user_role
    FROM public.users
    WHERE auth_user_id = user_auth_id
    AND is_active = true;
    
    -- Se usuário não encontrado ou inativo
    IF user_role IS NULL THEN
        RETURN '[]'::JSON;
    END IF;
    
    -- Super admin e admin têm acesso total
    IF user_role IN ('super_admin', 'admin') THEN
        RETURN '[
            {"name": "dashboard", "description": "Acesso ao painel principal"},
            {"name": "usuarios", "description": "Gerenciar usuários"},
            {"name": "permissoes.manage", "description": "Gerenciar permissões"},
            {"name": "configuracoes", "description": "Configurações do sistema"},
            {"name": "folha_pagamento", "description": "Gerenciar folha de pagamento"},
            {"name": "ferias", "description": "Gerenciar férias"},
            {"name": "beneficios", "description": "Gerenciar benefícios"},
            {"name": "avaliacoes", "description": "Gerenciar avaliações"},
            {"name": "documentos", "description": "Gerenciar documentos"},
            {"name": "nps", "description": "Pesquisas de satisfação"},
            {"name": "reconhecimento", "description": "Sistema de reconhecimento"},
            {"name": "whatsapp", "description": "Integração WhatsApp"},
            {"name": "agenda", "description": "Gerenciar agenda"}
        ]'::JSON;
    END IF;
    
    -- Para gestor_rh e gerente, buscar permissões dinâmicas
    SELECT COALESCE(
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'name', mp.module_name,
                    'description', COALESCE(mp.module_name, 'Permissão')
                )
            )
            FROM public.module_permissions mp
            WHERE mp.role_name = user_role
            AND (mp.can_view = true OR mp.can_create = true OR mp.can_edit = true OR mp.can_delete = true)
        ),
        '[]'::jsonb
    )::JSON INTO permissions;
    
    RETURN COALESCE(permissions, '[]'::JSON);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Garantir permissões básicas para gestor_rh e gerente
-- Inserir permissões padrão se não existirem
INSERT INTO public.module_permissions (role_name, module_name, can_view, can_create, can_edit, can_delete)
VALUES 
    -- Permissões para gestor_rh
    ('gestor_rh', 'dashboard', true, false, false, false),
    ('gestor_rh', 'usuarios', true, true, true, false),
    ('gestor_rh', 'ferias', true, true, true, true),
    ('gestor_rh', 'beneficios', true, true, true, true),
    ('gestor_rh', 'avaliacoes', true, true, true, true),
    ('gestor_rh', 'documentos', true, true, true, false),
    
    -- Permissões para gerente
    ('gerente', 'dashboard', true, false, false, false),
    ('gerente', 'ferias', true, false, true, false),
    ('gerente', 'avaliacoes', true, true, true, false),
    ('gerente', 'documentos', true, false, false, false)
ON CONFLICT (role_name, module_name) DO NOTHING;

-- 5. Limpar permissões de roles que não existem mais
DELETE FROM public.module_permissions 
WHERE role_name NOT IN ('super_admin', 'admin', 'gestor_rh', 'gerente');

-- 6. Atualizar comentários e documentação
COMMENT ON COLUMN public.users.role IS 'Roles: super_admin (acesso total), admin (promove gestor_rh/gerente), gestor_rh/gerente (permissões dinâmicas)';

-- Log da migração
INSERT INTO public.system_logs (log_level, message, details, source)
VALUES (
    'INFO',
    'Sistema de permissões corrigido',
    jsonb_build_object(
        'migration', '20250128000001_fix_permissions_system',
        'action', 'FIX PERMISSIONS SYSTEM',
        'changes', jsonb_build_array(
            'Corrigidos roles na tabela users',
            'Atualizada função get_user_permissions',
            'Adicionadas permissões padrão para gestor_rh e gerente',
            'Removidas permissões de roles inexistentes'
        )
    ),
    'migration'
);