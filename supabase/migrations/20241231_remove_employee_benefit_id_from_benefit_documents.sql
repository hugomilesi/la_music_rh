-- Remove employee_benefit_id column from benefit_documents table
-- This column is not needed since documents are related to benefits, not employee benefits

ALTER TABLE benefit_documents 
DROP COLUMN IF EXISTS employee_benefit_id;