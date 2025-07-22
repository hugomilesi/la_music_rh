-- Create or update the payrolls table (ciclos da folha)
CREATE TABLE IF NOT EXISTS public.payrolls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2020),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'paid')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(month, year)
);

-- Enable RLS
ALTER TABLE public.payrolls ENABLE ROW LEVEL SECURITY;

-- Create policy for payrolls
CREATE POLICY "Allow all operations on payrolls" 
ON public.payrolls 
FOR ALL 
USING (true);

-- Update folha_pagamento to reference payrolls and add missing fields
ALTER TABLE public.folha_pagamento 
ADD COLUMN IF NOT EXISTS payroll_id UUID REFERENCES public.payrolls(id),
ADD COLUMN IF NOT EXISTS transport_voucher NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS salary_advance NUMERIC DEFAULT 0;

-- Create the comprehensive payroll view
CREATE OR REPLACE VIEW public.payroll_full_view AS
SELECT 
  fp.id,
  fp.payroll_id,
  fp.colaborador_id,
  e.name as collaborator_name,
  e.email as collaborator_email,
  e.phone as collaborator_phone,
  fp.classificacao,
  fp.funcao as role,
  fp.salario_base as base_salary,
  fp.bonus,
  fp.comissao as commission,
  fp.reembolso as reimbursement,
  fp.passagem as transport_voucher,
  fp.inss,
  fp.lojinha as store_expenses,
  fp.bistro as bistro_expenses,
  fp.adiantamento as salary_advance,
  fp.outros_descontos as other_discounts,
  fp.observacoes as notes,
  fp.status,
  p.month,
  p.year,
  p.status as payroll_status,
  -- Calculated totals
  (COALESCE(fp.salario_base, 0) + COALESCE(fp.bonus, 0) + COALESCE(fp.comissao, 0) + COALESCE(fp.reembolso, 0)) as total_earnings,
  (COALESCE(fp.inss, 0) + COALESCE(fp.passagem, 0) + COALESCE(fp.lojinha, 0) + COALESCE(fp.bistro, 0) + COALESCE(fp.adiantamento, 0) + COALESCE(fp.outros_descontos, 0)) as total_deductions,
  ((COALESCE(fp.salario_base, 0) + COALESCE(fp.bonus, 0) + COALESCE(fp.comissao, 0) + COALESCE(fp.reembolso, 0)) - 
   (COALESCE(fp.inss, 0) + COALESCE(fp.passagem, 0) + COALESCE(fp.lojinha, 0) + COALESCE(fp.bistro, 0) + COALESCE(fp.adiantamento, 0) + COALESCE(fp.outros_descontos, 0))) as net_total,
  fp.created_at,
  fp.updated_at
FROM public.folha_pagamento fp
LEFT JOIN public.employees e ON fp.colaborador_id = e.id
LEFT JOIN public.payrolls p ON fp.payroll_id = p.id;

-- Create allocation summary view
CREATE OR REPLACE VIEW public.payroll_allocation_summary AS
SELECT 
  fr.folha_pagamento_id,
  fp.colaborador_id,
  e.name as collaborator_name,
  STRING_AGG(
    CASE 
      WHEN fr.valor > 0 THEN u.nome
      ELSE NULL 
    END, 
    ' / ' 
    ORDER BY u.nome
  ) as unit_allocation_summary
FROM public.folha_rateio fr
JOIN public.folha_pagamento fp ON fr.folha_pagamento_id = fp.id
JOIN public.unidades u ON fr.unidade_id = u.id
LEFT JOIN public.employees e ON fp.colaborador_id = e.id
WHERE fr.valor > 0
GROUP BY fr.folha_pagamento_id, fp.colaborador_id, e.name;

-- Create trigger to update timestamps
CREATE OR REPLACE FUNCTION update_payrolls_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payrolls_updated_at
    BEFORE UPDATE ON public.payrolls
    FOR EACH ROW
    EXECUTE FUNCTION update_payrolls_updated_at();

-- Create function to auto-distribute allocation
CREATE OR REPLACE FUNCTION auto_distribute_allocation(
  payroll_entry_id UUID,
  target_units UUID[]
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  total_amount NUMERIC;
  amount_per_unit NUMERIC;
  unit_id UUID;
BEGIN
  -- Get total amount (base salary + bonus)
  SELECT (COALESCE(salario_base, 0) + COALESCE(bonus, 0))
  INTO total_amount
  FROM folha_pagamento
  WHERE id = payroll_entry_id;
  
  IF total_amount IS NULL OR total_amount = 0 THEN
    RETURN FALSE;
  END IF;
  
  -- Clear existing allocations
  DELETE FROM folha_rateio WHERE folha_pagamento_id = payroll_entry_id;
  
  -- Calculate amount per unit
  amount_per_unit := total_amount / array_length(target_units, 1);
  
  -- Insert new allocations
  FOREACH unit_id IN ARRAY target_units
  LOOP
    INSERT INTO folha_rateio (folha_pagamento_id, unidade_id, valor, percentual)
    VALUES (
      payroll_entry_id, 
      unit_id, 
      amount_per_unit,
      (amount_per_unit / total_amount) * 100
    );
  END LOOP;
  
  RETURN TRUE;
END;
$$;