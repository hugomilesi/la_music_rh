-- Migração para corrigir discrepâncias no esquema da tabela vacation_requests
-- Adicionar campos faltantes: rejection_reason, type, reason, request_date, approved_date

DO $$ 
BEGIN
    -- Verificar se a coluna 'rejection_reason' existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vacation_requests' 
        AND column_name = 'rejection_reason'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE vacation_requests ADD COLUMN rejection_reason TEXT;
        RAISE NOTICE 'Coluna rejection_reason adicionada à tabela vacation_requests';
    ELSE
        RAISE NOTICE 'Coluna rejection_reason já existe na tabela vacation_requests';
    END IF;

    -- Verificar se a coluna 'type' existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vacation_requests' 
        AND column_name = 'type'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE vacation_requests ADD COLUMN type TEXT NOT NULL DEFAULT 'vacation' 
        CHECK (type IN ('vacation', 'medical', 'personal', 'maternity', 'paternity'));
        RAISE NOTICE 'Coluna type adicionada à tabela vacation_requests';
    ELSE
        RAISE NOTICE 'Coluna type já existe na tabela vacation_requests';
    END IF;

    -- Verificar se a coluna 'reason' existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vacation_requests' 
        AND column_name = 'reason'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE vacation_requests ADD COLUMN reason TEXT NOT NULL DEFAULT 'Férias';
        RAISE NOTICE 'Coluna reason adicionada à tabela vacation_requests';
    ELSE
        RAISE NOTICE 'Coluna reason já existe na tabela vacation_requests';
    END IF;

    -- Verificar se a coluna 'request_date' existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vacation_requests' 
        AND column_name = 'request_date'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE vacation_requests ADD COLUMN request_date DATE NOT NULL DEFAULT CURRENT_DATE;
        RAISE NOTICE 'Coluna request_date adicionada à tabela vacation_requests';
    ELSE
        RAISE NOTICE 'Coluna request_date já existe na tabela vacation_requests';
    END IF;

    -- Verificar se a coluna 'approved_date' existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vacation_requests' 
        AND column_name = 'approved_date'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE vacation_requests ADD COLUMN approved_date DATE;
        RAISE NOTICE 'Coluna approved_date adicionada à tabela vacation_requests';
    ELSE
        RAISE NOTICE 'Coluna approved_date já existe na tabela vacation_requests';
    END IF;

    -- Verificar se a coluna 'days' existe (mapear para days_requested)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vacation_requests' 
        AND column_name = 'days'
        AND table_schema = 'public'
    ) THEN
        -- Se days_requested existe mas days não, criar um alias/view ou renomear
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'vacation_requests' 
            AND column_name = 'days_requested'
            AND table_schema = 'public'
        ) THEN
            ALTER TABLE vacation_requests RENAME COLUMN days_requested TO days;
            RAISE NOTICE 'Coluna days_requested renomeada para days na tabela vacation_requests';
        ELSE
            ALTER TABLE vacation_requests ADD COLUMN days INTEGER NOT NULL DEFAULT 1;
            RAISE NOTICE 'Coluna days adicionada à tabela vacation_requests';
        END IF;
    ELSE
        RAISE NOTICE 'Coluna days já existe na tabela vacation_requests';
    END IF;

    -- Verificar se a coluna 'notes' deve ser renomeada para 'reason' se reason não existir
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vacation_requests' 
        AND column_name = 'notes'
        AND table_schema = 'public'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vacation_requests' 
        AND column_name = 'reason'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE vacation_requests RENAME COLUMN notes TO reason;
        RAISE NOTICE 'Coluna notes renomeada para reason na tabela vacation_requests';
    END IF;

END $$;

-- Atualizar dados existentes se necessário
UPDATE vacation_requests 
SET 
    type = COALESCE(type, 'vacation'),
    reason = COALESCE(reason, 'Férias'),
    request_date = COALESCE(request_date, created_at::date)
WHERE type IS NULL OR reason IS NULL OR request_date IS NULL;

-- Adicionar constraint NOT NULL após atualizar os dados
DO $$ 
BEGIN
    -- Tornar reason NOT NULL se não for
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vacation_requests' 
        AND column_name = 'reason'
        AND is_nullable = 'YES'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE vacation_requests ALTER COLUMN reason SET NOT NULL;
        RAISE NOTICE 'Constraint NOT NULL adicionada à coluna reason';
    END IF;

    -- Tornar type NOT NULL se não for
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vacation_requests' 
        AND column_name = 'type'
        AND is_nullable = 'YES'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE vacation_requests ALTER COLUMN type SET NOT NULL;
        RAISE NOTICE 'Constraint NOT NULL adicionada à coluna type';
    END IF;
END $$;