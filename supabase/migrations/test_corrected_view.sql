-- Testar a view user_required_documents corrigida
-- Verificar se está filtrando apenas documentos obrigatórios

-- 1. Verificar se todos os documentos na view são obrigatórios
SELECT 
  DISTINCT is_mandatory,
  COUNT(*) as total
FROM user_required_documents
GROUP BY is_mandatory;

-- 2. Verificar quantos colaboradores têm documentos obrigatórios
SELECT 
  COUNT(DISTINCT employee_id) as total_employees_with_mandatory_docs
FROM user_required_documents;

-- 3. Verificar documentos por status (enviados vs pendentes)
SELECT 
  status,
  COUNT(*) as total
FROM user_required_documents
GROUP BY status;

-- 4. Verificar alguns registros de exemplo
SELECT 
  employee_name,
  document_name,
  is_mandatory,
  status,
  document_id IS NOT NULL as has_document
FROM user_required_documents
ORDER BY employee_name, document_name
LIMIT 10;