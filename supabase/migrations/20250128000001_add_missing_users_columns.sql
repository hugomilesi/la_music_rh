-- Adicionar colunas ausentes na tabela users para corrigir erro de carregamento
-- Erro: column users.position does not exist

-- Adicionar coluna position
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS position TEXT DEFAULT 'Não informado';

-- Adicionar coluna department (como texto, já que department_id existe)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'Não informado';

-- Adicionar coluna phone
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Adicionar coluna status
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo'));

-- Adicionar coluna last_login
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Adicionar coluna preferences (JSONB para flexibilidade)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- Adicionar coluna deleted_at para soft delete
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Atualizar dados existentes com valores padrão
UPDATE public.users 
SET 
  position = COALESCE(position, 'Não informado'),
  department = COALESCE(department, 'Não informado'),
  status = COALESCE(status, 'ativo'),
  preferences = COALESCE(preferences, '{}'::jsonb)
WHERE position IS NULL OR department IS NULL OR status IS NULL OR preferences IS NULL;

-- Comentários para documentação
COMMENT ON COLUMN public.users.position IS 'Cargo/posição do usuário na empresa';
COMMENT ON COLUMN public.users.department IS 'Departamento do usuário (texto)';
COMMENT ON COLUMN public.users.phone IS 'Telefone de contato do usuário';
COMMENT ON COLUMN public.users.status IS 'Status do usuário: ativo ou inativo';
COMMENT ON COLUMN public.users.last_login IS 'Data e hora do último login';
COMMENT ON COLUMN public.users.preferences IS 'Preferências do usuário em formato JSON';
COMMENT ON COLUMN public.users.deleted_at IS 'Data de exclusão lógica (soft delete)';

-- Migração concluída: Colunas ausentes adicionadas à tabela users
-- Corrige erro: column users.position does not exist