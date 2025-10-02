-- Migração: Limpar dados órfãos e corrigir foreign key da tabela employee_document_checklist
-- Data: 2025-01-29
-- Descrição: Remover registros órfãos e alterar a foreign key employee_id para referenciar colaboradores

-- Primeiro, vamos identificar e remover registros órfãos
-- (employee_id que existem em employee_document_checklist mas não em colaboradores)
DELETE FROM public.employee_document_checklist 
WHERE employee_id NOT IN (
    SELECT id FROM public.colaboradores
);

-- Remover a constraint existente que referencia users
ALTER TABLE public.employee_document_checklist 
DROP CONSTRAINT IF EXISTS employee_document_checklist_employee_id_fkey;

-- Adicionar nova constraint que referencia colaboradores
ALTER TABLE public.employee_document_checklist 
ADD CONSTRAINT employee_document_checklist_employee_id_fkey 
FOREIGN KEY (employee_id) REFERENCES public.colaboradores(id) ON DELETE CASCADE;

-- Adicionar comentário explicativo
COMMENT ON CONSTRAINT employee_document_checklist_employee_id_fkey ON public.employee_document_checklist 
IS 'Foreign key que referencia a tabela colaboradores ao invés de users';

-- Migração aplicada com sucesso
-- Dados órfãos removidos e foreign key employee_id agora referencia corretamente a tabela colaboradores