-- Testar a sincronização automática dos triggers

-- 1. Verificar se existem colaboradores e usuários para teste
SELECT 
  c.id as colaborador_id,
  c.nome,
  c.email,
  u.id as user_id,
  u.email as user_email
FROM colaboradores c
JOIN users u ON c.email = u.email
WHERE c.status = 'ativo'
LIMIT 3;

-- 2. Verificar documentos obrigatórios disponíveis
SELECT id, name, category, is_active
FROM required_documents
WHERE is_active = true
ORDER BY name
LIMIT 5;

-- 3. Verificar estado atual do checklist
SELECT 
  COUNT(*) as total_registros,
  status,
  COUNT(*) as quantidade
FROM employee_document_checklist
GROUP BY status;

-- 4. Inserir um documento de teste (RG)
INSERT INTO documents (name, category, file_path, uploaded_by)
SELECT 
  'RG',
  'documentos_pessoais',
  'documents/rg-teste-sync.pdf',
  u.id
FROM users u
JOIN colaboradores c ON u.email = c.email
WHERE c.status = 'ativo'
LIMIT 1
RETURNING id, name, uploaded_by;

-- 5. Verificar se o trigger criou/atualizou o checklist
SELECT 
  edc.id,
  c.nome as colaborador_nome,
  rd.name as documento_obrigatorio,
  d.name as documento_enviado,
  edc.status,
  edc.created_at,
  edc.updated_at
FROM employee_document_checklist edc
JOIN colaboradores c ON edc.employee_id = c.id
JOIN required_documents rd ON edc.required_document_id = rd.id
LEFT JOIN documents d ON edc.document_id = d.id
WHERE edc.updated_at > NOW() - INTERVAL '2 minutes'
ORDER BY edc.updated_at DESC;