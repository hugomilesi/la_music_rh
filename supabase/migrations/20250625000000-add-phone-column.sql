-- Migração para adicionar a coluna 'phone' na tabela employees

-- Verificar se a coluna 'phone' não existe e adicioná-la
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'employees' 
        AND column_name = 'phone'
    ) THEN
        ALTER TABLE public.employees ADD COLUMN phone TEXT NOT NULL DEFAULT '';
        RAISE NOTICE 'Coluna "phone" adicionada';
    ELSE
        RAISE NOTICE 'Coluna "phone" já existe, nenhuma ação necessária';
    END IF;
END $$;

-- Atualizar o cache do esquema para o PostgREST
COMMENT ON TABLE public.employees IS 'Tabela de funcionários da LA Music';

-- Notificar sobre a atualização do esquema
DO $$ 
BEGIN
    RAISE NOTICE 'Esquema da tabela employees atualizado com sucesso';
END $$;