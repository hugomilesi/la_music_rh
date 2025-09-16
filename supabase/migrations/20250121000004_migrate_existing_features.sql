-- Migração das funcionalidades existentes para o sistema unificado
-- Preserva dados e funcionalidades de notificações, NPS e WhatsApp

-- 1. Migrar dados existentes de notificações para message_schedules
INSERT INTO public.message_schedules (
    type,
    title,
    description,
    content,
    target_users,
    schedule_type,
    status,
    scheduled_for,
    created_by,
    created_at,
    updated_at
)
SELECT 
    'notification' as type,
    n.title,
    n.description,
    jsonb_build_object(
        'message', n.message,
        'channel', n.channel,
        'priority', n.priority,
        'notification_type', n.type
    ) as content,
    CASE 
        WHEN n.target_users IS NOT NULL THEN n.target_users
        ELSE '[]'::jsonb
    END as target_users,
    CASE 
        WHEN n.scheduled_for IS NOT NULL THEN 'recurring'
        ELSE 'immediate'
    END as schedule_type,
    CASE 
        WHEN n.status = 'enviado' THEN 'completed'
        WHEN n.status = 'programado' THEN 'pending'
        WHEN n.status = 'rascunho' THEN 'pending'
        WHEN n.status = 'falhado' THEN 'failed'
        ELSE 'pending'
    END as status,
    n.scheduled_for,
    n.created_by,
    n.created_at,
    n.updated_at
FROM public.notifications n
WHERE n.id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 2. Migrar agendamentos de NPS existentes
INSERT INTO public.message_schedules (
    type,
    title,
    description,
    content,
    target_users,
    schedule_type,
    status,
    scheduled_for,
    recurrence_pattern,
    created_by,
    created_at,
    updated_at
)
SELECT 
    'nps' as type,
    COALESCE(ns.name, 'Agendamento NPS') as title,
    ns.description,
    jsonb_build_object(
        'survey_id', ns.survey_id,
        'message_template', ns.message_template,
        'auto_send', ns.auto_send,
        'target_criteria', ns.target_criteria
    ) as content,
    COALESCE(ns.target_users, '[]'::jsonb) as target_users,
    CASE 
        WHEN ns.frequency IS NOT NULL THEN 'recurring'
        ELSE 'immediate'
    END as schedule_type,
    CASE 
        WHEN ns.is_active = true THEN 'pending'
        ELSE 'cancelled'
    END as status,
    ns.scheduled_for,
    CASE 
        WHEN ns.frequency IS NOT NULL THEN jsonb_build_object(
            'frequency', ns.frequency,
            'time', ns.send_time,
            'day_of_week', ns.day_of_week,
            'day_of_month', ns.day_of_month
        )
        ELSE NULL
    END as recurrence_pattern,
    ns.created_by,
    ns.created_at,
    ns.updated_at
FROM public.nps_schedules ns
WHERE ns.id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 3. Migrar agendamentos de WhatsApp existentes
INSERT INTO public.message_schedules (
    type,
    title,
    description,
    content,
    target_users,
    schedule_type,
    status,
    scheduled_for,
    created_by,
    created_at,
    updated_at
)
SELECT 
    'whatsapp' as type,
    COALESCE(ws.title, 'Mensagem WhatsApp') as title,
    ws.description,
    jsonb_build_object(
        'message', ws.message_content,
        'message_type', COALESCE(ws.message_type, 'text'),
        'template_id', ws.template_id,
        'media_url', ws.media_url
    ) as content,
    CASE 
        WHEN ws.target_users IS NOT NULL THEN ws.target_users
        WHEN ws.phone_numbers IS NOT NULL THEN ws.phone_numbers
        ELSE '[]'::jsonb
    END as target_users,
    'immediate' as schedule_type,
    CASE 
        WHEN ws.status = 'sent' THEN 'completed'
        WHEN ws.status = 'pending' THEN 'pending'
        WHEN ws.status = 'failed' THEN 'failed'
        WHEN ws.status = 'cancelled' THEN 'cancelled'
        ELSE 'pending'
    END as status,
    ws.scheduled_for,
    ws.created_by,
    ws.created_at,
    ws.updated_at
