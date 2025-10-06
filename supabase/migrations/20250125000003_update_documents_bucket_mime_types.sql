-- Atualizar o bucket documents para aceitar mais tipos de arquivo
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
  'application/pdf',
  'image/jpeg',
  'image/png', 
  'image/jpg',
  'image/gif',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'text/plain',
  'application/zip',
  'application/x-zip-compressed'
]
WHERE id = 'documents';