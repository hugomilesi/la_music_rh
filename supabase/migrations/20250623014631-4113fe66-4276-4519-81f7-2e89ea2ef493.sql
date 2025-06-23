
-- Tabela de funcionários (já existe, mas vamos verificar se está completa)
-- A tabela employees já existe, vamos adicionar campos que podem estar faltando

-- Tabela de documentos (já existe, mas vamos verificar relacionamentos)
-- Adicionar foreign key para employees se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'documents_employee_id_fkey' 
        AND table_name = 'documents'
    ) THEN
        ALTER TABLE documents 
        ADD CONSTRAINT documents_employee_id_fkey 
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Tabela de avaliações
CREATE TABLE IF NOT EXISTS evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    evaluator_id UUID REFERENCES employees(id),
    type TEXT NOT NULL CHECK (type IN ('avaliacao_360', 'auto_avaliacao', 'avaliacao_gestor', 'coffee_connection')),
    period TEXT NOT NULL,
    score DECIMAL(3,2) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    comments TEXT,
    meeting_date DATE,
    meeting_time TIME,
    location TEXT,
    topics TEXT[],
    follow_up_actions TEXT,
    confidential BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de férias
CREATE TABLE IF NOT EXISTS vacation_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days INTEGER NOT NULL,
    reason TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'vacation' CHECK (type IN ('vacation', 'medical', 'personal', 'maternity', 'paternity')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    request_date DATE NOT NULL DEFAULT CURRENT_DATE,
    approved_by UUID REFERENCES employees(id),
    approved_date DATE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de saldo de férias
CREATE TABLE IF NOT EXISTS vacation_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE UNIQUE,
    total_days INTEGER NOT NULL DEFAULT 30,
    used_days INTEGER NOT NULL DEFAULT 0,
    remaining_days INTEGER NOT NULL DEFAULT 30,
    yearly_allowance INTEGER NOT NULL DEFAULT 30,
    expiration_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 year'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS schedule_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    unit TEXT NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('plantao', 'avaliacao', 'reuniao', 'folga', 'outro')),
    description TEXT,
    location TEXT,
    email_alert BOOLEAN DEFAULT false,
    whatsapp_alert BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de incidentes
CREATE TABLE IF NOT EXISTS incidents (
    id SERIAL PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('leve', 'moderado', 'grave')),
    description TEXT NOT NULL,
    incident_date DATE NOT NULL,
    reporter_id UUID REFERENCES employees(id),
    status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'resolvido', 'arquivado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de pesquisas NPS
CREATE TABLE IF NOT EXISTS nps_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    survey_type TEXT NOT NULL DEFAULT 'nps' CHECK (survey_type IN ('nps', 'satisfaction')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    target_employees UUID[],
    target_departments TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de respostas NPS
CREATE TABLE IF NOT EXISTS nps_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES nps_surveys(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
    comment TEXT,
    category TEXT NOT NULL,
    department TEXT,
    response_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(survey_id, employee_id)
);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('lembrete', 'aniversario', 'aviso', 'comunicado', 'personalizada')),
    recipients UUID[] NOT NULL,
    recipient_names TEXT[] NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp', 'ambos')),
    status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'programado', 'enviado', 'entregue', 'lido', 'falhado')),
    scheduled_for TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    template_id TEXT,
    metadata JSONB,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Adicionar triggers para updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers para todas as tabelas que têm updated_at
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
        AND table_name NOT IN ('employees', 'documents') -- Estas já podem ter triggers
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS set_timestamp ON %I', t);
        EXECUTE format('CREATE TRIGGER set_timestamp 
                       BEFORE UPDATE ON %I 
                       FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp()', t);
    END LOOP;
END $$;

-- Habilitar Row Level Security (RLS) para todas as tabelas
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacation_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS básicas (permitir tudo por enquanto, será refinado depois)
CREATE POLICY "Allow all operations" ON evaluations FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON vacation_requests FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON vacation_balances FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON schedule_events FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON incidents FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON nps_surveys FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON nps_responses FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON notifications FOR ALL USING (true);

-- Inserir dados iniciais de exemplo (baseados nos contextos existentes)
INSERT INTO vacation_balances (employee_id, total_days, used_days, remaining_days)
SELECT id, 30, 0, 30 FROM employees
ON CONFLICT (employee_id) DO NOTHING;
