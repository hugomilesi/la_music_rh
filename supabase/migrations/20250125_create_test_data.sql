-- Criar dados de teste para documentos enviados/aprovados

-- Primeiro, verificar se os documentos obrigatórios existem
INSERT INTO required_documents (id, document_type, name, description, is_mandatory, category, is_active) VALUES
(gen_random_uuid(), 'RG', 'RG', 'Registro Geral (Carteira de Identidade)', true, 'pessoal', true),
(gen_random_uuid(), 'CPF', 'CPF', 'Cadastro de Pessoa Física', true, 'pessoal', true),
(gen_random_uuid(), 'Comprovante de Residência', 'Comprovante de Residência', 'Comprovante de endereço atualizado', true, 'pessoal', true),
(gen_random_uuid(), 'Contrato de Trabalho', 'Contrato de Trabalho', 'Contrato de trabalho assinado', true, 'trabalhista', true),
(gen_random_uuid(), 'Atestado de Saúde Ocupacional', 'Atestado de Saúde Ocupacional', 'ASO - Atestado de Saúde Ocupacional', true, 'saude', true)
ON CONFLICT (document_type) DO NOTHING;

-- Buscar IDs dos colaboradores existentes e inserir documentos de teste
WITH colaboradores_ativos AS (
  SELECT id, nome FROM colaboradores WHERE status = 'ativo' LIMIT 5
),
documentos_obrigatorios AS (
  SELECT id, document_type FROM required_documents WHERE is_mandatory = true AND is_active = true
)
INSERT INTO documents (id, name, employee_id, required_document_id, status, file_path, created_at)
SELECT 
  gen_random_uuid() as id,
  CASE 
    WHEN rd.document_type = 'RG' THEN 'RG_' || REPLACE(ca.nome, ' ', '_') || '.pdf'
    WHEN rd.document_type = 'CPF' THEN 'CPF_' || REPLACE(ca.nome, ' ', '_') || '.pdf'
    WHEN rd.document_type = 'Comprovante de Residência' THEN 'Comprovante_' || REPLACE(ca.nome, ' ', '_') || '.pdf'
    WHEN rd.document_type = 'Contrato de Trabalho' THEN 'Contrato_' || REPLACE(ca.nome, ' ', '_') || '.pdf'
    WHEN rd.document_type = 'Atestado de Saúde Ocupacional' THEN 'ASO_' || REPLACE(ca.nome, ' ', '_') || '.pdf'
    ELSE 'Documento_' || REPLACE(ca.nome, ' ', '_') || '.pdf'
  END as name,
  ca.id as employee_id,
  rd.id as required_document_id,
  CASE 
    WHEN RANDOM() < 0.3 THEN 'aprovado'
    WHEN RANDOM() < 0.6 THEN 'enviado'
    ELSE 'pendente'
  END as status,
  '/documents/' || LOWER(REPLACE(ca.nome, ' ', '_')) || '/' || LOWER(rd.document_type) || '.pdf' as file_path,
  NOW() - (RANDOM() * INTERVAL '30 days') as created_at
FROM colaboradores_ativos ca
CROSS JOIN documentos_obrigatorios rd
WHERE NOT EXISTS (
  SELECT 1 FROM documents d 
  WHERE d.employee_id = ca.id AND d.required_document_id = rd.id
);

-- Verificar os resultados
SELECT 
  'Resumo dos dados criados:' as info,
  COUNT(DISTINCT c.id) as colaboradores_ativos,
  COUNT(DISTINCT rd.id) as documentos_obrigatorios,
  COUNT(d.id) as total_documentos,
  COUNT(CASE WHEN d.status = 'enviado' THEN 1 END) as documentos_enviados,
  COUNT(CASE WHEN d.status = 'aprovado' THEN 1 END) as documentos_aprovados,
  COUNT(CASE WHEN d.status = 'pendente' THEN 1 END) as documentos_pendentes
FROM colaboradores c
CROSS JOIN required_documents rd
LEFT JOIN documents d ON d.employee_id = c.id AND d.required_document_id = rd.id
WHERE c.status = 'ativo' AND rd.is_mandatory = true AND rd.is_active = true;

-- Mostrar detalhes por colaborador
SELECT 
  c.nome as colaborador,
  COUNT(d.id) as total_documentos,
  COUNT(CASE WHEN d.status = 'enviado' THEN 1 END) as enviados,
  COUNT(CASE WHEN d.status = 'aprovado' THEN 1 END) as aprovados,
  COUNT(CASE WHEN d.status = 'pendente' THEN 1 END) as pendentes
FROM colaboradores c
LEFT JOIN documents d ON d.employee_id = c.id
WHERE c.status = 'ativo'
GROUP BY c.id, c.nome
ORDER BY c.nome;