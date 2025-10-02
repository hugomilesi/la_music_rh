-- Corrigir a view user_required_documents para filtrar apenas documentos obrigatórios
-- Primeiro, vamos dropar a view existente
DROP VIEW IF EXISTS user_required_documents;

-- Recriar a view filtrando apenas documentos obrigatórios (is_mandatory = true)
-- Ligando colaboradores com users através do email
CREATE VIEW user_required_documents AS
SELECT 
  u.id as employee_id,
  u.username as employee_name,
  rd.id as required_document_id,
  rd.document_type,
  rd.name as document_name,
  rd.description as document_description,
  rd.is_mandatory,
  rd.category,
  COALESCE(d.id, NULL) as document_id,
  CASE 
    WHEN d.id IS NOT NULL THEN 'completo'
    ELSE 'pendente'
  END as status,
  d.file_path,
  d.created_at as document_uploaded_at
FROM users u
CROSS JOIN required_documents rd
LEFT JOIN documents d ON d.uploaded_by = u.id 
  AND LOWER(TRIM(d.name)) LIKE '%' || LOWER(TRIM(rd.document_type)) || '%'
WHERE rd.is_mandatory = true  -- Filtrar apenas documentos obrigatórios
  AND rd.is_active = true
  AND u.is_active = true
  AND u.status = 'ativo'
ORDER BY u.username, rd.name;

-- Verificar a nova view
SELECT 
  employee_name,
  document_name,
  is_mandatory,
  status,
  COUNT(*) as total
FROM user_required_documents
GROUP BY employee_name, document_name, is_mandatory, status
ORDER BY employee_name, document_name;