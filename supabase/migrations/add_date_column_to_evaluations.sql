-- Adicionar coluna 'date' à tabela evaluations
-- Esta coluna é necessária para o frontend ordenar as avaliações

ALTER TABLE evaluations 
ADD COLUMN date DATE DEFAULT CURRENT_DATE;

-- Atualizar registros existentes com uma data baseada no created_at
UPDATE evaluations 
SET date = created_at::date 
WHERE date IS NULL;

-- Tornar a coluna NOT NULL após popular os dados existentes
ALTER TABLE evaluations 
ALTER COLUMN date SET NOT NULL;

-- Adicionar comentário para documentar a coluna
COMMENT ON COLUMN evaluations.date IS 'Data da avaliação para ordenação e filtros';