-- Criar tabela criterion_evaluations para armazenar avaliações de critérios
CREATE TABLE IF NOT EXISTS criterion_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  criterion_id UUID NOT NULL REFERENCES recognition_criteria(id) ON DELETE CASCADE,
  evaluator_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  stars_awarded INTEGER NOT NULL DEFAULT 0 CHECK (stars_awarded >= 0),
  evaluation_period TEXT NOT NULL,
  evaluation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint para evitar duplicatas
  UNIQUE(employee_id, criterion_id, evaluation_period)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_criterion_evaluations_employee_id ON criterion_evaluations(employee_id);
CREATE INDEX IF NOT EXISTS idx_criterion_evaluations_criterion_id ON criterion_evaluations(criterion_id);
CREATE INDEX IF NOT EXISTS idx_criterion_evaluations_evaluator_id ON criterion_evaluations(evaluator_id);
CREATE INDEX IF NOT EXISTS idx_criterion_evaluations_period ON criterion_evaluations(evaluation_period);
CREATE INDEX IF NOT EXISTS idx_criterion_evaluations_date ON criterion_evaluations(evaluation_date);

-- RLS (Row Level Security)
ALTER TABLE criterion_evaluations ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura para usuários autenticados
CREATE POLICY "criterion_evaluations_select_policy" ON criterion_evaluations
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir inserção para usuários autenticados
CREATE POLICY "criterion_evaluations_insert_policy" ON criterion_evaluations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir atualização para usuários autenticados
CREATE POLICY "criterion_evaluations_update_policy" ON criterion_evaluations
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para permitir exclusão para usuários autenticados
CREATE POLICY "criterion_evaluations_delete_policy" ON criterion_evaluations
  FOR DELETE USING (auth.role() = 'authenticated');

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_criterion_evaluations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER criterion_evaluations_updated_at_trigger
  BEFORE UPDATE ON criterion_evaluations
  FOR EACH ROW
  EXECUTE FUNCTION update_criterion_evaluations_updated_at();