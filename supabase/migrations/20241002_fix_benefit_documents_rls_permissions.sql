-- Migration: Fix benefit documents RLS permissions
-- Date: 2024-10-02
-- Description: Add permissions for benefit_documents module to role_permissions table

-- Inserir permissões para a tabela benefit_documents na role_permissions
INSERT INTO role_permissions (role_name, module_name, can_view, can_create, can_edit, can_delete)
VALUES 
  ('gestor_rh', 'benefit_documents', true, true, true, true),
  ('gerente', 'benefit_documents', true, false, false, false)
ON CONFLICT (role_name, module_name) 
DO UPDATE SET 
  can_view = EXCLUDED.can_view,
  can_create = EXCLUDED.can_create,
  can_edit = EXCLUDED.can_edit,
  can_delete = EXCLUDED.can_delete;