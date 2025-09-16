-- Criação do sistema unificado de agendamento de mensagens
-- Suporta notificações, NPS, WhatsApp e email

-- 1. Criar tabela unificada de agendamentos
CREATE TABLE IF NOT EXISTS public.message_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('notification', 'nps', 'whatsapp', 'email')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content JSONB NOT NULL,
    target_users JSONB NOT NULL, -- Array de user IDs ou critérios de seleção
    schedule_type VARCHAR(20) NOT NULL CHECK (schedule_type IN ('immediate', 'recurring', 'conditional')),
    scheduled_for TIMESTAMP WITH TIME ZONE,
    recurrence_pattern JSONB, -- Para agendamentos recorrentes
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    last_executed_at TIMESTAMP WITH TIME ZONE,
    next_execution_at TIMESTAMP WITH TIME ZONE,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    execution_log JSONB DEFAULT '[]',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_message_schedules_status ON public.message_schedules(status);
CREATE INDEX IF NOT EXISTS idx_message_schedules_type ON public.message_schedules(type);
CREATE INDEX IF NOT EXISTS idx_message_schedules_next_execution ON public.message_schedules(next_execution_at);
CREATE INDEX IF NOT EXISTS idx_message_schedules_scheduled_for ON public.message_schedules(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_message_schedules_created_by ON public.message_schedules(created_by);
CREATE INDEX IF NOT EXISTS idx_message_schedules_created_at ON public.message_schedules(created_at);

-- 3. Criar tabela de logs de execução
CREATE TABLE IF NOT EXISTS public.message_schedule_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID REFERENCES public.message_schedules(id) ON DELETE CASCADE,
    log_type VARCHAR(20) NOT NULL CHECK (log_type IN ('info', 'warning', 'error', 'success', 'system_alert')),
    message TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Índices para logs
CREATE INDEX IF NOT EXISTS idx_message_schedule_logs_schedule_id ON public.message_schedule_logs(schedule_id);
CREATE INDEX IF NOT EXISTS idx_message_schedule_logs_created_at ON public.message_schedule_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_message_schedule_logs_log_type ON public.message_schedule_logs(log_type);

-- 5. Criar tabela para configurações de alertas do sistema
CREATE TABLE IF NOT EXISTS public.system_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type TEXT NOT NULL, -- 'job_failure', 'high_error_rate', 'system_health'
    threshold_value NUMERIC,
    notification_channels JSONB, -- emails, webhooks, etc.
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_message_schedules_updated_at
    BEFORE UPDATE ON public.message_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_alerts_updated_at
    BEFORE UPDATE ON public.system_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Habilitar RLS
ALTER TABLE public.message_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_schedule_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;

-- 8. Comentários para documentação
COMMENT ON TABLE public.message_schedules IS 'Tabela unificada para agendamento de mensagens (notificações, NPS, WhatsApp, email)';
COMMENT ON COLUMN public.message_schedules.content IS 'Conteúdo da mensagem em formato JSON flexível';
COMMENT ON COLUMN public.message_schedules.target_users IS 'Lista de usuários alvo ou critérios de seleção';
COMMENT ON COLUMN public.message_schedules.recurrence_pattern IS 'Padrão de recorrência para agendamentos repetitivos';
COMMENT ON COLUMN public.message_schedules.execution_log IS 'Log de execuções e tentativas';

COMMENT ON TABLE public.message_schedule_logs IS 'Logs detalhados de execução dos agendamentos';
COMMENT ON TABLE public.system_alerts IS 'Configurações de alertas do sistema de agendamento';