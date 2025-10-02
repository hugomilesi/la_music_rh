-- Verificar dados nas tabelas relacionadas a documentos

-- 1. Verificar se existem colaboradores
SELECT COUNT(*) as total_colaboradores FROM colaboradores WHERE status = 'ativo';

-- 2. Verificar se existem documentos obrigatórios
SELECT COUNT(*) as total_required_documents FROM required_documents WHERE is_active = true;

-- 3. Verificar se existem documentos enviados
SELECT COUNT(*) as total_documents FROM documents;

-- 4. Verificar documentos por status
SELECT 
    status,
    COUNT(*) as count
FROM documents 
GROUP BY status;

-- 5. Verificar relacionamentos entre documentos e colaboradores
SELECT 
    c.nome as colaborador_nome,
    COUNT(d.id) as documentos_enviados
FROM colaboradores c
LEFT JOIN documents d ON d.employee_id = c.id
WHERE c.status = 'ativo'
GROUP BY c.id, c.nome
ORDER BY documentos_enviados DESC;

-- 6. Verificar documentos com required_document_id
SELECT 
    d.name as document_name,
    d.status,
    c.nome as colaborador_nome,
    rd.name as required_document_name
FROM documents d
JOIN colaboradores c ON c.id = d.employee_id
LEFT JOIN required_documents rd ON rd.id = d.required_document_id
LIMIT 10;

-- 7. Verificar se a view está retornando dados corretos
SELECT 
    employee_name,
    document_name,
    status,
    document_id IS NOT NULL as has_document_id,
    file_path IS NOT NULL as has_file_path
FROM user_required_documents
WHERE document_id IS NOT NULL
LIMIT 10;

SELECT 'Verificação de dados de documentos concluída' as check_status;