-- Verificar triggers existentes na tabela documents
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
WHERE routine_name LIKE '%sync%' OR routine_name LIKE '%document%';

-- Testar inserção de documento para verificar se trigger funciona
INSERT INTO documents (name, category, file_path, uploaded_by)
VALUES (
  'RG Teste',
  'Documentos Pessoais',
  'documents/rg-teste.pdf',
  (SELECT id FROM users LIMIT 1)
)
RETURNING id, name, uploaded_by;

-- Verificar se foi criado registro no employee_document_checklist
SELECT 
  edc.id,
  c.nome as colaborador_nome,
  rd.name as documento_obrigatorio,
  edc.status,
  edc.created_at
FROM employee_document_checklist edc
JOIN colaboradores c ON edc.employee_id = c.id
JOIN required_documents rd ON edc.required_document_id = rd.id
WHERE edc.created_at > NOW() - INTERVAL '1 minute';