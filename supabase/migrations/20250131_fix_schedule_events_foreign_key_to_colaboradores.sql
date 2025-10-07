-- Limpar dados órfãos existentes
DELETE FROM schedule_events WHERE user_id NOT IN (SELECT id FROM colaboradores);

-- Remover a foreign key constraint existente que referencia users
ALTER TABLE schedule_events 
DROP CONSTRAINT IF EXISTS schedule_events_user_id_fkey;

-- Adicionar nova foreign key constraint que referencia colaboradores
ALTER TABLE schedule_events 
ADD CONSTRAINT schedule_events_colaborador_id_fkey 
FOREIGN KEY (user_id) REFERENCES colaboradores(id) ON DELETE CASCADE;