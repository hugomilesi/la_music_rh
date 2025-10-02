-- Migração: Criar view user_required_documents para resolver problemas de relacionamento
-- Data: 2025-01-25
-- Descrição: Cria a view que mostra colaboradores ativos com seus documentos obrigatórios

-- Remover view se existir
DROP VIEW IF EXISTS public.user_required_documents;

-- Criar view user_required_documents
CREATE OR REPLACE VIEW public.user_required_documents AS
SELECT 
    c.id as colaborador_id,
    c.nome as colaborador_nome,
    c.email as colaborador_email,
    c.cargo as colaborador_cargo,
    c.departamento as colaborador_departamento,
    c.unidade as colaborador_unidade,
    c.status as colaborador_status,
    rd.id as required_document_id,
    rd.name as required_document_name,
    rd.description as required_document_description,
    rd.is_mandatory as required_document_is_mandatory,
    rd.category as required_document_category,
    d.id as document_id,
    d.name as document_name,
    d.status as document_status,
    d.file_path as document_file_path,
    d.created_at as document_created_at,
    d.expires_at as document_expires_at,
    CASE 
        WHEN d.id IS NOT NULL THEN d.status
        ELSE 'pendente'
    END as status
FROM 
    public.colaboradores c
CROSS JOIN 
    public.required_documents rd
LEFT JOIN 
    public.documents d ON (
        d.employee_id = c.id 
        AND d.required_document_id = rd.id
    )
WHERE 
    c.status = 'ativo'
    AND rd.is_active = true
ORDER BY 
    c.nome, rd.name;

-- Adicionar comentário à view
COMMENT ON VIEW public.user_required_documents IS 'View que mostra colaboradores ativos com todos os documentos obrigatórios (enviados e pendentes)';

-- Criar função para sincronizar dados de documentos obrigatórios
CREATE OR REPLACE FUNCTION public.sync_user_required_documents()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Esta função pode ser usada para sincronizar dados se necessário
    -- Por enquanto, apenas um placeholder
    RAISE NOTICE 'Sincronização de documentos obrigatórios executada';
END;
$$;

-- Adicionar comentário à função
COMMENT ON FUNCTION public.sync_user_required_documents() IS 'Função para sincronizar dados de documentos obrigatórios dos colaboradores';

-- View user_required_documents criada para resolver problemas de relacionamento