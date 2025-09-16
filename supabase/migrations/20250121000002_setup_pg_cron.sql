-- Configuração do pg_cron para processamento automático de agendamentos

-- Habilitar a extensão pg_cron (se não estiver habilitada)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 1. Job principal: Processar agendamentos de mensagens a cada minuto
SELECT cron.schedule(
    'process-message-schedules',
    '* * * * *', -- A cada minuto
    'SELECT process_message_schedules();'
);

-- 2. Job de limpeza: Limpar logs antigos diariamente às 02:00
SELECT cron.schedule(
    'cleanup-old-logs',
    '0 2 * * *', -- Diariamente às 02:00
    $$
    DELETE FROM message_schedule_logs 
    WHERE created_at < NOW() - INTERVAL '30 days';
    $$
);

-- 3. Job de estatísticas: Atualizar estatísticas diárias às 01:00
SELECT cron.schedule(
    'update-daily-stats',
    '0 1 * * *', -- Diariamente às 01:00
    $$
    INSERT INTO message_schedule_logs (
        schedule_id,
        log_type,
        message,
        details
    ) 
    SELECT 
        NULL,
        'daily_stats',
        'Estatísticas diárias atualizadas',
        get_schedule_statistics();
    $$
);

-- 4. Job de verificação de saúde: Verificar sistema a cada 5 minutos
SELECT cron.schedule(
    'health-check',
    '*/5 * * * *', -- A cada 5 minutos
    $$
    DO $$
    DECLARE
        failed_schedules INTEGER;
        stuck_schedules INTEGER;
    BEGIN
        -- Verificar agendamentos falhados nas últimas 24h
        SELECT COUNT(*) INTO failed_schedules
        FROM message_schedules
        WHERE status = 'failed'
        AND updated_at > NOW() - INTERVAL '24 hours';
        
        -- Verificar agendamentos "presos" em processamento por mais de 10 minutos
        SELECT COUNT(*) INTO stuck_schedules
        FROM message_schedules
        WHERE status = 'processing'
        AND updated_at < NOW() - INTERVAL '10 minutes';
        
        -- Resetar agendamentos presos
        IF stuck_schedules > 0 THEN
            UPDATE message_schedules
            SET status = 'pending',
                retry_count = retry_count + 1,
                next_execution_at = NOW() + INTERVAL '1 minute'
            WHERE status = 'processing'
            AND updated_at < NOW() - INTERVAL '10 minutes';
            
            PERFORM send_system_alert(
                'stuck_schedules',
                'Resetados ' || stuck_schedules || ' agendamentos presos',
                'warning'
            );
        END IF;
        
        -- Alertar sobre muitas falhas
        IF failed_schedules > 10 THEN
            PERFORM send_system_alert(
                'high_failure_rate',
                'Alto número de falhas: ' || failed_schedules || ' nas últimas 24h',
                'error'
            );
        END IF;
    END
    $$;
    $$
);

-- 5. Job de backup de configurações: Backup semanal aos domingos às 03:00
SELECT cron.schedule(
    'backup-schedules',
    '0 3 * * 0', -- Domingos às 03:00
    $$
    INSERT INTO message_schedule_logs (
        schedule_id,
        log_type,
        message,
        details
    )
    SELECT 
        NULL,
        'backup',
        'Backup semanal de agendamentos',
        jsonb_build_object(
            'total_schedules', COUNT(*),
            'active_schedules', COUNT(*) FILTER (WHERE status IN ('pending', 'processing')),
            'backup_date', CURRENT_DATE
        )
    FROM message_schedules;
    $$
);

-- Funções auxiliares para gerenciar jobs do cron

-- Função para pausar um job específico
CREATE OR REPLACE FUNCTION pause_cron_job(job_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    PERFORM cron.unschedule(job_name);
    
    INSERT INTO message_schedule_logs (
        schedule_id,
        log_type,
        message,
        details
    ) VALUES (
        NULL,
        'cron_management',
        'Job pausado: ' || job_name,
        jsonb_build_object(
            'action', 'pause',
            'job_name', job_name,
            'timestamp', NOW()
        )
    );
    
    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Função para reativar um job específico
CREATE OR REPLACE FUNCTION resume_cron_job(
    job_name TEXT,
    schedule_expression TEXT,
    command TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    PERFORM cron.schedule(job_name, schedule_expression, command);
    
    INSERT INTO message_schedule_logs (
        schedule_id,
        log_type,
        message,
        details
    ) VALUES (
        NULL,
        'cron_management',
        'Job reativado: ' || job_name,
        jsonb_build_object(
            'action', 'resume',
            'job_name', job_name,
            'schedule', schedule_expression,
            'timestamp', NOW()
        )
    );
    
    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Função para listar jobs ativos
CREATE OR REPLACE FUNCTION list_cron_jobs()
RETURNS TABLE(
    jobid BIGINT,
    schedule TEXT,
    command TEXT,
    nodename TEXT,
    nodeport INTEGER,
    database TEXT,
    username TEXT,
    active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        j.jobid,
        j.schedule,
        j.command,
        j.nodename,
        j.nodeport,
        j.database,
        j.username,
        j.active
    FROM cron.job j
    ORDER BY j.jobid;
END;
$$;

-- Função para obter estatísticas dos jobs
CREATE OR REPLACE FUNCTION get_cron_job_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'totalJobs', (
            SELECT COUNT(*) FROM cron.job WHERE active = TRUE
        ),
        'lastExecutions', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'jobname', jobname,
                    'start_time', start_time,
                    'end_time', end_time,
                    'return_message', return_message,
                    'status', status
                )
            )
            FROM (
                SELECT *
                FROM cron.job_run_details
                ORDER BY start_time DESC
                LIMIT 10
            ) recent_runs
        ),
        'successRate', (
            SELECT ROUND(
                CASE 
                    WHEN COUNT(*) = 0 THEN 0
                    ELSE (COUNT(*) FILTER (WHERE status = 'succeeded') * 100.0) / COUNT(*)
                END, 2
            )
            FROM cron.job_run_details
            WHERE start_time > NOW() - INTERVAL '24 hours'
        )
    ) INTO stats;
    
    RETURN stats;
END;
$$;

-- Inserir configurações padrão de alertas do sistema
INSERT INTO system_alerts (alert_type, description, is_active, config) VALUES
('high_failure_rate', 'Alerta para alta taxa de falhas', TRUE, 
    jsonb_build_object(
        'threshold', 10,
        'timeframe', '24 hours',
        'severity', 'error'
    )
),
('stuck_schedules', 'Alerta para agendamentos presos', TRUE,
    jsonb_build_object(
        'timeout', '10 minutes',
        'severity', 'warning'
    )
),
('system_health', 'Verificação geral de saúde do sistema', TRUE,
    jsonb_build_object(
        'check_interval', '5 minutes',
        'severity', 'info'
    )
)
ON CONFLICT (alert_type) DO UPDATE SET
    description = EXCLUDED.description,
    config = EXCLUDED.config,
    updated_at = NOW();

-- Log da configuração inicial
INSERT INTO message_schedule_logs (
    schedule_id,
    log_type,
    message,
    details
) VALUES (
    NULL,
    'system_setup',
    'Sistema de agendamento configurado com pg_cron',
    jsonb_build_object(
        'jobs_created', 5,
        'alerts_configured', 3,
        'setup_date', NOW()
    )
);