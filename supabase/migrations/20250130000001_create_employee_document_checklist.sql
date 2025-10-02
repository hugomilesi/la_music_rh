-- Migração: Criar tabela employee_document_checklist
-- Data: 2025-01-30
-- Descrição: Criar a tabela employee_document_checklist que está sendo referenciada nas views e funções

-- Criar a tabela employee_document_checklist
CREATE TABLE IF NOT EXISTS public.employee_document_checklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    required_document_id UUID NOT NULL,
    document_id UUID,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviado', 'aprovado', 'rejeitado')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Foreign keys
    CONSTRAINT edc_employee_fkey FOREIGN KEY (employee_id) REFERENCES public.colaboradores(id) ON DELETE CASCADE,
    CONSTRAINT edc_required_doc_fkey FOREIGN KEY (required_document_id) REFERENCES public.required_documents(id) ON DELETE CASCADE,
    CONSTRAINT edc_document_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE SET NULL,
    
    -- Unique constraint para evitar duplicatas
    CONSTRAINT unique_employee_required_doc UNIQUE (employee_id, required_document_id)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_edc_employee ON public.employee_document_checklist(employee_id);
CREATE INDEX IF NOT EXISTS idx_edc_required ON public.employee_document_checklist(required_document_id);
CREATE INDEX IF NOT EXISTS idx_edc_status ON public.employee_document_checklist(status);

-- Comentários
COMMENT ON TABLE public.employee_document_checklist IS 'Checklist de documentos por colaborador - controla o status dos documentos obrigatórios';
COMMENT ON COLUMN public.employee_document_checklist.employee_id IS 'ID do colaborador';
COMMENT ON COLUMN public.employee_document_checklist.required_document_id IS 'ID do documento obrigatório';
COMMENT ON COLUMN public.employee_document_checklist.document_id IS 'ID do documento enviado (se houver)';
COMMENT ON COLUMN public.employee_document_checklist.status IS 'Status do documento: pendente, enviado, aprovado, rejeitado';

-- Função para sincronizar checklist quando um colaborador é criado
CREATE OR REPLACE FUNCTION sync_employee_checklist_on_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Inserir registros na tabela employee_document_checklist para todos os documentos obrigatórios ativos
    INSERT INTO public.employee_document_checklist (employee_id, required_document_id, status)
    SELECT 
        NEW.id,
        rd.id,
        'pendente'
    FROM public.required_documents rd
    WHERE rd.is_active = true AND rd.is_mandatory = true
    ON CONFLICT (employee_id, required_document_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para sincronizar checklist quando um colaborador é inserido
DROP TRIGGER IF EXISTS trigger_sync_employee_checklist ON public.colaboradores;
CREATE TRIGGER trigger_sync_employee_checklist
    AFTER INSERT ON public.colaboradores
    FOR EACH ROW
    EXECUTE FUNCTION sync_employee_checklist_on_insert();

-- Função para sincronizar checklist quando um documento obrigatório é criado
CREATE OR REPLACE FUNCTION sync_checklist_on_required_doc_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o documento é obrigatório e ativo, criar registros para todos os colaboradores ativos
    IF NEW.is_mandatory = true AND NEW.is_active = true THEN
        INSERT INTO public.employee_document_checklist (employee_id, required_document_id, status)
        SELECT 
            c.id,
            NEW.id,
            'pendente'
        FROM public.colaboradores c
        WHERE c.status = 'ativo'
        ON CONFLICT (employee_id, required_document_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para sincronizar checklist quando um documento obrigatório é inserido
DROP TRIGGER IF EXISTS trigger_sync_checklist_on_required_doc ON public.required_documents;
CREATE TRIGGER trigger_sync_checklist_on_required_doc
    AFTER INSERT ON public.required_documents
    FOR EACH ROW
    EXECUTE FUNCTION sync_checklist_on_required_doc_insert();

-- Popular a tabela com dados existentes
INSERT INTO public.employee_document_checklist (employee_id, required_document_id, document_id, status)
SELECT 
    c.id as employee_id,
    rd.id as required_document_id,
    d.id as document_id,
    CASE 
        WHEN d.id IS NOT NULL THEN d.status
        ELSE 'pendente'
    END as status
FROM public.colaboradores c
CROSS JOIN public.required_documents rd
LEFT JOIN public.documents d ON d.employee_id = c.id AND d.required_document_id = rd.id
WHERE rd.is_active = true 
  AND rd.is_mandatory = true
  AND c.status = 'ativo'
ON CONFLICT (employee_id, required_document_id) DO NOTHING;

-- Habilitar RLS
ALTER TABLE public.employee_document_checklist ENABLE ROW LEVEL SECURITY;

-- Política RLS para permitir acesso aos usuários autenticados
CREATE POLICY "Usuários autenticados podem ver checklist" ON public.employee_document_checklist
    FOR ALL USING (auth.role() = 'authenticated');

-- Conceder permissões
GRANT ALL PRIVILEGES ON public.employee_document_checklist TO authenticated;
GRANT SELECT ON public.employee_document_checklist TO anon;