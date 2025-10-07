-- Remover a restrição existente que está causando conflito
ALTER TABLE payroll_entries DROP CONSTRAINT IF EXISTS payroll_entries_unit_check;

-- Adicionar nova restrição com as unidades corretas para folha de pagamento
ALTER TABLE payroll_entries 
ADD CONSTRAINT payroll_entries_unit_check 
CHECK (unidade IN ('Barra', 'CG EMLA', 'CG LAMK', 'Professores Multi-Unidade', 'Recreio', 'Staff Rateado', 'Campo Grande'));

-- Comentário para documentação
COMMENT ON CONSTRAINT payroll_entries_unit_check ON payroll_entries IS 'Restrição de unidades válidas para folha de pagamento, incluindo Campo Grande que é mapeado para CG EMLA ou CG LAMK';