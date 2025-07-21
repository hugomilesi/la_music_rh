-- Migração para adicionar a relação entre schedule_events e employees

-- Verificar se a tabela schedule_events existe
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'schedule_events'
    ) THEN
        -- Verificar se a coluna employee_id existe na tabela schedule_events
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'schedule_events' 
            AND column_name = 'employee_id'
        ) THEN
            -- Verificar se a foreign key já existe
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints tc
                JOIN information_schema.constraint_column_usage ccu 
                ON tc.constraint_name = ccu.constraint_name
                WHERE tc.constraint_type = 'FOREIGN KEY' 
                AND tc.table_schema = 'public' 
                AND tc.table_name = 'schedule_events' 
                AND ccu.table_name = 'employees'
                AND ccu.column_name = 'id'
            ) THEN
                -- Adicionar a foreign key
                ALTER TABLE public.schedule_events 
                ADD CONSTRAINT schedule_events_employee_id_fkey 
                FOREIGN KEY (employee_id) 
                REFERENCES public.employees(id);
                
                RAISE NOTICE 'Foreign key entre schedule_events e employees adicionada';
            ELSE
                RAISE NOTICE 'Foreign key entre schedule_events e employees já existe';
            END IF;
        ELSE
            RAISE NOTICE 'Coluna employee_id não encontrada na tabela schedule_events';
        END IF;
    ELSE
        RAISE NOTICE 'Tabela schedule_events não encontrada';
    END IF;
END $$;

-- Atualizar o cache do esquema para o PostgREST
COMMENT ON TABLE public.schedule_events IS 'Eventos de agenda dos funcionários';

-- Notificar sobre a atualização do esquema
DO $$ 
BEGIN
    RAISE NOTICE 'Relação entre schedule_events e employees atualizada com sucesso';
END $$;