-- Testar a view corrigida
SELECT 
  employee_name,
  document_name,
  is_mandatory,
  status,
  COUNT(*) as total_records
FROM user_required_documents
GROUP BY employee_name, document_name, is_mandatory, status
ORDER BY employee_name, document_name;

-- Verificar se todos os documentos na view são obrigatórios
SELECT 
  DISTINCT is_mandatory,
  COUNT(*) as total
FROM user_required_documents
GROUP BY is_mandatory;

-- Verificar quantos usuários têm documentos obrigatórios
SELECT 
  COUNT(DISTINCT employee_id) as total_users_with_mandatory_docs
FROM user_required_documents;

-- Verificar documentos por status
SELECT 
  status,
  COUNT(*) as total
FROM user_required_documents
GROUP BY status;