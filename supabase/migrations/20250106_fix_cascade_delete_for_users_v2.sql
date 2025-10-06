-- Configurar exclusão em cascata para todas as tabelas que referenciam users
-- Isso permitirá que quando um usuário for deletado, todos os registros relacionados sejam removidos automaticamente

-- Primeiro, remover as constraints existentes e recriar com ON DELETE CASCADE

-- 1. incidents table - employee_id, assigned_to, reported_by
ALTER TABLE incidents DROP CONSTRAINT IF EXISTS incidents_employee_id_fkey;
ALTER TABLE incidents DROP CONSTRAINT IF EXISTS incidents_assigned_to_fkey;
ALTER TABLE incidents DROP CONSTRAINT IF EXISTS incidents_reported_by_fkey;

ALTER TABLE incidents 
ADD CONSTRAINT incidents_employee_id_fkey 
FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE incidents 
ADD CONSTRAINT incidents_assigned_to_fkey 
FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE incidents 
ADD CONSTRAINT incidents_reported_by_fkey 
FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE SET NULL;

-- 2. employee_evaluations table
ALTER TABLE employee_evaluations DROP CONSTRAINT IF EXISTS employee_evaluations_employee_id_fkey;
ALTER TABLE employee_evaluations 
ADD CONSTRAINT employee_evaluations_employee_id_fkey 
FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE;

-- 3. vacation_balances table
ALTER TABLE vacation_balances DROP CONSTRAINT IF EXISTS vacation_balances_user_id_fkey;
ALTER TABLE vacation_balances 
ADD CONSTRAINT vacation_balances_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 4. employee_benefits table
ALTER TABLE employee_benefits DROP CONSTRAINT IF EXISTS employee_benefits_user_id_fkey;
ALTER TABLE employee_benefits 
ADD CONSTRAINT employee_benefits_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 5. schedule_events table
ALTER TABLE schedule_events DROP CONSTRAINT IF EXISTS schedule_events_user_id_fkey;
ALTER TABLE schedule_events 
ADD CONSTRAINT schedule_events_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 6. audit_logs table
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
ALTER TABLE audit_logs 
ADD CONSTRAINT audit_logs_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 7. login_logs table
ALTER TABLE login_logs DROP CONSTRAINT IF EXISTS login_logs_user_id_fkey;
ALTER TABLE login_logs 
ADD CONSTRAINT login_logs_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 8. system_logs table
ALTER TABLE system_logs DROP CONSTRAINT IF EXISTS system_logs_user_id_fkey;
ALTER TABLE system_logs 
ADD CONSTRAINT system_logs_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 9. notifications table
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE notifications 
ADD CONSTRAINT notifications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 10. nps_responses table
ALTER TABLE nps_responses DROP CONSTRAINT IF EXISTS nps_responses_user_id_fkey;
ALTER TABLE nps_responses 
ADD CONSTRAINT nps_responses_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Para tabelas onde o usuário é criador/uploader, usar SET NULL para preservar os registros
-- 11. documents table
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_created_by_fkey;
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_uploaded_by_fkey;
ALTER TABLE documents 
ADD CONSTRAINT documents_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE documents 
ADD CONSTRAINT documents_uploaded_by_fkey 
FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL;

-- 12. benefit_documents table
ALTER TABLE benefit_documents DROP CONSTRAINT IF EXISTS benefit_documents_uploaded_by_fkey;
ALTER TABLE benefit_documents 
ADD CONSTRAINT benefit_documents_uploaded_by_fkey 
FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL;

-- 13. required_documents table
ALTER TABLE required_documents DROP CONSTRAINT IF EXISTS required_documents_created_by_fkey;
ALTER TABLE required_documents 
ADD CONSTRAINT required_documents_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- 14. payroll_entries table
ALTER TABLE payroll_entries DROP CONSTRAINT IF EXISTS payroll_entries_created_by_fkey;
ALTER TABLE payroll_entries 
ADD CONSTRAINT payroll_entries_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- 15. message_schedules table
ALTER TABLE message_schedules DROP CONSTRAINT IF EXISTS message_schedules_created_by_fkey;
ALTER TABLE message_schedules 
ADD CONSTRAINT message_schedules_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- 16. nps_surveys table
ALTER TABLE nps_surveys DROP CONSTRAINT IF EXISTS nps_surveys_created_by_fkey;
ALTER TABLE nps_surveys 
ADD CONSTRAINT nps_surveys_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- 17. vacation_requests table
ALTER TABLE vacation_requests DROP CONSTRAINT IF EXISTS vacation_requests_approved_by_fkey;
ALTER TABLE vacation_requests 
ADD CONSTRAINT vacation_requests_approved_by_fkey 
FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

-- 18. departments table (manager_id)
ALTER TABLE departments DROP CONSTRAINT IF EXISTS departments_manager_id_fkey;
ALTER TABLE departments 
ADD CONSTRAINT departments_manager_id_fkey 
FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL;