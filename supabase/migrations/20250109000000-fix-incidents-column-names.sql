-- Migração para corrigir os nomes das colunas da tabela incidents
-- Renomear colunas para os nomes corretos conforme esperado pelo código

-- Verificar se as colunas antigas existem antes de renomear
DO $$
BEGIN
    -- Renomear tipo para type se existir
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'incidents' 
        AND column_name = 'tipo' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.incidents RENAME COLUMN tipo TO type;
        RAISE NOTICE 'Coluna tipo renomeada para type';
    END IF;

    -- Renomear gravidade para severity se existir
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'incidents' 
        AND column_name = 'gravidade' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.incidents RENAME COLUMN gravidade TO severity;
        RAISE NOTICE 'Coluna gravidade renomeada para severity';
    END IF;

    -- Renomear descricao para description se existir
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'incidents' 
        AND column_name = 'descricao' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.incidents RENAME COLUMN descricao TO description;
        RAISE NOTICE 'Coluna descricao renomeada para description';
    END IF;

    -- Renomear data_ocorrencia para incident_date se existir
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'incidents' 
        AND column_name = 'data_ocorrencia' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.incidents RENAME COLUMN data_ocorrencia TO incident_date;
        RAISE NOTICE 'Coluna data_ocorrencia renomeada para incident_date';
    END IF;

    -- Renomear responsavel_id para employee_id se existir
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'incidents' 
        AND column_name = 'responsavel_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.incidents RENAME COLUMN responsavel_id TO employee_id;
        RAISE NOTICE 'Coluna responsavel_id renomeada para employee_id';
    END IF;

    -- Verificar se a foreign key para users existe e recriar se necessário
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'incidents'
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'employee_id'
        AND kcu.referenced_table_name = 'users'
    ) THEN
        -- Adicionar foreign key constraint se não existir
        ALTER TABLE public.incidents 
        ADD CONSTRAINT incidents_employee_id_fkey 
        FOREIGN KEY (employee_id) REFERENCES public.users(auth_user_id) ON DELETE CASCADE;
        RAISE NOTICE 'Foreign key constraint adicionada para employee_id';
    END IF;

    -- Verificar se a foreign key para reporter_id existe e recriar se necessário
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'incidents'
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'reporter_id'
        AND kcu.referenced_table_name = 'users'
    ) THEN
        -- Adicionar foreign key constraint se não existir
        ALTER TABLE public.incidents 
        ADD CONSTRAINT incidents_reporter_id_fkey 
        FOREIGN KEY (reporter_id) REFERENCES public.users(auth_user_id);
        RAISE NOTICE 'Foreign key constraint adicionada para reporter_id';
    END IF;

END $$;

-- Verificar a estrutura final da tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'incidents' AND table_schema = 'public'
ORDER BY ordinal_position;