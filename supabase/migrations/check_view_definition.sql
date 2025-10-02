-- Verificar a definição da view user_required_documents
SELECT definition FROM pg_views WHERE viewname = 'user_required_documents';

-- Verificar as colunas da view
SELECT 
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'user_required_documents' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Testar a view atual
SELECT * FROM user_required_documents LIMIT 5;