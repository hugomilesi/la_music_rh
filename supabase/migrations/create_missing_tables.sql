-- Criação das tabelas ausentes: nps_responses e schedule_events
-- Data: 2024-12-30
-- Descrição: Corrigir erros PGRST205 no console.md

-- Tabela para respostas de pesquisas NPS
CREATE TABLE IF NOT EXISTS public.nps_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    survey_id UUID NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
    comment TEXT,
    response_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Comentário da tabela nps_responses
COMMENT ON TABLE public.nps_responses IS 'Respostas das pesquisas de NPS (Net Promoter Score)';
COMMENT ON COLUMN public.nps_responses.survey_id IS 'ID da pesquisa NPS relacionada';
COMMENT ON COLUMN public.nps_responses.user_id IS 'Usuário que respondeu a pesquisa';
COMMENT ON COLUMN public.nps_responses.score IS 'Pontuação NPS de 0 a 10';
COMMENT ON COLUMN public.nps_responses.comment IS 'Comentário opcional do usuário';
COMMENT ON COLUMN public.nps_responses.response_date IS 'Data da resposta';

-- Tabela para eventos de agenda
CREATE TABLE IF NOT EXISTS public.schedule_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    event_type TEXT DEFAULT 'meeting' CHECK (event_type IN ('meeting', 'appointment', 'reminder', 'task', 'vacation', 'training')),
    location TEXT,
    is_all_day BOOLEAN DEFAULT false,
    recurrence_pattern JSONB,
    attendees JSONB,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Comentário da tabela schedule_events
COMMENT ON TABLE public.schedule_events IS 'Eventos de agenda e calendário dos usuários';
COMMENT ON COLUMN public.schedule_events.title IS 'Título do evento';
COMMENT ON COLUMN public.schedule_events.description IS 'Descrição detalhada do evento';
COMMENT ON COLUMN public.schedule_events.start_date IS 'Data e hora de início do evento';
COMMENT ON COLUMN public.schedule_events.end_date IS 'Data e hora de fim do evento';
COMMENT ON COLUMN public.schedule_events.user_id IS 'Usuário proprietário do evento';
COMMENT ON COLUMN public.schedule_events.event_type IS 'Tipo do evento: meeting, appointment, reminder, task, vacation, training';
COMMENT ON COLUMN public.schedule_events.location IS 'Local do evento';
COMMENT ON COLUMN public.schedule_events.is_all_day IS 'Indica se é um evento de dia inteiro';
COMMENT ON COLUMN public.schedule_events.recurrence_pattern IS 'Padrão de recorrência em JSON';
COMMENT ON COLUMN public.schedule_events.attendees IS 'Lista de participantes em JSON';
COMMENT ON COLUMN public.schedule_events.status IS 'Status do evento: scheduled, confirmed, cancelled, completed';
COMMENT ON COLUMN public.schedule_events.priority IS 'Prioridade do evento: low, normal, high, urgent';

-- Habilitar RLS (Row Level Security) nas tabelas
ALTER TABLE public.nps_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_events ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para nps_responses
CREATE POLICY "nps_responses_select_policy" ON public.nps_responses
    FOR SELECT USING (
        auth.uid() IN (
            SELECT auth_user_id FROM public.users 
            WHERE role IN ('super_admin', 'admin')
        )
        OR user_id IN (
            SELECT id FROM public.users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "nps_responses_insert_policy" ON public.nps_responses
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM public.users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "nps_responses_update_policy" ON public.nps_responses
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT auth_user_id FROM public.users 
            WHERE role IN ('super_admin', 'admin')
        )
        OR user_id IN (
            SELECT id FROM public.users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "nps_responses_delete_policy" ON public.nps_responses
    FOR DELETE USING (
        auth.uid() IN (
            SELECT auth_user_id FROM public.users 
            WHERE role IN ('super_admin', 'admin')
        )
    );

-- Políticas RLS para schedule_events
CREATE POLICY "schedule_events_select_policy" ON public.schedule_events
    FOR SELECT USING (
        auth.uid() IN (
            SELECT auth_user_id FROM public.users 
            WHERE role IN ('super_admin', 'admin')
        )
        OR user_id IN (
            SELECT id FROM public.users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "schedule_events_insert_policy" ON public.schedule_events
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM public.users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "schedule_events_update_policy" ON public.schedule_events
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM public.users WHERE auth_user_id = auth.uid()
        )
        OR auth.uid() IN (
            SELECT auth_user_id FROM public.users 
            WHERE role IN ('super_admin', 'admin')
        )
    );

CREATE POLICY "schedule_events_delete_policy" ON public.schedule_events
    FOR DELETE USING (
        user_id IN (
            SELECT id FROM public.users WHERE auth_user_id = auth.uid()
        )
        OR auth.uid() IN (
            SELECT auth_user_id FROM public.users 
            WHERE role IN ('super_admin', 'admin')
        )
    );

-- Conceder permissões às roles anon e authenticated
GRANT SELECT ON public.nps_responses TO anon;
GRANT ALL PRIVILEGES ON public.nps_responses TO authenticated;

GRANT SELECT ON public.schedule_events TO anon;
GRANT ALL PRIVILEGES ON public.schedule_events TO authenticated;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_nps_responses_survey_id ON public.nps_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_nps_responses_user_id ON public.nps_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_nps_responses_score ON public.nps_responses(score);
CREATE INDEX IF NOT EXISTS idx_nps_responses_response_date ON public.nps_responses(response_date);

CREATE INDEX IF NOT EXISTS idx_schedule_events_user_id ON public.schedule_events(user_id);
CREATE INDEX IF NOT EXISTS idx_schedule_events_start_date ON public.schedule_events(start_date);
CREATE INDEX IF NOT EXISTS idx_schedule_events_end_date ON public.schedule_events(end_date);
CREATE INDEX IF NOT EXISTS idx_schedule_events_event_type ON public.schedule_events(event_type);
CREATE INDEX IF NOT EXISTS idx_schedule_events_status ON public.schedule_events(status);

-- Triggers para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_nps_responses_updated_at
    BEFORE UPDATE ON public.nps_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedule_events_updated_at
    BEFORE UPDATE ON public.schedule_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();