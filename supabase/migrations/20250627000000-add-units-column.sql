-- Adiciona a coluna 'units' à tabela 'employees' se ela não existir
DO $$
BEGIN
    -- Verifica se a tabela 'employees' existe
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'employees') THEN
        -- Verifica se a coluna 'units' não existe
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' 
                      AND table_name = 'employees' 
                      AND column_name = 'units') THEN
            -- Adiciona a coluna 'units'
            ALTER TABLE public.employees ADD COLUMN units TEXT;
            
            -- Adiciona comentário para o PostgREST
            COMMENT ON COLUMN public.employees.units IS 'Unidades às quais o funcionário está associado';
        END IF;
    END IF;
END
$$;