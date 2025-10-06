-- Corrigir constraint de chave estrangeira na tabela benefit_documents
-- O campo uploaded_by deve referenciar a tabela users, não auth.users

-- Remover a constraint existente que referencia auth.users
ALTER TABLE benefit_documents 
DROP CONSTRAINT IF EXISTS benefit_documents_uploaded_by_fkey;

-- Adicionar nova constraint que referencia a tabela users
ALTER TABLE benefit_documents 
ADD CONSTRAINT benefit_documents_uploaded_by_fkey 
FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL;