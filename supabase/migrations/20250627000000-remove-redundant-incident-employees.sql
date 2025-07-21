-- Migração para remover a tabela incident_employees redundante
-- Esta tabela não está sendo usada no código e duplica funcionalidade
-- já que a tabela incidents já tem relacionamento direto com employees

-- Verificar se a tabela incident_employees existe antes de removê-la
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'incident_employees'
    ) THEN
        -- Remover a tabela incident_employees
        DROP TABLE public.incident_employees CASCADE;
        RAISE NOTICE 'Tabela incident_employees removida com sucesso';
    ELSE
        RAISE NOTICE 'Tabela incident_employees não existe';
    END IF;
END $$;