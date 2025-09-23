-- Criação das tabelas ausentes identificadas nos erros do console.md

-- Tabela employee_benefits: relaciona funcionários com benefícios
CREATE TABLE IF NOT EXISTS public.employee_benefits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    benefit_id UUID NOT NULL REFERENCES public.benefits(id) ON DELETE CASCADE,
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    termination_date DATE,
    premium_amount NUMERIC(10,2) DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Índices para performance
    UNIQUE(user_id, benefit_id)
);

-- Tabela vacation_balances: controla saldos de férias dos funcionários
CREATE TABLE IF NOT EXISTS public.vacation_balances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    year INTEGER NOT NULL CHECK (year >= 2020),
    total_days INTEGER NOT NULL DEFAULT 30,
    used_days INTEGER NOT NULL DEFAULT 0,
    remaining_days INTEGER GENERATED ALWAYS AS (total_days - used_days) STORED,
    accrued_days NUMERIC(5,2) DEFAULT 0,
    carry_over_days INTEGER DEFAULT 0,
    expires_at DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Índices para performance
    UNIQUE(user_id, year),
    CHECK (used_days >= 0),
    CHECK (used_days <= total_days)
);

-- Índices para otimização de consultas
CREATE INDEX IF NOT EXISTS idx_employee_benefits_user_id ON public.employee_benefits(user_id);
CREATE INDEX IF NOT EXISTS idx_employee_benefits_benefit_id ON public.employee_benefits(benefit_id);
CREATE INDEX IF NOT EXISTS idx_employee_benefits_status ON public.employee_benefits(status);

CREATE INDEX IF NOT EXISTS idx_vacation_balances_user_id ON public.vacation_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_vacation_balances_year ON public.vacation_balances(year);
CREATE INDEX IF NOT EXISTS idx_vacation_balances_user_year ON public.vacation_balances(user_id, year);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.employee_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacation_balances ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para employee_benefits
CREATE POLICY "employee_benefits_select_policy" ON public.employee_benefits
    FOR SELECT USING (
        auth.uid() IN (
            SELECT auth_user_id FROM public.users 
            WHERE role IN ('super_admin', 'admin', 'gestor_rh')
        )
        OR user_id = (
            SELECT id FROM public.users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "employee_benefits_insert_policy" ON public.employee_benefits
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT auth_user_id FROM public.users 
            WHERE role IN ('super_admin', 'admin', 'gestor_rh')
        )
    );

CREATE POLICY "employee_benefits_update_policy" ON public.employee_benefits
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT auth_user_id FROM public.users 
            WHERE role IN ('super_admin', 'admin', 'gestor_rh')
        )
    );

CREATE POLICY "employee_benefits_delete_policy" ON public.employee_benefits
    FOR DELETE USING (
        auth.uid() IN (
            SELECT auth_user_id FROM public.users 
            WHERE role IN ('super_admin', 'admin', 'gestor_rh')
        )
    );

-- Políticas RLS para vacation_balances
CREATE POLICY "vacation_balances_select_policy" ON public.vacation_balances
    FOR SELECT USING (
        auth.uid() IN (
            SELECT auth_user_id FROM public.users 
            WHERE role IN ('super_admin', 'admin', 'gestor_rh')
        )
        OR user_id = (
            SELECT id FROM public.users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "vacation_balances_insert_policy" ON public.vacation_balances
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT auth_user_id FROM public.users 
            WHERE role IN ('super_admin', 'admin', 'gestor_rh')
        )
    );

CREATE POLICY "vacation_balances_update_policy" ON public.vacation_balances
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT auth_user_id FROM public.users 
            WHERE role IN ('super_admin', 'admin', 'gestor_rh')
        )
    );

CREATE POLICY "vacation_balances_delete_policy" ON public.vacation_balances
    FOR DELETE USING (
        auth.uid() IN (
            SELECT auth_user_id FROM public.users 
            WHERE role IN ('super_admin', 'admin', 'gestor_rh')
        )
    );

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_employee_benefits_updated_at
    BEFORE UPDATE ON public.employee_benefits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vacation_balances_updated_at
    BEFORE UPDATE ON public.vacation_balances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários nas tabelas
COMMENT ON TABLE public.employee_benefits IS 'Relacionamento entre funcionários e benefícios com detalhes de inscrição';
COMMENT ON TABLE public.vacation_balances IS 'Controle de saldos de férias dos funcionários por ano';

-- Dados iniciais para vacation_balances (saldo padrão para usuários existentes)
INSERT INTO public.vacation_balances (user_id, year, total_days, used_days)
SELECT 
    id as user_id,
    EXTRACT(YEAR FROM CURRENT_DATE) as year,
    30 as total_days,
    0 as used_days
FROM public.users 
WHERE is_active = true
ON CONFLICT (user_id, year) DO NOTHING;

-- Conceder permissões às roles
GRANT ALL PRIVILEGES ON public.employee_benefits TO authenticated;
GRANT ALL PRIVILEGES ON public.vacation_balances TO authenticated;
GRANT SELECT ON public.employee_benefits TO anon;
GRANT SELECT ON public.vacation_balances TO anon;