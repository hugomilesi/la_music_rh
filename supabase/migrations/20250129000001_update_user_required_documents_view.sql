-- Migração: Atualizar view user_required_documents para mostrar apenas colaboradores com documentos enviados
-- Data: 2025-01-29
-- Descrição: Modificar a view para se basear em colaboradores ao invés de usuários e mostrar apenas aqueles que têm pelo menos 1 documento enviado

-- Primeiro, remover a view existente se ela existir
DROP VIEW IF EXISTS public.user_required_documents;

-- Criar a nova view baseada em colaboradores com documentos enviados
CREATE OR REPLACE VIEW public.user_required_documents AS
SELECT DISTINCT
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
    edc.status,
    edc.document_id,
    d.name as file_name,
    d.file_path,
    d.expires_at as expiry_date,
    d.created_at as document_uploaded_at,
    d.updated_at as document_updated_at,
    edc.created_at as checklist_created_at,
    edc.updated_at as checklist_updated_at
FROM public.colaboradores c
INNER JOIN public.employee_document_checklist edc ON edc.employee_id = c.id
INNER JOIN public.required_documents rd ON rd.id = edc.required_document_id
LEFT JOIN public.documents d ON d.id = edc.document_id
WHERE rd.is_active = true
    AND rd.is_mandatory = true
    AND c.status = 'ativo'
    -- Condição principal: mostrar apenas colaboradores que têm pelo menos 1 documento enviado
    AND EXISTS (
        SELECT 1 
        FROM public.employee_document_checklist edc_check 
        INNER JOIN public.documents doc ON doc.id = edc_check.document_id
        WHERE edc_check.employee_id = c.id 
            AND edc_check.document_id IS NOT NULL
    )
ORDER BY c.nome, rd.name;

-- Adicionar comentário explicativo
COMMENT ON VIEW public.user_required_documents IS 'View que mostra colaboradores ativos que têm pelo menos 1 documento enviado, junto com seus documentos obrigatórios (enviados e pendentes)';

-- Criar ou atualizar a função de sincronização se ela não existir
CREATE OR REPLACE FUNCTION public.sync_user_required_documents()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Esta função pode ser usada para sincronizar dados se necessário
    -- Por enquanto, apenas registra a execução
    RAISE NOTICE 'Sincronização de documentos obrigatórios executada em %', NOW();
END;
$$;

-- Adicionar comentário na função
COMMENT ON FUNCTION public.sync_user_required_documents() IS 'Função para sincronizar dados de documentos obrigatórios dos colaboradores';

-- Migração aplicada com sucesso
-- View user_required_documents atualizada para mostrar apenas colaboradores com documentos enviados