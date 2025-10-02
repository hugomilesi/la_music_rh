-- Migração: Atualizar view user_required_documents para mostrar documentos obrigatórios corretamente
-- Data: 2025-01-29
-- Descrição: Aplicar a view corrigida que filtra apenas documentos obrigatórios e mostra tanto enviados quanto pendentes

-- Remover a view existente
DROP VIEW IF EXISTS public.user_required_documents;

-- Recriar a view com a lógica corrigida conforme especificado
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
     COALESCE(edc.status, 'pendente') as status, 
     edc.document_id, 
     d.name as file_name, 
     d.file_path, 
     d.expires_at as expiry_date, 
     d.created_at as document_uploaded_at, 
     d.updated_at as document_updated_at, 
     edc.created_at as checklist_created_at, 
     edc.updated_at as checklist_updated_at 
 FROM public.colaboradores c 
 CROSS JOIN public.required_documents rd 
 LEFT JOIN public.employee_document_checklist edc ON (edc.employee_id = c.id AND edc.required_document_id = rd.id) 
 LEFT JOIN public.documents d ON d.id = edc.document_id 
 WHERE rd.is_active = true 
     AND rd.is_mandatory = true 
     AND c.status = 'ativo' 
     -- Condição principal: mostrar apenas colaboradores que têm pelo menos 1 documento enviado 
     AND EXISTS ( 
         SELECT 1 
         FROM public.employee_document_checklist edc_check 
         WHERE edc_check.employee_id = c.id 
         AND edc_check.document_id IS NOT NULL 
     ) 
 ORDER BY c.nome, rd.name;

-- Adicionar comentário explicativo 
COMMENT ON VIEW public.user_required_documents IS 'View que mostra colaboradores ativos que têm pelo menos 1 documento enviado, junto com todos os documentos obrigatórios (enviados e pendentes)';

-- Atualizar a função de sincronização 
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
-- View user_required_documents corrigida para resolver problemas de relacionamento