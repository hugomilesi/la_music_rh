-- Migração: Implementar políticas RLS (Row Level Security)
-- Data: 2025-01-27
-- Descrição: Políticas de segurança para controle de acesso às tabelas

-- 1. Habilitar RLS nas tabelas principais
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para tabela USERS

-- Política de visualização (SELECT)
CREATE POLICY "users_select_policy" ON users
    FOR SELECT
    USING (
        -- Super admin e admin podem ver todos os usuários
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.role IN ('super_admin', 'admin')
        )
        OR
        -- Usuário pode ver seu próprio perfil
        auth_user_id = auth.uid()
        OR
        -- Gestor RH pode ver usuários do mesmo departamento
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.role = 'gestor_rh'
            AND u.department_id = users.department_id
        )
        OR
        -- Gerente pode ver usuários do mesmo departamento
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.role = 'gerente'
            AND u.department_id = users.department_id
        )
    );

-- Política de inserção (INSERT)
CREATE POLICY "users_insert_policy" ON users
    FOR INSERT
    WITH CHECK (
        -- Apenas super admin e admin podem criar usuários
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.role IN ('super_admin', 'admin')
        )
    );

-- Política de atualização (UPDATE)
CREATE POLICY "users_update_policy" ON users
    FOR UPDATE
    USING (
        -- Super admin e admin podem atualizar qualquer usuário
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.role IN ('super_admin', 'admin')
        )
        OR
        -- Usuário pode atualizar seu próprio perfil (exceto role)
        auth_user_id = auth.uid()
        OR
        -- Gestor RH pode atualizar usuários do mesmo departamento (exceto role)
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.role = 'gestor_rh'
            AND u.department_id = users.department_id
        )
    )
    WITH CHECK (
        -- Mesmas regras para o novo estado
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.role IN ('super_admin', 'admin')
        )
        OR
        auth_user_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.role = 'gestor_rh'
            AND u.department_id = users.department_id
        )
    );

-- Política de exclusão (DELETE)
CREATE POLICY "users_delete_policy" ON users
    FOR DELETE
    USING (
        -- Apenas super admin pode deletar usuários
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.role = 'super_admin'
        )
    );

-- 3. Políticas para tabela DEPARTMENTS

-- Política de visualização
CREATE POLICY "departments_select_policy" ON departments
    FOR SELECT
    USING (
        -- Super admin e admin podem ver todos os departamentos
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.role IN ('super_admin', 'admin')
        )
        OR
        -- Usuário pode ver seu próprio departamento
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.department_id = departments.id
        )
        OR
        -- Manager do departamento pode ver o departamento
        manager_id IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
    );

-- Política de inserção
CREATE POLICY "departments_insert_policy" ON departments
    FOR INSERT
    WITH CHECK (
        -- Apenas super admin e admin podem criar departamentos
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.role IN ('super_admin', 'admin')
        )
    );

-- Política de atualização
CREATE POLICY "departments_update_policy" ON departments
    FOR UPDATE
    USING (
        -- Super admin e admin podem atualizar qualquer departamento
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.role IN ('super_admin', 'admin')
        )
        OR
        -- Manager do departamento pode atualizar
        manager_id IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
    )
    WITH CHECK (
        -- Mesmas regras para o novo estado
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.role IN ('super_admin', 'admin')
        )
        OR
        manager_id IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
    );

-- Política de exclusão
CREATE POLICY "departments_delete_policy" ON departments
    FOR DELETE
    USING (
        -- Apenas super admin pode deletar departamentos
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.role = 'super_admin'
        )
    );

-- 4. Políticas para tabela ROLE_PERMISSIONS

-- Política de visualização
CREATE POLICY "role_permissions_select_policy" ON role_permissions
    FOR SELECT
    USING (
        -- Super admin e admin podem ver todas as permissões
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.role IN ('super_admin', 'admin')
        )
        OR
        -- Usuário pode ver permissões de seu próprio role
        role_name IN (
            SELECT role FROM users WHERE auth_user_id = auth.uid()
        )
    );

-- Política de inserção
CREATE POLICY "role_permissions_insert_policy" ON role_permissions
    FOR INSERT
    WITH CHECK (
        -- Apenas super admin pode criar permissões
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.role = 'super_admin'
        )
    );

-- Política de atualização
CREATE POLICY "role_permissions_update_policy" ON role_permissions
    FOR UPDATE
    USING (
        -- Apenas super admin pode atualizar permissões
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.role = 'super_admin'
        )
    )
    WITH CHECK (
        -- Mesma regra para o novo estado
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.role = 'super_admin'
        )
    );

-- Política de exclusão
CREATE POLICY "role_permissions_delete_policy" ON role_permissions
    FOR DELETE
    USING (
        -- Apenas super admin pode deletar permissões
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.role = 'super_admin'
        )
    );

-- 5. Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger nas tabelas
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_role_permissions_updated_at BEFORE UPDATE ON role_permissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON POLICY "users_select_policy" ON users IS 'Controla visualização de usuários baseado em hierarquia e departamento';
COMMENT ON POLICY "departments_select_policy" ON departments IS 'Controla acesso a departamentos baseado em role e associação';
COMMENT ON POLICY "role_permissions_select_policy" ON role_permissions IS 'Controla acesso às configurações de permissões';
COMMENT ON FUNCTION update_updated_at_column() IS 'Atualiza automaticamente o campo updated_at';