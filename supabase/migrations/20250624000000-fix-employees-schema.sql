-- Migração para corrigir discrepâncias no esquema da tabela employees

-- Verificar se a coluna 'nome' existe e renomeá-la para 'name'
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'employees' 
        AND column_name = 'nome'
    ) THEN
        ALTER TABLE public.employees RENAME COLUMN nome TO name;
        RAISE NOTICE 'Coluna "nome" renomeada para "name"';
    ELSE
        RAISE NOTICE 'Coluna "nome" não encontrada, nenhuma ação necessária';
    END IF;
END $$;

-- Verificar se a coluna 'department' não existe e adicioná-la
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'employees' 
        AND column_name = 'department'
    ) THEN
        ALTER TABLE public.employees ADD COLUMN department TEXT NOT NULL DEFAULT 'Não especificado';
        RAISE NOTICE 'Coluna "department" adicionada';
    ELSE
        RAISE NOTICE 'Coluna "department" já existe, nenhuma ação necessária';
    END IF;
END $$;

-- Atualizar o cache do esquema para o PostgREST
COMMENT ON TABLE public.employees IS 'Tabela de funcionários da LA Music';

-- Notificar sobre a atualização do esquema
DO $$ 
BEGIN
    RAISE NOTICE 'Esquema da tabela employees atualizado com sucesso';
END $$;