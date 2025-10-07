-- Adicionar campo colaborador_id para referência ao colaborador cadastrado
ALTER TABLE payroll_entries 
ADD COLUMN colaborador_id UUID REFERENCES colaboradores(id);

-- Criar índice para melhor performance
CREATE INDEX idx_payroll_entries_colaborador_id ON payroll_entries(colaborador_id);

-- Comentário para documentação
COMMENT ON COLUMN payroll_entries.colaborador_id IS 'Referência ao colaborador cadastrado no sistema (opcional para colaboradores não cadastrados)';