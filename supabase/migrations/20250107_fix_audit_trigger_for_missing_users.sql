-- Corrigir a função audit_trigger_function para lidar com usuários que não existem na tabela users
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    current_user_id UUID;
    action_type TEXT;
    old_data JSONB;
    new_data JSONB;
BEGIN
    -- Determinar o tipo de ação
    IF TG_OP = 'DELETE' THEN
        action_type := 'DELETE';
        old_data := to_jsonb(OLD);
        new_data := NULL;
    ELSIF TG_OP = 'UPDATE' THEN
        action_type := 'UPDATE';
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
    ELSIF TG_OP = 'INSERT' THEN
        action_type := 'INSERT';
        old_data := NULL;
        new_data := to_jsonb(NEW);
    END IF;
    
    -- Buscar ID do usuário atual (pode ser NULL se não existir)
    SELECT id INTO current_user_id FROM users WHERE auth_user_id = auth.uid();
    
    -- Só registrar log se o usuário existir na tabela users
    -- Isso evita erros quando usuários não cadastrados fazem operações
    IF current_user_id IS NOT NULL THEN
        -- Registrar log de auditoria
        PERFORM log_audit_action(
            current_user_id,
            action_type,
            TG_TABLE_NAME,
            COALESCE(NEW.id, OLD.id),
            old_data,
            new_data
        );
    END IF;
    
    -- Retornar o registro apropriado
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;