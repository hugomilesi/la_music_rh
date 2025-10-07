-- Atualizar bucket avatars para permitir todos os tipos MIME (remover restrição)
UPDATE storage.buckets 
SET allowed_mime_types = NULL 
WHERE name = 'avatars';