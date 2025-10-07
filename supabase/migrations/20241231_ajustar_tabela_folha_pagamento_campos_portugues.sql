-- Migração para ajustar tabela payroll_entries com campos em português
-- alinhados com o frontend

-- Primeiro, vamos renomear as colunas existentes para português
ALTER TABLE payroll_entries 
  RENAME COLUMN employee_name TO nome_colaborador;

ALTER TABLE payroll_entries 
  RENAME COLUMN employee_cpf TO cpf_colaborador;

ALTER TABLE payroll_entries 
  RENAME COLUMN unit TO unidade;

ALTER TABLE payroll_entries 
  RENAME COLUMN position TO funcao;

ALTER TABLE payroll_entries 
  RENAME COLUMN base_salary TO salario_base;

ALTER TABLE payroll_entries 
  RENAME COLUMN reference_month TO mes;

ALTER TABLE payroll_entries 
  RENAME COLUMN reference_year TO ano;

ALTER TABLE payroll_entries 
  RENAME COLUMN gross_salary TO salario_bruto;

ALTER TABLE payroll_entries 
  RENAME COLUMN net_salary TO salario_liquido;

ALTER TABLE payroll_entries 
  RENAME COLUMN other_deductions TO outros_descontos;

-- Adicionar campos específicos que o frontend envia
ALTER TABLE payroll_entries 
  ADD COLUMN IF NOT EXISTS classificacao TEXT,
  ADD COLUMN IF NOT EXISTS bonus NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comissao NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS passagem NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reembolso NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lojinha NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bistro NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS adiantamento NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS transport_voucher NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS salary_advance NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS banco TEXT,
  ADD COLUMN IF NOT EXISTS agencia TEXT,
  ADD COLUMN IF NOT EXISTS conta TEXT,
  ADD COLUMN IF NOT EXISTS pix TEXT,
  ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Remover colunas que não são mais necessárias
ALTER TABLE payroll_entries 
  DROP COLUMN IF EXISTS overtime_hours,
  DROP COLUMN IF EXISTS overtime_amount,
  DROP COLUMN IF EXISTS irrf;

-- Comentário sobre a estrutura
COMMENT ON TABLE payroll_entries IS 'Tabela de folha de pagamento com campos em português alinhados ao frontend';