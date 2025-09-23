-- Migração: Criar tabelas complementares do sistema
-- Data: 2025-01-27
-- Descrição: Tabelas para payroll, benefits, incidents, documents, message_schedules, etc.

-- 1. Criar tabela benefit_types
CREATE TABLE benefit_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criar tabela benefits
CREATE TABLE benefits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    benefit_type_id UUID REFERENCES benefit_types(id),
    cost NUMERIC(10,2),
    employer_contribution NUMERIC(10,2),
    employee_contribution NUMERIC(10,2),
    coverage_details JSONB,
    provider TEXT,
    is_active BOOLEAN DEFAULT true,
    effective_date DATE,
    expiration_date DATE,
    eligibility_rules JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Criar tabela payroll_entries
CREATE TABLE payroll_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_name TEXT NOT NULL,
    employee_cpf TEXT,
    unit TEXT NOT NULL CHECK (unit IN ('Barra', 'CG EMLA', 'CG LAMK', 'Professores Multi-Unidade', 'Recreio', 'Staff Rateado')),
    position TEXT,
    base_salary NUMERIC(10,2),
    overtime_hours NUMERIC(5,2),
    overtime_amount NUMERIC(10,2),
    bonuses NUMERIC(10,2),
    deductions NUMERIC(10,2),
    gross_salary NUMERIC(10,2),
    inss NUMERIC(10,2),
    irrf NUMERIC(10,2),
    other_deductions NUMERIC(10,2),
    net_salary NUMERIC(10,2),
    reference_month INTEGER CHECK (reference_month BETWEEN 1 AND 12),
    reference_year INTEGER CHECK (reference_year >= 2020),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Criar tabela incidents
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    incident_type TEXT,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority TEXT,
    location TEXT,
    date_occurred TIMESTAMPTZ,
    reported_by UUID REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    employee_id UUID REFERENCES users(id),
    witnesses TEXT[],
    evidence_files TEXT[],
    actions_taken TEXT,
    resolution TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    is_confidential BOOLEAN DEFAULT false,
    tags TEXT[],
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ
);

-- 5. Criar tabela documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    file_path TEXT,
    file_size BIGINT,
    mime_type TEXT,
    category TEXT,
    tags TEXT[],
    is_public BOOLEAN DEFAULT false,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Criar tabela message_schedules
CREATE TABLE message_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('notification', 'nps', 'whatsapp', 'email')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content JSONB NOT NULL,
    target_users JSONB,
    schedule_type VARCHAR(50) NOT NULL CHECK (schedule_type IN ('immediate', 'recurring', 'conditional')),
    scheduled_for TIMESTAMPTZ,
    recurrence_pattern JSONB,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    last_executed_at TIMESTAMPTZ,
    next_execution_at TIMESTAMPTZ,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    execution_log JSONB,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Criar tabela message_schedule_logs
CREATE TABLE message_schedule_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID REFERENCES message_schedules(id) ON DELETE CASCADE,
    log_type VARCHAR(50) NOT NULL CHECK (log_type IN ('info', 'warning', 'error', 'success', 'system_alert')),
    message TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Criar tabela system_alerts
CREATE TABLE system_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type TEXT NOT NULL,
    threshold_value NUMERIC,
    notification_channels JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Criar tabela vacation_requests
CREATE TABLE vacation_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES users(id) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_requested INTEGER NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Criar tabela evaluations
CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES users(id) NOT NULL,
    evaluator_id UUID REFERENCES users(id) NOT NULL,
    evaluation_period_start DATE NOT NULL,
    evaluation_period_end DATE NOT NULL,
    overall_score NUMERIC(3,2) CHECK (overall_score >= 0 AND overall_score <= 10),
    goals_achievement JSONB,
    competencies_assessment JSONB,
    feedback TEXT,
    development_plan TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'reviewed', 'finalized')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Criar índices para performance
