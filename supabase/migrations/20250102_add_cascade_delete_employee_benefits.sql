-- Add CASCADE DELETE to employee_benefits foreign key constraint
-- This allows automatic deletion of employee benefits when a colaborador is deleted

ALTER TABLE employee_benefits 
DROP CONSTRAINT employee_benefits_colaborador_id_fkey;

ALTER TABLE employee_benefits 
ADD CONSTRAINT employee_benefits_colaborador_id_fkey 
FOREIGN KEY (colaborador_id) 
REFERENCES colaboradores(id) 
ON DELETE CASCADE;