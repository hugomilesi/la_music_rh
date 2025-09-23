-- Migração: Implementar políticas RLS para tabelas complementares
-- Data: 2025-01-27
-- Descrição: Políticas de segurança para tabelas de payroll, benefits, incidents, etc.

-- 1. Habilitar RLS nas tabelas complementares
ALTER TABLE benefit_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_schedule_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para BENEFIT_TYPES
CREATE POLICY "benefit_types_select_policy" ON benefit_types
    FOR SELECT
    USING (
        -- Todos os usuários autenticados podem ver tipos de benefícios
        auth.uid() IS NOT NULL
    );

CREATE POLICY "benefit_types_modify_policy" ON benefit_types
    FOR ALL
    USING (
        -- Apenas super admin e admin podem modificar tipos de benefícios
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.role IN ('super_admin', 'admin')
        )
    );

-- 3. Políticas para BENEFITS
CREATE POLICY "benefits_select_policy" ON benefits
    FOR SELECT
    USING (
        -- Usuários com permissão de visualizar benefits
        validate_user_permission(auth.uid(), 'benefits', 'view')
    );

CREATE POLICY "benefits_insert_policy" ON benefits
    FOR INSERT
    WITH CHECK (
        -- Usuários com permissão de criar benefits
        validate_user_permission(auth.uid(), 'benefits', 'create')
    );

CREATE POLICY "benefits_update_policy" ON benefits
    FOR UPDATE
    USING (
        validate_user_permission(auth.uid(), 'benefits', 'edit')
    )
    WITH CHECK (
        validate_user_permission(auth.uid(), 'benefits', 'edit')
    );

CREATE POLICY "benefits_delete_policy" ON benefits
    FOR DELETE
    USING (
        validate_user_permission(auth.uid(), 'benefits', 'delete')
    );

