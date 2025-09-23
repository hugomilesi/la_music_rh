-- Criar bucket para documentos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Política para permitir que usuários autenticados façam upload
CREATE POLICY "Authenticated users can upload documents" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Política para permitir que usuários autenticados vejam documentos
CREATE POLICY "Authenticated users can view documents" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'documents');

-- Política para permitir que usuários autenticados atualizem documentos
CREATE POLICY "Authenticated users can update documents" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'documents');

-- Política para permitir que usuários autenticados deletem documentos
CREATE POLICY "Authenticated users can delete documents" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'documents');

-- Conceder permissões básicas para o role anon (caso necessário para visualização pública)
GRANT SELECT ON storage.buckets TO anon;
GRANT SELECT ON storage.objects TO anon;

-- Conceder permissões completas para usuários autenticados
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.objects TO authenticated;