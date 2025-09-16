-- Funções RPC para o sistema unificado de agendamento de mensagens

-- 1. Função para verificar se um agendamento condicional deve ser executado
CREATE OR REPLACE FUNCTION should_execute_conditional(schedule_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    schedule_record RECORD;
    condition_met BOOLEAN := FALSE;
BEGIN
    SELECT * INTO schedule_record
    FROM message_schedules
    WHERE id = schedule_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar condições baseadas no tipo de conteúdo
    IF schedule_record.content->>'trigger_type' = 'birthday' THEN
        -- Verificar aniversários
        SELECT EXISTS(
            SELECT 1 FROM users
            WHERE DATE_PART('month', birth_date) = DATE_PART('month', CURRENT_DATE)
            AND DATE_PART('day', birth_date) = DATE_PART('day', CURRENT_DATE)
        ) INTO condition_met;
    ELSIF schedule_record.content->>'trigger_type' = 'document_expiry' THEN
        -- Verificar vencimento de documentos
        SELECT EXISTS(
            SELECT 1 FROM employee_documents ed
            JOIN users u ON ed.employee_id = u.id
            WHERE ed.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
            AND ed.expiry_date > CURRENT_DATE
        ) INTO condition_met;
    ELSIF schedule_record.content->>'trigger_type' = 'evaluation_reminder' THEN
        -- Verificar lembretes de avaliação
        SELECT EXISTS(
            SELECT 1 FROM evaluations e
            WHERE e.due_date <= CURRENT_DATE + INTERVAL '7 days'
            AND e.due_date > CURRENT_DATE
            AND e.status = 'pending'
        ) INTO condition_met;
    END IF;
    
    RETURN condition_met;
END;
$$;

-- 2. Função para processar agendamentos de notificações
CREATE OR REPLACE FUNCTION process_notification_schedule(schedule_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    schedule_record RECORD;
    target_user_id UUID;
    notification_id UUID;
BEGIN
    SELECT * INTO schedule_record
    FROM message_schedules
    WHERE id = schedule_id;
    
    -- Processar cada usuário alvo
    FOR target_user_id IN 
        SELECT jsonb_array_elements_text(schedule_record.target_users)::UUID
    LOOP
        -- Criar notificação
        INSERT INTO notifications (
            title,
            message,
            type,
            user_id,
            created_at
        ) VALUES (
            schedule_record.title,
            schedule_record.content->>'message',
            schedule_record.content->>'notification_type',
            target_user_id,
            NOW()
        ) RETURNING id INTO notification_id;
        
        -- Log da execução
        INSERT INTO message_schedule_logs (
            schedule_id,
            log_type,
            message,
            details
        ) VALUES (
            schedule_id,
            'success',
            'Notificação criada com sucesso',
            jsonb_build_object(
                'notification_id', notification_id,
                'user_id', target_user_id
            )
        );
    END LOOP;
    
    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    -- Log do erro
    INSERT INTO message_schedule_logs (
        schedule_id,
        log_type,
        message,
        details
    ) VALUES (
        schedule_id,
        'error',
        'Erro ao processar notificação: ' || SQLERRM,
        jsonb_build_object(
            'sqlstate', SQLSTATE,
            'error_detail', SQLERRM
        )
    );
    
    RETURN FALSE;
END;
$$;

-- 3. Função para processar agendamentos de NPS
CREATE OR REPLACE FUNCTION process_nps_schedule(schedule_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    schedule_record RECORD;
    target_user_id UUID;
    survey_id UUID;
    send_id UUID;
BEGIN
    SELECT * INTO schedule_record
    FROM message_schedules
    WHERE id = schedule_id;
    
    survey_id := (schedule_record.content->>'survey_id')::UUID;
    
    -- Processar cada usuário alvo
    FOR target_user_id IN 
        SELECT jsonb_array_elements_text(schedule_record.target_users)::UUID
    LOOP
        -- Criar registro de envio NPS
        INSERT INTO whatsapp_sends (
            survey_id,
            user_id,
            phone_number,
            message_content,
            status,
            scheduled_for,
            created_at
        ) 
        SELECT 
            survey_id,
            target_user_id,
            u.phone,
            schedule_record.content->>'message_template',
            'pending',
            NOW(),
            NOW()
        FROM users u
        WHERE u.id = target_user_id
        RETURNING id INTO send_id;
        
        -- Log da execução
        INSERT INTO message_schedule_logs (
            schedule_id,
            log_type,
            message,
            details
        ) VALUES (
            schedule_id,
            'success',
            'Envio NPS agendado com sucesso',
            jsonb_build_object(
                'send_id', send_id,
                'user_id', target_user_id,
                'survey_id', survey_id
            )
        );
    END LOOP;
    
    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    -- Log do erro
    INSERT INTO message_schedule_logs (
        schedule_id,
        log_type,
        message,
        details
    ) VALUES (
        schedule_id,
        'error',
        'Erro ao processar NPS: ' || SQLERRM,
        jsonb_build_object(
            'sqlstate', SQLSTATE,
            'error_detail', SQLERRM
        )
    );
    
    RETURN FALSE;
END;
$$;

-- 4. Função para processar agendamentos de WhatsApp
CREATE OR REPLACE FUNCTION process_whatsapp_schedule(schedule_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    schedule_record RECORD;
    target_user_id UUID;
    message_id UUID;
BEGIN
    SELECT * INTO schedule_record
    FROM message_schedules
    WHERE id = schedule_id;
    
    -- Processar cada usuário alvo
    FOR target_user_id IN 
        SELECT jsonb_array_elements_text(schedule_record.target_users)::UUID
    LOOP
        -- Criar mensagem WhatsApp
        INSERT INTO whatsapp_messages (
            recipient_id,
            message_content,
            message_type,
            status,
            scheduled_for,
            created_at
        ) 
        SELECT 
            target_user_id,
            schedule_record.content->>'message',
            COALESCE(schedule_record.content->>'message_type', 'text'),
            'pending',
            NOW(),
            NOW()
        RETURNING id INTO message_id;
        
        -- Log da execução
        INSERT INTO message_schedule_logs (
            schedule_id,
            log_type,
            message,
            details
        ) VALUES (
            schedule_id,
            'success',
            'Mensagem WhatsApp agendada com sucesso',
            jsonb_build_object(
                'message_id', message_id,
                'user_id', target_user_id
            )
        );
    END LOOP;
    
    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    -- Log do erro
    INSERT INTO message_schedule_logs (
        schedule_id,
        log_type,
        message,
        details
    ) VALUES (
        schedule_id,
        'error',
        'Erro ao processar WhatsApp: ' || SQLERRM,
        jsonb_build_object(
            'sqlstate', SQLSTATE,
            'error_detail', SQLERRM
        )
    );
    
    RETURN FALSE;
END;
$$;

-- 5. Função para processar agendamentos de email
CREATE OR REPLACE FUNCTION process_email_schedule(schedule_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    schedule_record RECORD;
    target_user_id UUID;
    email_id UUID;
BEGIN
    SELECT * INTO schedule_record
    FROM message_schedules
    WHERE id = schedule_id;
    
    -- Processar cada usuário alvo
    FOR target_user_id IN 
        SELECT jsonb_array_elements_text(schedule_record.target_users)::UUID
    LOOP
        -- Criar email (assumindo que existe uma tabela email_queue)
        INSERT INTO email_queue (
            recipient_id,
            subject,
            body,
            status,
            scheduled_for,
            created_at
        ) 
        SELECT 
            target_user_id,
            schedule_record.title,
            schedule_record.content->>'body',
            'pending',
            NOW(),
            NOW()
        RETURNING id INTO email_id;
        
        -- Log da execução
        INSERT INTO message_schedule_logs (
            schedule_id,
            log_type,
            message,
            details
        ) VALUES (
            schedule_id,
            'success',
            'Email agendado com sucesso',
            jsonb_build_object(
                'email_id', email_id,
                'user_id', target_user_id
            )
        );
    END LOOP;
    
    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    -- Log do erro
    INSERT INTO message_schedule_logs (
        schedule_id,
        log_type,
        message,
        details
    ) VALUES (
        schedule_id,
        'error',
        'Erro ao processar email: ' || SQLERRM,
        jsonb_build_object(
            'sqlstate', SQLSTATE,
            'error_detail', SQLERRM
        )
    );
    
    RETURN FALSE;
END;
$$;

-- 6. Função para calcular próxima execução de agendamentos recorrentes
CREATE OR REPLACE FUNCTION calculate_next_execution(schedule_id UUID)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
AS $$
DECLARE
    schedule_record RECORD;
    frequency TEXT;
    next_exec TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT * INTO schedule_record
    FROM message_schedules
    WHERE id = schedule_id;
    
    frequency := schedule_record.recurrence_pattern->>'frequency';
    
    CASE frequency
        WHEN 'daily' THEN
            next_exec := schedule_record.last_executed_at + INTERVAL '1 day';
        WHEN 'weekly' THEN
            next_exec := schedule_record.last_executed_at + INTERVAL '1 week';
        WHEN 'monthly' THEN
            next_exec := schedule_record.last_executed_at + INTERVAL '1 month';
        WHEN 'quarterly' THEN
            next_exec := schedule_record.last_executed_at + INTERVAL '3 months';
        WHEN 'yearly' THEN
            next_exec := schedule_record.last_executed_at + INTERVAL '1 year';
        ELSE
            next_exec := NULL;
    END CASE;
    
    -- Ajustar horário se especificado
    IF schedule_record.recurrence_pattern ? 'time' THEN
        next_exec := DATE_TRUNC('day', next_exec) + 
                    (schedule_record.recurrence_pattern->>'time')::TIME;
    END IF;
    
    RETURN next_exec;
END;
$$;

-- 7. Função principal de processamento de agendamentos
CREATE OR REPLACE FUNCTION process_message_schedules()
RETURNS TABLE(processed INTEGER, success INTEGER, errors INTEGER)
LANGUAGE plpgsql
AS $$
DECLARE
    schedule_record RECORD;
    processed_count INTEGER := 0;
    success_count INTEGER := 0;
    error_count INTEGER := 0;
    execution_success BOOLEAN;
    next_exec TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Processar agendamentos pendentes
    FOR schedule_record IN 
        SELECT * FROM message_schedules 
        WHERE status = 'pending' 
        AND (
            (schedule_type = 'immediate' AND scheduled_for <= NOW()) OR
            (schedule_type = 'recurring' AND next_execution_at <= NOW()) OR
            (schedule_type = 'conditional' AND should_execute_conditional(id))
        )
        ORDER BY scheduled_for ASC
        LIMIT 100
    LOOP
        BEGIN
            -- Atualizar status para processando
            UPDATE message_schedules 
            SET status = 'processing', updated_at = NOW()
            WHERE id = schedule_record.id;
            
            -- Processar por tipo
            CASE schedule_record.type
                WHEN 'notification' THEN
                    execution_success := process_notification_schedule(schedule_record.id);
                WHEN 'nps' THEN
                    execution_success := process_nps_schedule(schedule_record.id);
                WHEN 'whatsapp' THEN
                    execution_success := process_whatsapp_schedule(schedule_record.id);
                WHEN 'email' THEN
                    execution_success := process_email_schedule(schedule_record.id);
                ELSE
                    execution_success := FALSE;
            END CASE;
            
            processed_count := processed_count + 1;
            
            IF execution_success THEN
                success_count := success_count + 1;
                
                -- Atualizar status e calcular próxima execução se recorrente
                IF schedule_record.schedule_type = 'recurring' THEN
                    next_exec := calculate_next_execution(schedule_record.id);
                    
                    UPDATE message_schedules 
                    SET 
                        status = 'pending',
                        last_executed_at = NOW(),
                        next_execution_at = next_exec,
                        retry_count = 0,
                        updated_at = NOW()
                    WHERE id = schedule_record.id;
                ELSE
                    UPDATE message_schedules 
                    SET 
                        status = 'completed',
                        last_executed_at = NOW(),
                        retry_count = 0,
                        updated_at = NOW()
                    WHERE id = schedule_record.id;
                END IF;
            ELSE
                error_count := error_count + 1;
                
                -- Verificar se deve tentar novamente
                IF schedule_record.retry_count < schedule_record.max_retries THEN
                    UPDATE message_schedules 
                    SET 
                        status = 'pending',
                        retry_count = retry_count + 1,
                        next_execution_at = NOW() + INTERVAL '5 minutes',
                        updated_at = NOW()
                    WHERE id = schedule_record.id;
                ELSE
                    UPDATE message_schedules 
                    SET 
                        status = 'failed',
                        updated_at = NOW()
                    WHERE id = schedule_record.id;
                END IF;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            error_count := error_count + 1;
            
            -- Log do erro
            INSERT INTO message_schedule_logs (
                schedule_id,
                log_type,
                message,
                details
            ) VALUES (
                schedule_record.id,
                'error',
                'Erro geral no processamento: ' || SQLERRM,
                jsonb_build_object(
                    'sqlstate', SQLSTATE,
                    'error_detail', SQLERRM
                )
            );
            
            UPDATE message_schedules 
            SET 
                status = 'failed',
                retry_count = retry_count + 1,
                updated_at = NOW()
            WHERE id = schedule_record.id;
        END;
    END LOOP;
    
    RETURN QUERY SELECT processed_count, success_count, error_count;
END;
$$;

-- 8. Função para criar agendamento
CREATE OR REPLACE FUNCTION create_message_schedule(
    p_type TEXT,
    p_title TEXT,
    p_description TEXT DEFAULT NULL,
    p_content JSONB,
    p_target_users JSONB,
    p_schedule_type TEXT,
    p_scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_recurrence_pattern JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_schedule_id UUID;
    next_exec TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calcular próxima execução
    IF p_schedule_type = 'immediate' THEN
        next_exec := COALESCE(p_scheduled_for, NOW());
    ELSIF p_schedule_type = 'recurring' THEN
        next_exec := COALESCE(p_scheduled_for, NOW());
    ELSIF p_schedule_type = 'conditional' THEN
        next_exec := NOW(); -- Será verificado pela função should_execute_conditional
    END IF;
    
    -- Inserir agendamento
    INSERT INTO message_schedules (
        type,
        title,
        description,
        content,
        target_users,
        schedule_type,
        scheduled_for,
        recurrence_pattern,
        next_execution_at,
        created_by
    ) VALUES (
        p_type,
        p_title,
        p_description,
        p_content,
        p_target_users,
        p_schedule_type,
        p_scheduled_for,
        p_recurrence_pattern,
        next_exec,
        auth.uid()
    ) RETURNING id INTO new_schedule_id;
    
    -- Log da criação
    INSERT INTO message_schedule_logs (
        schedule_id,
        log_type,
        message,
        details
    ) VALUES (
        new_schedule_id,
        'info',
        'Agendamento criado com sucesso',
        jsonb_build_object(
            'type', p_type,
            'schedule_type', p_schedule_type,
            'created_by', auth.uid()
        )
    );
    
    RETURN new_schedule_id;
END;
$$;

-- 9. Função para obter estatísticas de agendamentos
CREATE OR REPLACE FUNCTION get_schedule_statistics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'activeSchedules', (
            SELECT COUNT(*) FROM message_schedules 
            WHERE status IN ('pending', 'processing')
        ),
        'completedToday', (
            SELECT COUNT(*) FROM message_schedules 
            WHERE status = 'completed' 
            AND DATE(last_executed_at) = CURRENT_DATE
        ),
        'failuresToday', (
            SELECT COUNT(*) FROM message_schedules 
            WHERE status = 'failed' 
            AND DATE(updated_at) = CURRENT_DATE
        ),
        'successRate', (
            SELECT ROUND(
                CASE 
                    WHEN COUNT(*) = 0 THEN 0
                    ELSE (COUNT(*) FILTER (WHERE status = 'completed') * 100.0) / COUNT(*)
                END, 2
            )
            FROM message_schedules 
            WHERE DATE(updated_at) >= CURRENT_DATE - INTERVAL '7 days'
        ),
        'nextExecution', (
            SELECT TO_CHAR(MIN(next_execution_at), 'DD/MM/YYYY HH24:MI')
            FROM message_schedules 
            WHERE status = 'pending' 
            AND next_execution_at > NOW()
        ),
        'totalByType', (
            SELECT jsonb_object_agg(type, count)
            FROM (
                SELECT type, COUNT(*) as count
                FROM message_schedules
                GROUP BY type
            ) t
        )
    ) INTO stats;
    
    RETURN stats;
END;
$$;

-- 10. Função para enviar alertas do sistema
CREATE OR REPLACE FUNCTION send_system_alert(
    alert_type TEXT,
    message TEXT,
    severity TEXT DEFAULT 'warning'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    alert_config RECORD;
BEGIN
    -- Buscar configuração do alerta
    SELECT * INTO alert_config
    FROM system_alerts
    WHERE alert_type = send_system_alert.alert_type
    AND is_active = TRUE
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Registrar o alerta
    INSERT INTO message_schedule_logs (
        schedule_id,
        log_type,
        message,
        details
    ) VALUES (
        NULL,
        'system_alert',
        message,
        jsonb_build_object(
            'alert_type', alert_type,
            'severity', severity,
            'timestamp', NOW()
        )
    );
    
    -- Aqui seria implementada a lógica de envio
    -- (email, webhook, etc.)
    
    RETURN TRUE;
END;
$$;