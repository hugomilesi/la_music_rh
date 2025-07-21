-- Add start_date column to employees table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'employees'
        AND column_name = 'start_date'
    ) THEN
        ALTER TABLE public.employees
        ADD COLUMN start_date DATE;
        
        -- Add comment for PostgREST
        COMMENT ON COLUMN public.employees.start_date IS 'Data de início do funcionário';
    END IF;
END
$$;

-- Copy data from data_admissao to start_date
UPDATE public.employees
SET start_date = data_admissao
WHERE data_admissao IS NOT NULL AND start_date IS NULL;