-- Migração: Implementar sistema de auditoria e logs
-- Data: 2025-01-27
-- Descrição: Sistema completo de auditoria para rastreamento de ações

-- 1. Criar tabela de logs de auditoria
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    user_email TEXT,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criar tabela de logs de sistema
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_level TEXT NOT NULL CHECK (log_level IN ('DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL')),
    message TEXT NOT NULL,
    details JSONB,
    source TEXT,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Criar tabela de logs de login
CREATE TABLE login_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    user_email TEXT,
    login_type TEXT CHECK (login_type IN ('success', 'failed', 'logout')),
    ip_address INET,
    user_agent TEXT,
    location JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Criar índices para performance
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id);

CREATE INDEX idx_system_logs_level ON system_logs(log_level);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at);
CREATE INDEX idx_system_logs_user_id ON system_logs(user_id);

CREATE INDEX idx_login_logs_user_id ON login_logs(user_id);
CREATE INDEX idx_login_logs_type ON login_logs(login_type);
CREATE INDEX idx_login_logs_created_at ON login_logs(created_at);

-- 5. Função para registrar logs de auditoria
CREATE OR REPLACE FUNCTION log_audit_action(
    p_user_id UUID,
    p_action TEXT,
    p_table_name TEXT,
    p_record_id UUID DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    log_id UUID;
    user_email_val TEXT;
BEGIN
    -- Buscar email do usuário
    SELECT email INTO user_email_val FROM users WHERE id = p_user_id;
    
    -- Inserir log de auditoria
    INSERT INTO audit_logs (
        user_id, user_email, action, table_name, record_id, 
        old_values, new_values, ip_address, user_agent
    ) VALUES (
        p_user_id, user_email_val, p_action, p_table_name, p_record_id,
        p_old_values, p_new_values, p_ip_address, p_user_agent
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;

-- 6. Função para registrar logs de sistema
CREATE OR REPLACE FUNCTION log_system_event(
    p_level TEXT,
    p_message TEXT,
    p_details JSONB DEFAULT NULL,
    p_source TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO system_logs (log_level, message, details, source, user_id)
    VALUES (p_level, p_message, p_details, p_source, p_user_id)
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;

-- 7. Função para registrar logs de login
CREATE OR REPLACE FUNCTION log_login_event(
    p_user_id UUID,
    p_login_type TEXT,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_location JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    log_id UUID;
    user_email_val TEXT;
BEGIN
    -- Buscar email do usuário
    SELECT email INTO user_email_val FROM users WHERE id = p_user_id;
    
    INSERT INTO login_logs (user_id, user_email, login_type, ip_address, user_agent, location)
    VALUES (p_user_id, user_email_val, p_login_type, p_ip_address, p_user_agent, p_location)
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;

-- 8. Função genérica de trigger para auditoria
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_id UUID;
    action_type TEXT;
    old_data JSONB;
    new_data JSONB;
BEGIN
    -- Determinar o tipo de ação
    IF TG_OP = 'DELETE' THEN
        action_type := 'DELETE';
        old_data := to_jsonb(OLD);
        new_data := NULL;
    ELSIF TG_OP = 'UPDATE' THEN
        action_type := 'UPDATE';
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
    ELSIF TG_OP = 'INSERT' THEN
        action_type := 'INSERT';
        old_data := NULL;
        new_data := to_jsonb(NEW);
    END IF;
    
    -- Buscar ID do usuário atual
    SELECT id INTO current_user_id FROM users WHERE auth_user_id = auth.uid();
    
    -- Registrar log de auditoria
    PERFORM log_audit_action(
        current_user_id,
        action_type,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        old_data,
        new_data
    );
    
    -- Retornar o registro apropriado
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

-- 9. Aplicar triggers de auditoria nas tabelas principais
CREATE TRIGGER audit_users_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_departments_trigger
    AFTER INSERT OR UPDATE OR DELETE ON departments
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_role_permissions_trigger
    AFTER INSERT OR UPDATE OR DELETE ON role_permissions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_payroll_entries_trigger
    AFTER INSERT OR UPDATE OR DELETE ON payroll_entries
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_benefits_trigger
    AFTER INSERT OR UPDATE OR DELETE ON benefits
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_incidents_trigger
    AFTER INSERT OR UPDATE OR DELETE ON incidents
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_vacation_requests_trigger
    AFTER INSERT OR UPDATE OR DELETE ON vacation_requests
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_evaluations_trigger
    AFTER INSERT OR UPDATE OR DELETE ON evaluations
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- 10. Função para limpeza automática de logs antigos
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER := 0;
    temp_count INTEGER;
BEGIN
    -- Limpar audit_logs mais antigos que 1 ano
    DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '1 year';
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    -- Limpar system_logs mais antigos que 6 meses
    DELETE FROM system_logs WHERE created_at < NOW() - INTERVAL '6 months';
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    -- Limpar login_logs mais antigos que 3 meses
    DELETE FROM login_logs WHERE created_at < NOW() - INTERVAL '3 months';
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    -- Registrar limpeza no sistema
    PERFORM log_system_event(
        'INFO',
        'Limpeza automática de logs executada',
        jsonb_build_object('deleted_records', deleted_count),
        'cleanup_job'
    );
    
    RETURN deleted_count;
END;
$$;

-- 11. Habilitar RLS nas tabelas de log
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_logs ENABLE ROW LEVEL SECURITY;

-- 12. Políticas RLS para logs
-- Apenas admins podem ver logs de auditoria
CREATE POLICY "audit_logs_policy" ON audit_logs
    FOR ALL
    USING (
        is_admin_user(auth.uid())
    );

-- Apenas admins podem ver logs de sistema
CREATE POLICY "system_logs_policy" ON system_logs
    FOR ALL
    USING (
        is_admin_user(auth.uid())
    );

-- Usuários podem ver seus próprios logs de login, admins veem todos
CREATE POLICY "login_logs_select_policy" ON login_logs
    FOR SELECT
    USING (
        is_admin_user(auth.uid())
        OR
        user_id IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "login_logs_insert_policy" ON login_logs
    FOR INSERT
    WITH CHECK (TRUE); -- Sistema pode inserir logs

-- 13. Função para obter estatísticas de auditoria
CREATE OR REPLACE FUNCTION get_audit_statistics(
    start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE(
    total_actions BIGINT,
    actions_by_type JSONB,
    actions_by_table JSONB,
    top_users JSONB,
    daily_activity JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar se usuário é admin
    IF NOT is_admin_user(auth.uid()) THEN
        RAISE EXCEPTION 'Acesso negado: apenas administradores podem ver estatísticas de auditoria';
    END IF;
    
    RETURN QUERY
    SELECT 
        -- Total de ações
        (SELECT COUNT(*) FROM audit_logs WHERE created_at BETWEEN start_date AND end_date),
        
        -- Ações por tipo
        (SELECT jsonb_object_agg(action, count) 
         FROM (
             SELECT action, COUNT(*) as count 
             FROM audit_logs 
             WHERE created_at BETWEEN start_date AND end_date 
             GROUP BY action
         ) t),
        
        -- Ações por tabela
        (SELECT jsonb_object_agg(table_name, count) 
         FROM (
             SELECT table_name, COUNT(*) as count 
             FROM audit_logs 
             WHERE created_at BETWEEN start_date AND end_date 
             GROUP BY table_name
         ) t),
        
        -- Top usuários
        (SELECT jsonb_agg(jsonb_build_object('user_email', user_email, 'actions', count)) 
         FROM (
             SELECT user_email, COUNT(*) as count 
             FROM audit_logs 
             WHERE created_at BETWEEN start_date AND end_date 
             AND user_email IS NOT NULL
             GROUP BY user_email 
             ORDER BY count DESC 
             LIMIT 10
         ) t),
        
        -- Atividade diária
        (SELECT jsonb_object_agg(date_str, count) 
         FROM (
             SELECT DATE(created_at)::text as date_str, COUNT(*) as count 
             FROM audit_logs 
             WHERE created_at BETWEEN start_date AND end_date 
             GROUP BY DATE(created_at) 
             ORDER BY DATE(created_at)
         ) t);
END;
$$;

-- Comentários
COMMENT ON TABLE audit_logs IS 'Logs de auditoria para rastreamento de todas as ações dos usuários';
COMMENT ON TABLE system_logs IS 'Logs de sistema para eventos internos e erros';
COMMENT ON TABLE login_logs IS 'Logs de login/logout dos usuários';

COMMENT ON FUNCTION log_audit_action(uuid, text, text, uuid, jsonb, jsonb, inet, text) IS 'Registra ação de auditoria no sistema';
COMMENT ON FUNCTION log_system_event(text, text, jsonb, text, uuid) IS 'Registra evento de sistema';
COMMENT ON FUNCTION log_login_event(uuid, text, inet, text, jsonb) IS 'Registra evento de login/logout';
COMMENT ON FUNCTION cleanup_old_logs() IS 'Limpa logs antigos automaticamente';
COMMENT ON FUNCTION get_audit_statistics(timestamptz, timestamptz) IS 'Retorna estatísticas de auditoria para administradores';