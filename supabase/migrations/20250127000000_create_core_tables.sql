-- Migração: Criar tabelas principais do sistema de gestão de RH
-- Data: 2025-01-27
-- Descrição: Criação das tabelas core: departments, users, role_permissions

-- 1. Criar tabela departments
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    manager_id UUID, -- Será referenciado após criar tabela users
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criar tabela users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'gestor_rh', 'gerente')),
    department_id UUID REFERENCES departments(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Adicionar foreign key para manager_id em departments
ALTER TABLE departments 
ADD CONSTRAINT departments_manager_id_fkey 
FOREIGN KEY (manager_id) REFERENCES users(id);

-- 4. Criar tabela role_permissions para permissões dinâmicas
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name TEXT NOT NULL CHECK (role_name IN ('gestor_rh', 'gerente')),
    module_name TEXT NOT NULL,
    can_view BOOLEAN DEFAULT false,
    can_create BOOLEAN DEFAULT false,
    can_edit BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_name, module_name)
);

-- 5. Criar índices para performance
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department_id ON users(department_id);
CREATE INDEX idx_role_permissions_role_module ON role_permissions(role_name, module_name);

-- 6. Inserir dados iniciais para role_permissions
-- Módulos do sistema: dashboard, employees, payroll, benefits, vacation, evaluation, reports, settings, users, support, nps

-- Permissões padrão para gestor_rh
INSERT INTO role_permissions (role_name, module_name, can_view, can_create, can_edit, can_delete) VALUES
('gestor_rh', 'dashboard', true, false, false, false),
('gestor_rh', 'employees', true, true, true, false),
('gestor_rh', 'payroll', true, true, true, false),
('gestor_rh', 'benefits', true, true, true, false),
('gestor_rh', 'vacation', true, true, true, false),
('gestor_rh', 'evaluation', true, true, true, false),
('gestor_rh', 'reports', true, false, false, false),
('gestor_rh', 'settings', false, false, false, false),
('gestor_rh', 'users', false, false, false, false),
('gestor_rh', 'support', true, true, true, false),
('gestor_rh', 'nps', true, true, true, false);

-- Permissões padrão para gerente
INSERT INTO role_permissions (role_name, module_name, can_view, can_create, can_edit, can_delete) VALUES
('gerente', 'dashboard', true, false, false, false),
('gerente', 'employees', true, false, true, false),
('gerente', 'payroll', false, false, false, false),
('gerente', 'benefits', true, false, false, false),
('gerente', 'vacation', true, true, true, false),
('gerente', 'evaluation', true, true, true, false),
('gerente', 'reports', true, false, false, false),
('gerente', 'settings', false, false, false, false),
('gerente', 'users', false, false, false, false),
('gerente', 'support', true, true, false, false),
('gerente', 'nps', true, false, false, false);

-- 7. Comentários nas tabelas
COMMENT ON TABLE departments IS 'Departamentos da empresa';
COMMENT ON TABLE users IS 'Usuários do sistema com roles hierárquicos';
COMMENT ON TABLE role_permissions IS 'Permissões dinâmicas por role e módulo';

COMMENT ON COLUMN users.role IS 'Roles: super_admin (acesso total), admin (promove gestor_rh/gerente), gestor_rh/gerente (permissões dinâmicas)';
COMMENT ON COLUMN role_permissions.module_name IS 'Módulos: dashboard, employees, payroll, benefits, vacation, evaluation, reports, settings, users, support, nps';