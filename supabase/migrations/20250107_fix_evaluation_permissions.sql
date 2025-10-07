-- Inserir permissões padrão para o módulo evaluation
INSERT INTO role_permissions (role_name, module_name, can_view, can_create, can_edit, can_delete)
VALUES 
    ('gestor_rh', 'evaluation', true, true, true, true),
    ('gerente', 'evaluation', true, true, true, false)
ON CONFLICT (role_name, module_name) 
DO UPDATE SET 
    can_view = EXCLUDED.can_view,
    can_create = EXCLUDED.can_create,
    can_edit = EXCLUDED.can_edit,
    can_delete = EXCLUDED.can_delete;