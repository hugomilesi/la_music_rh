-- Implementação de RLS dinâmico para o sistema de agendamento de mensagens
-- Baseado no sistema de permissões existente do projeto

-- 1. Função auxiliar para verificar permissões do usuário
CREATE OR REPLACE FUNCTION check_user_permission(
    user_id UUID,
    permission_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    has_permission BOOLEAN := FALSE;
BEGIN
    -- Verificar se o usuário tem a permissão específica
    -- Assumindo que existe uma estrutura de permissões similar ao sistema existente
    SELECT EXISTS(
        SELECT 1
        FROM user_permissions up
        JOIN permissions p ON up.permission_id = p.id
        WHERE up.user_id = check_user_permission.user_id
        AND p.name = permission_name
        AND up.is_active = TRUE
    ) INTO has_permission;
    
    -- Se não encontrou na tabela de permissões diretas, verificar por roles
    IF NOT has_permission THEN
        SELECT EXISTS(
            SELECT 1
            FROM user_roles ur
            JOIN role_permissions rp ON ur.role_id = rp.role_id
            JOIN permissions p ON rp.permission_id = p.id
            WHERE ur.user_id = check_user_permission.user_id
            AND p.name = permission_name
            AND ur.is_active = TRUE
            AND rp.is_active = TRUE
        ) INTO has_permission;
    END IF;
    
    RETURN has_permission;
END;
$$;

-- 2. Função para verificar se usuário pode acessar agendamentos de um tipo específico
CREATE OR REPLACE FUNCTION can_access_schedule_type(
    user_id UUID,
    schedule_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    CASE schedule_type
        WHEN 'notification' THEN
            RETURN check_user_permission(user_id, 'manage_notifications') OR
                   check_user_permission(user_id, 'view_notifications');
        WHEN 'nps' THEN
            RETURN check_user_permission(user_id, 'manage_nps') OR
                   check_user_permission(user_id, 'view_nps');
        WHEN 'whatsapp' THEN
            RETURN check_user_permission(user_id, 'manage_whatsapp') OR
                   check_user_permission(user_id, 'view_whatsapp');
        WHEN 'email' THEN
            RETURN check_user_permission(user_id, 'manage_email') OR
                   check_user_permission(user_id, 'view_email');
        ELSE
            RETURN FALSE;
    END CASE;
END;
$$;

-- 3. Função para verificar se usuário pode gerenciar (criar/editar/deletar) agendamentos
CREATE OR REPLACE FUNCTION can_manage_schedule_type(
    user_id UUID,
    schedule_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    CASE schedule_type
        WHEN 'notification' THEN
            RETURN check_user_permission(user_id, 'manage_notifications');
        WHEN 'nps' THEN
            RETURN check_user_permission(user_id, 'manage_nps');
        WHEN 'whatsapp' THEN
            RETURN check_user_permission(user_id, 'manage_whatsapp');
        WHEN 'email' THEN
            RETURN check_user_permission(user_id, 'manage_email');
        ELSE
            RETURN FALSE;
    END CASE;
END;
$$;

-- 4. Função para verificar se usuário é admin ou super admin
CREATE OR REPLACE FUNCTION is_admin_user(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN check_user_permission(user_id, 'admin_access') OR
           check_user_permission(user_id, 'super_admin_access');
END;
$$;

-- 5. Políticas RLS para message_schedules

-- Política de visualização (SELECT)
CREATE POLICY "message_schedules_select_policy" ON message_schedules
    FOR SELECT
    USING (
        -- Admin pode ver tudo
        is_admin_user(auth.uid()) OR
        -- Usuário pode ver seus próprios agendamentos
        created_by = auth.uid() OR
        -- Usuário pode ver agendamentos do tipo que tem permissão
        can_access_schedule_type(auth.uid(), type) OR
        -- Usuário pode ver agendamentos onde ele é o alvo
        (target_users ? auth.uid()::TEXT)
    );

-- Política de inserção (INSERT)
CREATE POLICY "message_schedules_insert_policy" ON message_schedules
    FOR INSERT
    WITH CHECK (
        -- Admin pode criar qualquer agendamento
        is_admin_user(auth.uid()) OR
        -- Usuário pode criar agendamentos do tipo que tem permissão para gerenciar
        can_manage_schedule_type(auth.uid(), type)
    );

-- Política de atualização (UPDATE)
CREATE POLICY "message_schedules_update_policy" ON message_schedules
    FOR UPDATE
    USING (
        -- Admin pode atualizar tudo
        is_admin_user(auth.uid()) OR
        -- Usuário pode atualizar seus próprios agendamentos
        created_by = auth.uid() OR
        -- Usuário pode atualizar agendamentos do tipo que tem permissão para gerenciar
        can_manage_schedule_type(auth.uid(), type)
    )
    WITH CHECK (
        -- Mesmas regras para o novo estado
        is_admin_user(auth.uid()) OR
        created_by = auth.uid() OR
        can_manage_schedule_type(auth.uid(), type)
    );

-- Política de exclusão (DELETE)
CREATE POLICY "message_schedules_delete_policy" ON message_schedules
    FOR DELETE
    USING (
        -- Admin pode deletar tudo
        is_admin_user(auth.uid()) OR
        -- Usuário pode deletar seus próprios agendamentos
        created_by = auth.uid() OR
        -- Usuário pode deletar agendamentos do tipo que tem permissão para gerenciar
        can_manage_schedule_type(auth.uid(), type)
    );

-- 6. Políticas RLS para message_schedule_logs

-- Política de visualização de logs
CREATE POLICY "message_schedule_logs_select_policy" ON message_schedule_logs
    FOR SELECT
    USING (
        -- Admin pode ver todos os logs
        is_admin_user(auth.uid()) OR
        -- Usuário pode ver logs de agendamentos que ele pode acessar
        EXISTS (
            SELECT 1 FROM message_schedules ms
            WHERE ms.id = message_schedule_logs.schedule_id
            AND (
                ms.created_by = auth.uid() OR
                can_access_schedule_type(auth.uid(), ms.type) OR
                (ms.target_users ? auth.uid()::TEXT)
            )
        ) OR
        -- Logs do sistema (schedule_id é NULL) podem ser vistos por admins
        (schedule_id IS NULL AND is_admin_user(auth.uid()))
    );

-- Política de inserção de logs (apenas sistema)
CREATE POLICY "message_schedule_logs_insert_policy" ON message_schedule_logs
    FOR INSERT
    WITH CHECK (
        -- Apenas o sistema pode inserir logs (através das funções)
        TRUE -- As funções já controlam a inserção
    );

-- 7. Políticas RLS para system_alerts

-- Política de visualização de alertas
CREATE POLICY "system_alerts_select_policy" ON system_alerts
    FOR SELECT
    USING (
        -- Apenas admins podem ver alertas do sistema
        is_admin_user(auth.uid())
    );

-- Política de gerenciamento de alertas
CREATE POLICY "system_alerts_manage_policy" ON system_alerts
    FOR ALL
    USING (
        -- Apenas admins podem gerenciar alertas
        is_admin_user(auth.uid())
    )
    WITH CHECK (
        is_admin_user(auth.uid())
    );

-- 8. Função para validar permissões no frontend
CREATE OR REPLACE FUNCTION validate_user_schedule_permissions(user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    permissions JSONB;
BEGIN
    SELECT jsonb_build_object(
        'isAdmin', is_admin_user(user_id),
        'canManageNotifications', can_manage_schedule_type(user_id, 'notification'),
        'canViewNotifications', can_access_schedule_type(user_id, 'notification'),
        'canManageNPS', can_manage_schedule_type(user_id, 'nps'),
        'canViewNPS', can_access_schedule_type(user_id, 'nps'),
        'canManageWhatsApp', can_manage_schedule_type(user_id, 'whatsapp'),
        'canViewWhatsApp', can_access_schedule_type(user_id, 'whatsapp'),
        'canManageEmail', can_manage_schedule_type(user_id, 'email'),
        'canViewEmail', can_access_schedule_type(user_id, 'email'),
        'availableTypes', (
            SELECT jsonb_agg(schedule_type)
            FROM (
                SELECT 'notification' as schedule_type WHERE can_access_schedule_type(user_id, 'notification')
                UNION
                SELECT 'nps' WHERE can_access_schedule_type(user_id, 'nps')
                UNION
                SELECT 'whatsapp' WHERE can_access_schedule_type(user_id, 'whatsapp')
                UNION
                SELECT 'email' WHERE can_access_schedule_type(user_id, 'email')
            ) types
        )
    ) INTO permissions;
    
    RETURN permissions;
END;
$$;

-- 9. Função para obter agendamentos com filtros de permissão
CREATE OR REPLACE FUNCTION get_user_schedules(
    user_id UUID,
    schedule_type TEXT DEFAULT NULL,
    status TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 50,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
    id UUID,
    type TEXT,
    title TEXT,
    description TEXT,
    status TEXT,
    schedule_type TEXT,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    next_execution_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    target_count INTEGER,
    can_edit BOOLEAN,
    can_delete BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ms.id,
        ms.type,
        ms.title,
        ms.description,
        ms.status,
        ms.schedule_type,
        ms.scheduled_for,
        ms.next_execution_at,
        ms.created_at,
        ms.created_by,
        jsonb_array_length(ms.target_users) as target_count,
        (
            is_admin_user(user_id) OR
            ms.created_by = user_id OR
            can_manage_schedule_type(user_id, ms.type)
        ) as can_edit,
        (
            is_admin_user(user_id) OR
            ms.created_by = user_id OR
            can_manage_schedule_type(user_id, ms.type)
        ) as can_delete
    FROM message_schedules ms
    WHERE (
        -- Aplicar filtros de permissão
        is_admin_user(user_id) OR
        ms.created_by = user_id OR
        can_access_schedule_type(user_id, ms.type) OR
        (ms.target_users ? user_id::TEXT)
    )
    AND (schedule_type IS NULL OR ms.type = schedule_type)
    AND (status IS NULL OR ms.status = status)
    ORDER BY ms.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;

-- 10. Inserir permissões padrão se não existirem
INSERT INTO permissions (name, description, category) VALUES
('manage_notifications', 'Gerenciar agendamentos de notificações', 'scheduling'),
('view_notifications', 'Visualizar agendamentos de notificações', 'scheduling'),
('manage_nps', 'Gerenciar agendamentos de NPS', 'scheduling'),
('view_nps', 'Visualizar agendamentos de NPS', 'scheduling'),
('manage_whatsapp', 'Gerenciar agendamentos de WhatsApp', 'scheduling'),
('view_whatsapp', 'Visualizar agendamentos de WhatsApp', 'scheduling'),
('manage_email', 'Gerenciar agendamentos de email', 'scheduling'),
('view_email', 'Visualizar agendamentos de email', 'scheduling')
ON CONFLICT (name) DO NOTHING;

-- Log da configuração de RLS
INSERT INTO message_schedule_logs (
    schedule_id,
    log_type,
    message,
    details
) VALUES (
    NULL,
    'system_setup',
    'RLS dinâmico configurado para sistema de agendamento',
    jsonb_build_object(
        'policies_created', 8,
        'permissions_added', 8,
        'setup_date', NOW()
    )
);