CREATE INDEX idx_benefits_type_id ON benefits(benefit_type_id);
CREATE INDEX idx_payroll_entries_unit ON payroll_entries(unit);
CREATE INDEX idx_payroll_entries_reference ON payroll_entries(reference_year, reference_month);
CREATE INDEX idx_payroll_entries_created_by ON payroll_entries(created_by);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_reported_by ON incidents(reported_by);
CREATE INDEX idx_incidents_assigned_to ON incidents(assigned_to);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_message_schedules_type ON message_schedules(type);
CREATE INDEX idx_message_schedules_status ON message_schedules(status);
CREATE INDEX idx_message_schedules_created_by ON message_schedules(created_by);
CREATE INDEX idx_message_schedule_logs_schedule_id ON message_schedule_logs(schedule_id);
CREATE INDEX idx_vacation_requests_employee_id ON vacation_requests(employee_id);
CREATE INDEX idx_vacation_requests_status ON vacation_requests(status);
CREATE INDEX idx_evaluations_employee_id ON evaluations(employee_id);
CREATE INDEX idx_evaluations_evaluator_id ON evaluations(evaluator_id);

-- 12. Aplicar triggers de updated_at
CREATE TRIGGER update_benefit_types_updated_at BEFORE UPDATE ON benefit_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_benefits_updated_at BEFORE UPDATE ON benefits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payroll_entries_updated_at BEFORE UPDATE ON payroll_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_schedules_updated_at BEFORE UPDATE ON message_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_alerts_updated_at BEFORE UPDATE ON system_alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vacation_requests_updated_at BEFORE UPDATE ON vacation_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluations_updated_at BEFORE UPDATE ON evaluations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13. Inserir dados iniciais para benefit_types
INSERT INTO benefit_types (name, description, icon, color) VALUES
('Saúde', 'Planos de saúde e assistência médica', 'heart', '#ef4444'),
('Odontológico', 'Planos odontológicos', 'smile', '#3b82f6'),
('Alimentação', 'Vale alimentação e refeição', 'utensils', '#10b981'),
('Transporte', 'Vale transporte e combustível', 'car', '#f59e0b'),
('Educação', 'Auxílio educação e cursos', 'book', '#8b5cf6'),
('Seguro de Vida', 'Seguro de vida em grupo', 'shield', '#6b7280');

-- Comentários nas tabelas
COMMENT ON TABLE benefit_types IS 'Tipos de benefícios oferecidos pela empresa';
COMMENT ON TABLE benefits IS 'Benefícios específicos com detalhes de cobertura e custos';
COMMENT ON TABLE payroll_entries IS 'Entradas da folha de pagamento - pode incluir colaboradores não cadastrados';
COMMENT ON TABLE incidents IS 'Registro de incidentes e ocorrências no ambiente de trabalho';
COMMENT ON TABLE documents IS 'Documentos do sistema com controle de acesso';
COMMENT ON TABLE message_schedules IS 'Sistema unificado de agendamento de mensagens';
COMMENT ON TABLE message_schedule_logs IS 'Logs detalhados de execução dos agendamentos';
COMMENT ON TABLE system_alerts IS 'Configurações de alertas do sistema';
COMMENT ON TABLE vacation_requests IS 'Solicitações de férias dos funcionários';
COMMENT ON TABLE evaluations IS 'Avaliações de desempenho dos funcionários';

COMMENT ON COLUMN payroll_entries.unit IS 'Unidades: Barra, CG EMLA, CG LAMK, Professores Multi-Unidade, Recreio, Staff Rateado';
COMMENT ON COLUMN payroll_entries.employee_name IS 'Nome do colaborador - pode não estar cadastrado no sistema';
COMMENT ON COLUMN incidents.is_confidential IS 'Incidentes confidenciais têm acesso restrito';
COMMENT ON COLUMN message_schedules.target_users IS 'Lista de usuários alvo ou critérios de seleção em JSON';