-- Migração: Adicionar permissão 'documentos' nas configurações padrão
-- Data: 2025-01-27
-- Descrição: Adicionar permissão para módulo de documentos nos roles padrão

-- Adicionar permissões para documentos nos roles existentes
INSERT INTO role_permissions (role_name, module_name, can_view, can_create, can_edit, can_delete) VALUES
('gestor_rh', 'documentos', true, true, true, true),
('gerente', 'documentos', true, false, false, false)
ON CONFLICT (role_name, module_name) DO UPDATE SET
    can_view = EXCLUDED.can_view,
    can_create = EXCLUDED.can_create,
    can_edit = EXCLUDED.can_edit,
    can_delete = EXCLUDED.can_delete;

-- Registrar log da operação
SELECT log_system_event(
    'INFO',
    'Permissões de documentos adicionadas',
    jsonb_build_object(
        'gestor_rh_permissions', 'view, create, edit, delete',
        'gerente_permissions', 'view only'
    ),
    'system_setup'
);

-- Comentário da migração
COMMENT ON TABLE role_permissions IS 'Tabela de permissões por role - atualizada com permissões de documentos';