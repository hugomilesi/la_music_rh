-- Criar tabela module_permissions para gerenciar permissões dinâmicas
-- Esta tabela permite configurar permissões específicas para cada role e módulo

CREATE TABLE IF NOT EXISTS public.module_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name TEXT NOT NULL,
    module_name TEXT NOT NULL,
    can_view BOOLEAN DEFAULT false,
    can_create BOOLEAN DEFAULT false,
    can_edit BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraint para garantir que cada role+module seja único
    CONSTRAINT unique_role_module UNIQUE (role_name, module_name),
    
    -- Constraint para garantir que apenas roles válidos sejam usados
    CONSTRAINT valid_role_name CHECK (role_name IN ('super_admin', 'admin', 'gestor_rh', 'gerente'))
);

-- Comentários da tabela
COMMENT ON TABLE public.module_permissions IS 'Permissões dinâmicas por role e módulo do sistema';
COMMENT ON COLUMN public.module_permissions.role_name IS 'Nome do role (super_admin, admin, gestor_rh, gerente)';
COMMENT ON COLUMN public.module_permissions.module_name IS 'Nome do módulo do sistema';
COMMENT ON COLUMN public.module_permissions.can_view IS 'Permissão para visualizar o módulo';
COMMENT ON COLUMN public.module_permissions.can_create IS 'Permissão para criar registros no módulo';
COMMENT ON COLUMN public.module_permissions.can_edit IS 'Permissão para editar registros no módulo';
COMMENT ON COLUMN public.module_permissions.can_delete IS 'Permissão para deletar registros no módulo';

-- Habilitar RLS
ALTER TABLE public.module_permissions ENABLE ROW LEVEL SECURITY;

-- Política para super_admin e admin (acesso total)
CREATE POLICY "Super admin and admin full access on module_permissions"
    ON public.module_permissions
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.auth_user_id = auth.uid()
            AND users.role IN ('super_admin', 'admin')
            AND users.is_active = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.auth_user_id = auth.uid()
            AND users.role IN ('super_admin', 'admin')
            AND users.is_active = true
        )
    );

-- Política para gestor_rh e gerente (apenas leitura das próprias permissões)
CREATE POLICY "HR and manager read own permissions"
    ON public.module_permissions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.auth_user_id = auth.uid()
            AND users.role = module_permissions.role_name
            AND users.is_active = true
        )
    );

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_module_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER module_permissions_updated_at_trigger
    BEFORE UPDATE ON public.module_permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_module_permissions_updated_at();

-- Conceder permissões básicas
GRANT SELECT ON public.module_permissions TO anon;
GRANT ALL PRIVILEGES ON public.module_permissions TO authenticated;

-- Log da migração
INSERT INTO public.system_logs (log_level, message, details, source)
VALUES (
    'INFO',
    'Tabela module_permissions criada com sucesso',
    jsonb_build_object(
        'migration', '20250128000000_create_module_permissions_table',
        'action', 'CREATE TABLE module_permissions',
        'reason', 'Implementar sistema de permissões dinâmicas por role e módulo'
    ),
    'migration'
);