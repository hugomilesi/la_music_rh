-- Cria a tabela 'schedule_events' se ela não existir
DO $$
BEGIN
    -- Verifica se a tabela 'schedule_events' não existe
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'schedule_events') THEN
        -- Cria a tabela 'schedule_events'
        CREATE TABLE public.schedule_events (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            title TEXT NOT NULL,
            employee_id UUID REFERENCES public.users(auth_user_id),
            unit TEXT,
            event_date DATE NOT NULL,
            start_time TIME NOT NULL,
            end_time TIME NOT NULL,
            type TEXT,
            description TEXT,
            location TEXT,
            email_alert BOOLEAN DEFAULT FALSE,
            whatsapp_alert BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Adiciona comentários para o PostgREST
        COMMENT ON TABLE public.schedule_events IS 'Eventos de agenda dos funcionários';
        COMMENT ON COLUMN public.schedule_events.id IS 'ID único do evento';
        COMMENT ON COLUMN public.schedule_events.title IS 'Título do evento';
        COMMENT ON COLUMN public.schedule_events.employee_id IS 'ID do funcionário associado ao evento';
        COMMENT ON COLUMN public.schedule_events.unit IS 'Unidade onde o evento ocorrerá';
        COMMENT ON COLUMN public.schedule_events.event_date IS 'Data do evento';
        COMMENT ON COLUMN public.schedule_events.start_time IS 'Hora de início do evento';
        COMMENT ON COLUMN public.schedule_events.end_time IS 'Hora de término do evento';
        COMMENT ON COLUMN public.schedule_events.type IS 'Tipo do evento';
        COMMENT ON COLUMN public.schedule_events.description IS 'Descrição do evento';
        COMMENT ON COLUMN public.schedule_events.location IS 'Local do evento';
        COMMENT ON COLUMN public.schedule_events.email_alert IS 'Indica se deve enviar alerta por email';
        COMMENT ON COLUMN public.schedule_events.whatsapp_alert IS 'Indica se deve enviar alerta por WhatsApp';
        COMMENT ON COLUMN public.schedule_events.created_at IS 'Data de criação do registro';
        COMMENT ON COLUMN public.schedule_events.updated_at IS 'Data da última atualização do registro';

        -- Adiciona políticas RLS (Row Level Security)
        ALTER TABLE public.schedule_events ENABLE ROW LEVEL SECURITY;

        -- Cria política para permitir acesso a todos os usuários autenticados
        CREATE POLICY "Permitir acesso a todos os usuários autenticados" 
        ON public.schedule_events FOR ALL 
        TO authenticated 
        USING (true) 
        WITH CHECK (true);
    END IF;
END
$$;