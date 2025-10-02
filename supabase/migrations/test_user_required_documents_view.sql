-- Teste da view user_required_documents
-- Verificar se a view está funcionando corretamente

-- 1. Verificar se a view existe
SELECT 
    schemaname, 
    viewname, 
    definition 
FROM pg_views 
WHERE viewname = 'user_required_documents';

-- 2. Contar total de registros na view
SELECT COUNT(*) as total_records FROM user_required_documents;

-- 3. Verificar estrutura da view
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_required_documents' 
ORDER BY ordinal_position;

-- 4. Mostrar alguns registros de exemplo
SELECT 
    employee_name,
    document_name,
    is_mandatory,
    status,
    document_id,
    file_path
FROM user_required_documents 
LIMIT 10;

-- 5. Verificar colaboradores com documentos enviados
SELECT 
    employee_name,
    COUNT(*) as total_documents,
    COUNT(CASE WHEN document_id IS NOT NULL THEN 1 END) as documents_sent,
    COUNT(CASE WHEN is_mandatory = true AND document_id IS NULL THEN 1 END) as mandatory_pending
FROM user_required_documents 
GROUP BY employee_id, employee_name
ORDER BY employee_name;

-- 6. Verificar apenas documentos obrigatórios
SELECT 
    employee_name,
    document_name,
    status,
    document_id IS NOT NULL as has_document
FROM user_required_documents 
WHERE is_mandatory = true
ORDER BY employee_name, document_name;

SELECT 'Teste da view user_required_documents concluído' as test_status;