FROM public.whatsapp_schedules ws
WHERE ws.id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 4. Criar função para compatibilidade com sistema antigo de notificações
CREATE OR REPLACE FUNCTION create_legacy_notification(
    p_title VARCHAR,
    p_message TEXT,
    p_type VARCHAR DEFAULT 'comunicado',
    p_channel VARCHAR DEFAULT 'ambos',
    p_priority VARCHAR DEFAULT 'normal',
    p_target_users JSONB DEFAULT '[]',
    p_scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_created_by UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    schedule_id UUID;
BEGIN
    -- Criar agendamento no sistema unificado
    INSERT INTO message_schedules (
        type,
        title,
        content,
        target_users,
        schedule_type,
        scheduled_for,
        created_by
    ) VALUES (
        'notification',
        p_title,
        jsonb_build_object(
            'message', p_message,
            'channel', p_channel,
            'priority', p_priority,
            'notification_type', p_type
        ),
        p_target_users,
        CASE WHEN p_scheduled_for IS NOT NULL THEN 'recurring' ELSE 'immediate' END,
        p_scheduled_for,
        p_created_by
    ) RETURNING id INTO schedule_id;
    
    RETURN schedule_id;
END;
$$;

-- 5. Criar função para compatibilidade com sistema antigo de NPS
CREATE OR REPLACE FUNCTION create_legacy_nps_schedule(
    p_survey_id UUID,
    p_name VARCHAR DEFAULT 'Agendamento NPS',
    p_message_template TEXT DEFAULT NULL,
    p_target_users JSONB DEFAULT '[]',
    p_frequency VARCHAR DEFAULT NULL,
    p_send_time TIME DEFAULT '09:00',
    p_created_by UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    schedule_id UUID;
BEGIN
    -- Criar agendamento no sistema unificado
    INSERT INTO message_schedules (
        type,
        title,
        content,
        target_users,
        schedule_type,
        recurrence_pattern,
        created_by
    ) VALUES (
        'nps',
        p_name,
        jsonb_build_object(
            'survey_id', p_survey_id,
            'message_template', p_message_template
        ),
        p_target_users,
        CASE WHEN p_frequency IS NOT NULL THEN 'recurring' ELSE 'immediate' END,
        CASE 
            WHEN p_frequency IS NOT NULL THEN jsonb_build_object(
                'frequency', p_frequency,
                'time', p_send_time::TEXT
            )
            ELSE NULL
        END,
        p_created_by
    ) RETURNING id INTO schedule_id;
    
    RETURN schedule_id;
END;
$$;

-- 6. Criar função para compatibilidade com sistema antigo de WhatsApp
CREATE OR REPLACE FUNCTION create_legacy_whatsapp_schedule(
    p_message TEXT,
    p_phone_numbers JSONB DEFAULT '[]',
    p_message_type VARCHAR DEFAULT 'text',
    p_scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_created_by UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    schedule_id UUID;
BEGIN
    -- Criar agendamento no sistema unificado
    INSERT INTO message_schedules (
        type,
        title,
        content,
        target_users,
        schedule_type,
        scheduled_for,
        created_by
    ) VALUES (
        'whatsapp',
        'Mensagem WhatsApp',
        jsonb_build_object(
            'message', p_message,
            'message_type', p_message_type
        ),
        p_phone_numbers,
        CASE WHEN p_scheduled_for IS NOT NULL THEN 'recurring' ELSE 'immediate' END,
        p_scheduled_for,
        p_created_by
    ) RETURNING id INTO schedule_id;
    
    RETURN schedule_id;
END;
$$;

-- 7. Criar views de compatibilidade para manter APIs existentes
CREATE OR REPLACE VIEW legacy_notifications AS
SELECT 
    ms.id,
    ms.title,
    ms.description,
    ms.content->>'message' as message,
    ms.content->>'notification_type' as type,
    ms.content->>'channel' as channel,
    ms.content->>'priority' as priority,
    ms.target_users,
    CASE 
        WHEN ms.status = 'completed' THEN 'enviado'
        WHEN ms.status = 'pending' THEN 'programado'
        WHEN ms.status = 'failed' THEN 'falhado'
        ELSE 'rascunho'
    END as status,
    ms.scheduled_for,
    ms.created_by,
    ms.created_at,
    ms.updated_at
FROM message_schedules ms
WHERE ms.type = 'notification';

CREATE OR REPLACE VIEW legacy_nps_schedules AS
SELECT 
    ms.id,
    ms.title as name,
    ms.description,
    (ms.content->>'survey_id')::UUID as survey_id,
    ms.content->>'message_template' as message_template,
    ms.target_users,
    ms.recurrence_pattern->>'frequency' as frequency,
    (ms.recurrence_pattern->>'time')::TIME as send_time,
    (ms.recurrence_pattern->>'day_of_week')::INTEGER as day_of_week,
    (ms.recurrence_pattern->>'day_of_month')::INTEGER as day_of_month,
    CASE WHEN ms.status != 'cancelled' THEN true ELSE false END as is_active,
    ms.scheduled_for,
    ms.created_by,
    ms.created_at,
    ms.updated_at
FROM message_schedules ms
WHERE ms.type = 'nps';

CREATE OR REPLACE VIEW legacy_whatsapp_schedules AS
SELECT 
    ms.id,
    ms.title,
    ms.description,
    ms.content->>'message' as message_content,
    ms.content->>'message_type' as message_type,
    ms.content->>'template_id' as template_id,
    ms.content->>'media_url' as media_url,
    ms.target_users as phone_numbers,
    CASE 
        WHEN ms.status = 'completed' THEN 'sent'
        WHEN ms.status = 'pending' THEN 'pending'
        WHEN ms.status = 'failed' THEN 'failed'
        WHEN ms.status = 'cancelled' THEN 'cancelled'
        ELSE 'pending'
    END as status,
    ms.scheduled_for,
    ms.created_by,
    ms.created_at,
    ms.updated_at
FROM message_schedules ms
WHERE ms.type = 'whatsapp';

-- 8. Comentários para documentação
COMMENT ON FUNCTION create_legacy_notification IS 'Função de compatibilidade para criar notificações usando o sistema antigo';
COMMENT ON FUNCTION create_legacy_nps_schedule IS 'Função de compatibilidade para criar agendamentos NPS usando o sistema antigo';
COMMENT ON FUNCTION create_legacy_whatsapp_schedule IS 'Função de compatibilidade para criar agendamentos WhatsApp usando o sistema antigo';
COMMENT ON VIEW legacy_notifications IS 'View de compatibilidade para notificações do sistema antigo';
COMMENT ON VIEW legacy_nps_schedules IS 'View de compatibilidade para agendamentos NPS do sistema antigo';
COMMENT ON VIEW legacy_whatsapp_schedules IS 'View de compatibilidade para agendamentos WhatsApp do sistema antigo';

-- 9. Inserir log da migração
INSERT INTO message_schedule_logs (
    schedule_id,
    log_type,
    message,
    details
) VALUES (
    gen_random_uuid(),
    'system_alert',
    'Migração de funcionalidades existentes concluída',
    jsonb_build_object(
        'migration_date', NOW(),
        'migrated_tables', ARRAY['notifications', 'nps_schedules', 'whatsapp_schedules'],
        'compatibility_functions', ARRAY['create_legacy_notification', 'create_legacy_nps_schedule', 'create_legacy_whatsapp_schedule'],
        'compatibility_views', ARRAY['legacy_notifications', 'legacy_nps_schedules', 'legacy_whatsapp_schedules']
    )
);