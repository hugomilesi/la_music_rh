-- Corrigir função create_nps_schedule para usar a nova estrutura da tabela message_schedules
-- Correção final: usar recurrence_pattern em vez de recurring_pattern

DROP FUNCTION IF EXISTS public.create_nps_schedule(text, text, text, text, timestamp with time zone, jsonb, jsonb, jsonb, uuid);

CREATE OR REPLACE FUNCTION public.create_nps_schedule(
    p_title text,
    p_message text,
    p_channel text,
    p_schedule_type text,
    p_scheduled_at timestamp with time zone,
    p_recurring_pattern jsonb,
    p_target_filters jsonb,
    p_nps_data jsonb,
    p_created_by uuid
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_schedule_id UUID;
    v_next_execution_at TIMESTAMPTZ;
    v_auth_user_id UUID;
    v_target_users JSONB;
BEGIN
    -- Determinar auth_user_id para created_by
    IF p_created_by IS NOT NULL THEN
        -- Se p_created_by foi passado, assumir que é o id da tabela users
        -- e buscar o auth_user_id correspondente
        SELECT auth_user_id INTO v_auth_user_id FROM users WHERE id = p_created_by;
        
        IF v_auth_user_id IS NULL THEN
            RAISE EXCEPTION 'Usuário não encontrado para o ID fornecido';
        END IF;
    ELSIF auth.uid() IS NOT NULL THEN
        v_auth_user_id := auth.uid();
    ELSE
        -- Usar um super_admin como fallback
        SELECT auth_user_id INTO v_auth_user_id
        FROM users 
        WHERE role = 'super_admin' 
        LIMIT 1;
        
        IF v_auth_user_id IS NULL THEN
            RAISE EXCEPTION 'Nenhum usuário válido encontrado para criar o agendamento';
        END IF;
    END IF;
    
    -- Verificar permissão usando auth_user_id
    IF NOT can_manage_schedule_type(v_auth_user_id, 'nps') THEN
        RAISE EXCEPTION 'Usuário não tem permissão para criar agendamentos NPS';
    END IF;
    
    -- Determinar next_execution_at
    IF p_schedule_type = 'immediate' THEN
        v_next_execution_at := NOW();
    ELSIF p_scheduled_at IS NOT NULL THEN
        v_next_execution_at := p_scheduled_at;
    ELSE
        v_next_execution_at := NOW();
    END IF;
    
    -- Extrair target_users dos filtros
    IF p_target_filters ? 'user_ids' THEN
        v_target_users := p_target_filters->'user_ids';
    ELSE
        v_target_users := '[]'::jsonb;
    END IF;
    
    -- Inserir o agendamento usando a nova estrutura da tabela
    INSERT INTO message_schedules (
        type,
        title,
        description,
        content,
        target_users,
        schedule_type,
        scheduled_for,
        recurrence_pattern,
        status,
        next_execution_at,
        created_by
    ) VALUES (
        'nps',
        p_title,
        p_message,
        jsonb_build_object(
            'survey_id', p_nps_data->>'survey_id',
            'survey_title', p_nps_data->>'survey_title',
            'message', p_nps_data->>'message',
            'send_via_whatsapp', COALESCE((p_nps_data->>'send_via_whatsapp')::boolean, true),
            'include_link', COALESCE((p_nps_data->>'include_link')::boolean, true),
            'custom_message', p_nps_data->>'custom_message',
            'channel', p_channel
        ),
        v_target_users,
        p_schedule_type,
        p_scheduled_at,
        p_recurring_pattern,
        'pending',
        v_next_execution_at,
        v_auth_user_id
    ) RETURNING id INTO v_schedule_id;
    
    -- Log da criação
    INSERT INTO message_schedule_logs (
        schedule_id,
        log_type,
        message,
        details
    ) VALUES (
        v_schedule_id,
        'info',
        'Agendamento NPS criado com sucesso',
        jsonb_build_object(
            'title', p_title,
            'schedule_type', p_schedule_type,
            'target_count', jsonb_array_length(v_target_users),
            'created_by', v_auth_user_id
        )
    );
    
    RETURN v_schedule_id;
END;
$$;

-- Comentário da função
COMMENT ON FUNCTION public.create_nps_schedule IS 'Cria um agendamento NPS usando a nova estrutura unificada da tabela message_schedules';