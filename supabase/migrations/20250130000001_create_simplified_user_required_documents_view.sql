-- Migração: Criar view user_required_documents usando arquitetura simplificada
-- Data: 2025-01-30
-- Descrição: Criar view que mostra documentos obrigatórios usando apenas tables documents e required_documents

-- Remover a view existente se houver
DROP VIEW IF EXISTS public.user_required_documents;

-- Criar view user_required_documents com arquitetura simplificada
CREATE OR REPLACE VIEW public.user_required_documents AS
SELECT 
    c.id as employee_id,
    c.nome as employee_name,
    c.email as employee_email,
    c.cargo as employee_position,
    c.departamento as employee_department,
    c.unidade as employee_unit,
    rd.id as required_document_id,
    rd.name as document_name,
    rd.document_type,
    rd.description as document_description,
    rd.is_mandatory,
    rd.category as document_category,
    CASE 
        WHEN d.id IS NOT NULL THEN d.status
        ELSE 'pendente'
    END as status,
    d.id as document_id,
    d.name as file_name,
    d.file_path,
    d.expires_at as expiry_date,
    d.created_at as document_uploaded_at,
    d.updated_at as document_updated_at,
    NOW() as checklist_created_at,
    NOW() as checklist_updated_at
FROM public.colaboradores c
CROSS JOIN public.required_documents rd
LEFT JOIN public.documents d ON (
    d.employee_id = c.id 
    AND d.required_document_id = rd.id
)
WHERE 
    rd.is_active = true
    AND rd.is_mandatory = true
    AND c.status = 'ativo'
ORDER BY c.nome, rd.name;

-- Adicionar comentário explicativo
COMMENT ON VIEW public.user_required_documents IS 'View que mostra colaboradores ativos com documentos obrigatórios usando arquitetura simplificada (documents + required_documents)';

-- Conceder permissões
GRANT SELECT ON public.user_required_documents TO authenticated;
GRANT SELECT ON public.user_required_documents TO anon;

-- Log da migração
SELECT 'View user_required_documents criada com arquitetura simplificada' as migration_status;