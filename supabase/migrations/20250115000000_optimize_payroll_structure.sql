-- Otimização da estrutura da folha de pagamento
-- Remove duplicações e inconsistências

-- 1. Remover a view payroll_full_view que não está sendo usada
DROP VIEW IF EXISTS public.payroll_full_view;
DROP VIEW IF EXISTS public.payroll_allocation_summary;

-- 2. Remover campos duplicados da tabela folha_pagamento
-- Estes dados devem vir da tabela users através do colaborador_id
ALTER TABLE public.folha_pagamento 
DROP COLUMN IF EXISTS nome_funcionario,
DROP COLUMN IF EXISTS cpf_funcionario,
DROP COLUMN IF EXISTS unidade,
DROP COLUMN IF EXISTS departamento,
DROP COLUMN IF EXISTS banco,
DROP COLUMN IF EXISTS agencia,
DROP COLUMN IF EXISTS conta,
DROP COLUMN IF EXISTS pix;

-- 3. Garantir que colaborador_id seja obrigatório e tenha índice
ALTER TABLE public.folha_pagamento 
ALTER COLUMN colaborador_id SET NOT NULL;

-- 4. Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_folha_pagamento_colaborador_id 
ON public.folha_pagamento(colaborador_id);

CREATE INDEX IF NOT EXISTS idx_folha_pagamento_mes_ano 
ON public.folha_pagamento(mes, ano);

-- 5. Adicionar constraint para garantir integridade referencial
ALTER TABLE public.folha_pagamento 
ADD CONSTRAINT fk_folha_pagamento_colaborador 
FOREIGN KEY (colaborador_id) REFERENCES public.users(auth_user_id) 
ON DELETE CASCADE;

-- 6. Comentários para documentação
COMMENT ON TABLE public.folha_pagamento IS 'Tabela otimizada da folha de pagamento - dados pessoais vêm da tabela users';
COMMENT ON COLUMN public.folha_pagamento.colaborador_id IS 'Referência para users.auth_user_id - dados pessoais vêm de lá';