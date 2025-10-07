-- Remove a tabela benefit_documents que não é mais necessária
-- Os documentos agora são armazenados apenas no bucket com metadados no nome do arquivo

DROP TABLE IF EXISTS benefit_documents;