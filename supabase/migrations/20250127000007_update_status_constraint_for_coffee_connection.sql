-- Atualizar constraint de status para incluir 'scheduled' para Coffee Connection
-- A constraint atual só permite: 'draft', 'submitted', 'reviewed', 'finalized'
-- Mas Coffee Connection precisa do status 'scheduled'

-- Remover constraint atual
ALTER TABLE evaluations DROP CONSTRAINT IF EXISTS evaluations_status_check;

-- Criar nova constraint que inclui 'scheduled'
ALTER TABLE evaluations ADD CONSTRAINT evaluations_status_check 
CHECK (status = ANY (ARRAY['draft'::text, 'submitted'::text, 'reviewed'::text, 'finalized'::text, 'scheduled'::text]));

-- Comentário explicativo
COMMENT ON CONSTRAINT evaluations_status_check ON evaluations IS 'Status constraint atualizada para incluir scheduled para Coffee Connection';