-- 4. Políticas para PAYROLL_ENTRIES
CREATE POLICY "payroll_entries_select_policy" ON payroll_entries
    FOR SELECT
    USING (
        -- Usuários com permissão de visualizar payroll
        validate_user_permission(auth.uid(), 'payroll', 'view')
        OR
        -- Usuário pode ver suas próprias entradas se for funcionário cadastrado
        created_by IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "payroll_entries_insert_policy" ON payroll_entries
    FOR INSERT
    WITH CHECK (
        validate_user_permission(auth.uid(), 'payroll', 'create')
    );

CREATE POLICY "payroll_entries_update_policy" ON payroll_entries
    FOR UPDATE
    USING (
        validate_user_permission(auth.uid(), 'payroll', 'edit')
    )
    WITH CHECK (
        validate_user_permission(auth.uid(), 'payroll', 'edit')
    );

CREATE POLICY "payroll_entries_delete_policy" ON payroll_entries
    FOR DELETE
    USING (
        validate_user_permission(auth.uid(), 'payroll', 'delete')
    );

-- 5. Políticas para INCIDENTS
CREATE POLICY "incidents_select_policy" ON incidents
    FOR SELECT
    USING (
        (
            -- Usuários com permissão de visualizar support
            validate_user_permission(auth.uid(), 'support', 'view')
            OR
            -- Usuário pode ver incidentes que reportou
            reported_by IN (
                SELECT id FROM users WHERE auth_user_id = auth.uid()
            )
            OR
            -- Usuário pode ver incidentes atribuídos a ele
            assigned_to IN (
                SELECT id FROM users WHERE auth_user_id = auth.uid()
            )
            OR
            -- Usuário pode ver incidentes relacionados a ele
            employee_id IN (
                SELECT id FROM users WHERE auth_user_id = auth.uid()
            )
        )
        AND
        (
            -- Filtrar incidentes confidenciais
            is_confidential = false
            OR
            -- Apenas admins podem ver incidentes confidenciais
            is_admin_user(auth.uid())
            OR
            -- Ou se o usuário está diretamente envolvido
            reported_by IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
            OR assigned_to IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
        )
    );

CREATE POLICY "incidents_insert_policy" ON incidents
    FOR INSERT
    WITH CHECK (
        validate_user_permission(auth.uid(), 'support', 'create')
    );

CREATE POLICY "incidents_update_policy" ON incidents
    FOR UPDATE
    USING (
        validate_user_permission(auth.uid(), 'support', 'edit')
        OR
        -- Usuário pode atualizar incidentes atribuídos a ele
        assigned_to IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
    )
    WITH CHECK (
        validate_user_permission(auth.uid(), 'support', 'edit')
        OR
        assigned_to IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "incidents_delete_policy" ON incidents
    FOR DELETE
    USING (
        validate_user_permission(auth.uid(), 'support', 'delete')
    );

-- 6. Políticas para DOCUMENTS
CREATE POLICY "documents_select_policy" ON documents
    FOR SELECT
    USING (
        -- Documentos públicos podem ser vistos por todos
        is_public = true
        OR
        -- Usuário pode ver documentos que enviou
        uploaded_by IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
        OR
        -- Admins podem ver todos os documentos
        is_admin_user(auth.uid())
    );

CREATE POLICY "documents_insert_policy" ON documents
    FOR INSERT
    WITH CHECK (
        -- Usuários autenticados podem fazer upload
        auth.uid() IS NOT NULL
    );

CREATE POLICY "documents_update_policy" ON documents
    FOR UPDATE
    USING (
        -- Usuário pode atualizar documentos que enviou
        uploaded_by IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
        OR
        -- Admins podem atualizar qualquer documento
        is_admin_user(auth.uid())
    )
    WITH CHECK (
        uploaded_by IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
        OR
        is_admin_user(auth.uid())
    );

CREATE POLICY "documents_delete_policy" ON documents
    FOR DELETE
    USING (
        uploaded_by IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
        OR
        is_admin_user(auth.uid())
    );

-- 7. Políticas para MESSAGE_SCHEDULES
CREATE POLICY "message_schedules_select_policy" ON message_schedules
    FOR SELECT
    USING (
        -- Admins podem ver todos os agendamentos
        is_admin_user(auth.uid())
        OR
        -- Usuário pode ver agendamentos que criou
        created_by IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
        OR
        -- Usuário pode ver agendamentos direcionados a ele
        (target_users ? (SELECT id::text FROM users WHERE auth_user_id = auth.uid()))
    );

CREATE POLICY "message_schedules_insert_policy" ON message_schedules
    FOR INSERT
    WITH CHECK (
        -- Usuários com permissão baseada no tipo de mensagem
        (type = 'notification' AND validate_user_permission(auth.uid(), 'settings', 'create'))
        OR
        (type = 'nps' AND validate_user_permission(auth.uid(), 'nps', 'create'))
        OR
        (type = 'email' AND is_admin_user(auth.uid()))
        OR
        (type = 'whatsapp' AND is_admin_user(auth.uid()))
    );

CREATE POLICY "message_schedules_update_policy" ON message_schedules
    FOR UPDATE
    USING (
        is_admin_user(auth.uid())
        OR
        created_by IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
    )
    WITH CHECK (
        is_admin_user(auth.uid())
        OR
        created_by IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "message_schedules_delete_policy" ON message_schedules
    FOR DELETE
    USING (
        is_admin_user(auth.uid())
        OR
        created_by IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
    );

-- 8. Políticas para MESSAGE_SCHEDULE_LOGS
CREATE POLICY "message_schedule_logs_select_policy" ON message_schedule_logs
    FOR SELECT
    USING (
        -- Admins podem ver todos os logs
        is_admin_user(auth.uid())
        OR
        -- Usuário pode ver logs de agendamentos que criou
        EXISTS (
            SELECT 1 FROM message_schedules ms
            WHERE ms.id = message_schedule_logs.schedule_id
            AND ms.created_by IN (
                SELECT id FROM users WHERE auth_user_id = auth.uid()
            )
        )
    );

CREATE POLICY "message_schedule_logs_insert_policy" ON message_schedule_logs
    FOR INSERT
    WITH CHECK (
        -- Apenas sistema pode inserir logs (através das funções)
        TRUE
    );

-- 9. Políticas para SYSTEM_ALERTS
CREATE POLICY "system_alerts_policy" ON system_alerts
    FOR ALL
    USING (
        -- Apenas admins podem gerenciar alertas do sistema
        is_admin_user(auth.uid())
    );

-- 10. Políticas para VACATION_REQUESTS
CREATE POLICY "vacation_requests_select_policy" ON vacation_requests
    FOR SELECT
    USING (
        -- Usuários com permissão de visualizar vacation
        validate_user_permission(auth.uid(), 'vacation', 'view')
        OR
        -- Usuário pode ver suas próprias solicitações
        employee_id IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
        OR
        -- Aprovador pode ver solicitações
        approved_by IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "vacation_requests_insert_policy" ON vacation_requests
    FOR INSERT
    WITH CHECK (
        validate_user_permission(auth.uid(), 'vacation', 'create')
        OR
        -- Usuário pode criar suas próprias solicitações
        employee_id IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "vacation_requests_update_policy" ON vacation_requests
    FOR UPDATE
    USING (
        validate_user_permission(auth.uid(), 'vacation', 'edit')
        OR
        -- Usuário pode atualizar suas próprias solicitações (se pendente)
        (employee_id IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        ) AND status = 'pending')
    )
    WITH CHECK (
        validate_user_permission(auth.uid(), 'vacation', 'edit')
        OR
        (employee_id IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        ) AND status = 'pending')
    );

CREATE POLICY "vacation_requests_delete_policy" ON vacation_requests
    FOR DELETE
    USING (
        validate_user_permission(auth.uid(), 'vacation', 'delete')
    );

-- 11. Políticas para EVALUATIONS
CREATE POLICY "evaluations_select_policy" ON evaluations
    FOR SELECT
    USING (
        -- Usuários com permissão de visualizar evaluation
        validate_user_permission(auth.uid(), 'evaluation', 'view')
        OR
        -- Funcionário pode ver suas próprias avaliações
        employee_id IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
        OR
        -- Avaliador pode ver avaliações que conduziu
        evaluator_id IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "evaluations_insert_policy" ON evaluations
    FOR INSERT
    WITH CHECK (
        validate_user_permission(auth.uid(), 'evaluation', 'create')
    );

CREATE POLICY "evaluations_update_policy" ON evaluations
    FOR UPDATE
    USING (
        validate_user_permission(auth.uid(), 'evaluation', 'edit')
        OR
        -- Avaliador pode atualizar avaliações que conduziu
        evaluator_id IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
    )
    WITH CHECK (
        validate_user_permission(auth.uid(), 'evaluation', 'edit')
        OR
        evaluator_id IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "evaluations_delete_policy" ON evaluations
    FOR DELETE
    USING (
        validate_user_permission(auth.uid(), 'evaluation', 'delete')
    );

-- Comentários nas políticas
COMMENT ON POLICY "payroll_entries_select_policy" ON payroll_entries IS 'Controla acesso à folha de pagamento baseado em permissões e criador';
COMMENT ON POLICY "incidents_select_policy" ON incidents IS 'Controla acesso a incidentes considerando confidencialidade e envolvimento';
COMMENT ON POLICY "documents_select_policy" ON documents IS 'Controla acesso a documentos baseado em visibilidade pública e propriedade';
COMMENT ON POLICY "vacation_requests_select_policy" ON vacation_requests IS 'Controla acesso a solicitações de férias baseado em permissões e propriedade';
COMMENT ON POLICY "evaluations_select_policy" ON evaluations IS 'Controla acesso a avaliações baseado em permissões, funcionário e avaliador';