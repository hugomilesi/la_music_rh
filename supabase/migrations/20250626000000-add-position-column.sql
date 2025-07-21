-- Migração para adicionar a coluna 'position' na tabela employees

-- Verificar se a coluna 'position' não existe e adicioná-la
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'employees' 
        AND column_name = 'position'
    ) THEN
        ALTER TABLE public.employees ADD COLUMN position TEXT NOT NULL DEFAULT 'Não especificado';
        RAISE NOTICE 'Coluna "position" adicionada';
    ELSE
        RAISE NOTICE 'Coluna "position" já existe, nenhuma ação necessária';
    END IF;
END $$;

-- Atualizar o cache do esquema para o PostgREST
COMMENT ON TABLE public.employees IS 'Tabela de funcionários da LA Music';

-- Notificar sobre a atualização do esquema
DO $$ 
BEGIN
    RAISE NOTICE 'Esquema da tabela employees atualizado com sucesso';
END $$;