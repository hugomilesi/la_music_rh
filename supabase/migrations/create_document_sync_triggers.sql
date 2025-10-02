-- Remover funções e triggers existentes
DROP TRIGGER IF EXISTS trigger_sync_checklist_on_document_insert ON documents;
DROP TRIGGER IF EXISTS trigger_sync_checklist_on_document_delete ON documents;
DROP TRIGGER IF EXISTS trigger_sync_new_employee ON colaboradores;
DROP FUNCTION IF EXISTS sync_checklist_on_document_insert() CASCADE;
DROP FUNCTION IF EXISTS sync_checklist_on_document_delete() CASCADE;
DROP FUNCTION IF EXISTS sync_employee_document_checklist(uuid) CASCADE;
DROP FUNCTION IF EXISTS trigger_sync_new_employee() CASCADE;

-- Criar função para sincronizar checklist quando documento é inserido
CREATE OR REPLACE FUNCTION sync_checklist_on_document_insert()
RETURNS TRIGGER AS $$
DECLARE
  colaborador_id UUID;
  required_doc_id UUID;
BEGIN
  -- Buscar o colaborador_id correspondente ao usuário que fez o upload
  SELECT c.id INTO colaborador_id
  FROM colaboradores c
  JOIN users u ON c.email = u.email
  WHERE u.id = NEW.uploaded_by;
  
  -- Se encontrou um colaborador correspondente
  IF colaborador_id IS NOT NULL THEN
    -- Buscar documento obrigatório correspondente ao nome/categoria do documento
    SELECT rd.id INTO required_doc_id
    FROM required_documents rd
    WHERE rd.is_active = true
      AND (
        LOWER(rd.name) = LOWER(NEW.name) OR
        LOWER(rd.category) = LOWER(NEW.category) OR
        LOWER(NEW.name) LIKE '%' || LOWER(rd.name) || '%'
      )
    LIMIT 1;
    
    -- Se encontrou um documento obrigatório correspondente
    IF required_doc_id IS NOT NULL THEN
      -- Verificar se já existe um registro no checklist
      IF NOT EXISTS (
        SELECT 1 FROM employee_document_checklist edc
        WHERE edc.employee_id = colaborador_id 
          AND edc.required_document_id = required_doc_id
      ) THEN
        -- Inserir novo registro no checklist
        INSERT INTO employee_document_checklist (employee_id, required_document_id, document_id, status)
        VALUES (colaborador_id, required_doc_id, NEW.id, 'completo');
      ELSE
        -- Atualizar registro existente
        UPDATE employee_document_checklist 
        SET document_id = NEW.id, status = 'completo', updated_at = now()
        WHERE employee_id = colaborador_id 
          AND required_document_id = required_doc_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar função para sincronizar checklist quando documento é excluído
CREATE OR REPLACE FUNCTION sync_checklist_on_document_delete()
RETURNS TRIGGER AS $$
DECLARE
  colaborador_id UUID;
BEGIN
  -- Buscar o colaborador_id correspondente ao usuário que fez o upload
  SELECT c.id INTO colaborador_id
  FROM colaboradores c
  JOIN users u ON c.email = u.email
  WHERE u.id = OLD.uploaded_by;
  
  -- Se encontrou um colaborador correspondente
  IF colaborador_id IS NOT NULL THEN
    -- Atualizar o checklist para 'pendente' e remover a referência do documento
    UPDATE employee_document_checklist 
    SET document_id = NULL, status = 'pendente', updated_at = now()
    WHERE employee_id = colaborador_id 
      AND document_id = OLD.id;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Criar função para sincronizar checklist quando novo colaborador é criado
CREATE OR REPLACE FUNCTION sync_employee_document_checklist(colaborador_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Inserir registros pendentes para todos os documentos obrigatórios
  INSERT INTO employee_document_checklist (employee_id, required_document_id, status)
  SELECT 
    colaborador_id,
    rd.id,
    'pendente'
  FROM required_documents rd
  WHERE rd.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM employee_document_checklist edc
      WHERE edc.employee_id = colaborador_id 
        AND edc.required_document_id = rd.id
    );
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para quando novo colaborador é criado
CREATE OR REPLACE FUNCTION trigger_sync_new_employee()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se o colaborador está ativo
  IF NEW.status = 'ativo' THEN
    -- Sincronizar checklist de documentos
    PERFORM sync_employee_document_checklist(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers na tabela documents
CREATE TRIGGER trigger_sync_checklist_on_document_insert
  AFTER INSERT ON documents
  FOR EACH ROW
  EXECUTE FUNCTION sync_checklist_on_document_insert();

CREATE TRIGGER trigger_sync_checklist_on_document_delete
  AFTER DELETE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION sync_checklist_on_document_delete();

-- Criar trigger na tabela colaboradores
CREATE TRIGGER trigger_sync_new_employee
  AFTER INSERT ON colaboradores
  FOR EACH ROW
  EXECUTE FUNCTION trigger_sync_new_employee();

-- Sincronizar checklist para colaboradores existentes que não têm registros
INSERT INTO employee_document_checklist (employee_id, required_document_id, status)
SELECT 
  c.id,
  rd.id,
  'pendente'
FROM colaboradores c
CROSS JOIN required_documents rd
WHERE c.status = 'ativo'
  AND rd.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM employee_document_checklist edc
    WHERE edc.employee_id = c.id 
      AND edc.required_document_id = rd.id
  )
ON CONFLICT DO NOTHING;

-- Verificar se os triggers foram criados corretamente
SELECT 
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers 
WHERE event_object_table IN ('documents', 'colaboradores')
ORDER BY event_object_table, trigger_name;