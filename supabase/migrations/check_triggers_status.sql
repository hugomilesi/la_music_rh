-- Verificar se existem triggers ativos na tabela documents
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'documents';

-- Verificar se as funções de trigger existem
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_name LIKE '%sync_checklist%';

-- Verificar estrutura da tabela employee_document_checklist
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'employee_document_checklist'
ORDER BY ordinal_position;