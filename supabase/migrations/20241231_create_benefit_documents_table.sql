-- Criar tabela benefit_documents para armazenar metadados dos documentos de benefícios
CREATE TABLE IF NOT EXISTS public.benefit_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    benefit_id UUID NOT NULL REFERENCES public.benefits(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    uploaded_by UUID REFERENCES public.users(id),
    colaborador_id UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Comentário da tabela
COMMENT ON TABLE public.benefit_documents IS 'Documentos associados aos benefícios - armazena metadados dos arquivos no storage';

-- Comentários das colunas
COMMENT ON COLUMN public.benefit_documents.benefit_id IS 'ID do benefício ao qual o documento está associado';
COMMENT ON COLUMN public.benefit_documents.name IS 'Nome/título do documento';
COMMENT ON COLUMN public.benefit_documents.file_path IS 'Caminho do arquivo no Supabase Storage';
COMMENT ON COLUMN public.benefit_documents.file_type IS 'Tipo MIME do arquivo';
COMMENT ON COLUMN public.benefit_documents.file_size IS 'Tamanho do arquivo em bytes';
COMMENT ON COLUMN public.benefit_documents.status IS 'Status do documento: pending, approved, rejected';
COMMENT ON COLUMN public.benefit_documents.uploaded_by IS 'ID do usuário que fez o upload';
COMMENT ON COLUMN public.benefit_documents.colaborador_id IS 'ID do colaborador associado (opcional)';

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_benefit_documents_benefit_id ON public.benefit_documents(benefit_id);
CREATE INDEX IF NOT EXISTS idx_benefit_documents_uploaded_by ON public.benefit_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_benefit_documents_status ON public.benefit_documents(status);

-- Habilitar RLS
ALTER TABLE public.benefit_documents ENABLE ROW LEVEL SECURITY;

-- Política RLS: usuários podem ver documentos dos benefícios que têm acesso
CREATE POLICY "Users can view benefit documents" ON public.benefit_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.auth_user_id = auth.uid()
            AND u.is_active = true
        )
    );

-- Política RLS: usuários podem inserir documentos se tiverem permissão
CREATE POLICY "Users can insert benefit documents" ON public.benefit_documents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.auth_user_id = auth.uid()
            AND u.is_active = true
        )
    );

-- Política RLS: usuários podem atualizar documentos que enviaram
CREATE POLICY "Users can update their own benefit documents" ON public.benefit_documents
    FOR UPDATE USING (
        uploaded_by IN (
            SELECT id FROM public.users 
            WHERE auth_user_id = auth.uid()
        )
    );

-- Política RLS: usuários podem deletar documentos que enviaram
CREATE POLICY "Users can delete their own benefit documents" ON public.benefit_documents
    FOR DELETE USING (
        uploaded_by IN (
            SELECT id FROM public.users 
            WHERE auth_user_id = auth.uid()
        )
    );