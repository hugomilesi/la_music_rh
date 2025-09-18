-- Migração para simplificar sistema NPS
-- Remove funcionalidades antigas e duplicadas, mantém apenas o essencial

-- 1. Remover funções duplicadas e antigas
DROP FUNCTION IF EXISTS public.create_legacy_nps_schedule(text, text, text, text, timestamp with time zone, jsonb, jsonb, jsonb, uuid);
DROP FUNCTION IF EXISTS public.get_nps_schedules();
DROP FUNCTION IF EXISTS public.get_nps_schedules(uuid, text, integer, integer);
DROP FUNCTION IF EXISTS public.get_pending_nps_schedules();
DROP FUNCTION IF EXISTS public.process_nps_schedule(record);
DROP FUNCTION IF EXISTS public.process_nps_schedule(public.message_schedules);
DROP FUNCTION IF EXISTS public.process_nps_schedule_for_n8n(uuid);
DROP FUNCTION IF EXISTS public.process_pending_nps_sends();
DROP FUNCTION IF EXISTS public.process_whatsapp_nps_response(character varying, integer, text, character varying);
DROP FUNCTION IF EXISTS public.validate_nps_response_token(text);
DROP FUNCTION IF EXISTS public.validate_nps_token(text);
DROP FUNCTION IF EXISTS public.validate_simple_nps_token(text);
DROP FUNCTION IF EXISTS public.fill_nps_response_data();
DROP FUNCTION IF EXISTS public.update_nps_schedules_updated_at();
DROP FUNCTION IF EXISTS public.update_nps_whatsapp_messages_updated_at();
DROP FUNCTION IF EXISTS public.update_nps_whatsapp_sends_updated_at();

-- 2. Remover triggers antigos
DROP TRIGGER IF EXISTS trigger_fill_nps_response_data ON public.nps_responses;

-- 3. Limpar tabela nps_tokens e adicionar campos necessários
TRUNCATE TABLE public.nps_tokens;

-- Adicionar campos necessários para o novo fluxo
ALTER TABLE public.nps_tokens 
ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone DEFAULT (now() + interval '7 days'),
ADD COLUMN IF NOT EXISTS department text,
ADD COLUMN IF NOT EXISTS unit text;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_nps_tokens_token ON public.nps_tokens(token);
CREATE INDEX IF NOT EXISTS idx_nps_tokens_expires_at ON public.nps_tokens(expires_at);

-- 4. Simplificar tabela nps_responses
ALTER TABLE public.nps_responses 
DROP COLUMN IF EXISTS whatsapp_message_id,
DROP COLUMN IF EXISTS sent_at,
ADD COLUMN IF NOT EXISTS token text,
ADD COLUMN IF NOT EXISTS unit text;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_nps_responses_token ON public.nps_responses(token);

-- 5. Simplificar tabela nps_surveys
ALTER TABLE public.nps_surveys 
DROP COLUMN IF EXISTS auto_send,
DROP COLUMN IF EXISTS frequency_days,
DROP COLUMN IF EXISTS last_sent_at,
DROP COLUMN IF EXISTS next_send_date,
ADD COLUMN IF NOT EXISTS use_localhost boolean DEFAULT true;

-- 6. Criar função simplificada para gerar token NPS
CREATE OR REPLACE FUNCTION public.generate_simple_nps_token(
    p_survey_id uuid,
    p_user_name text,
    p_user_phone text,
    p_department text DEFAULT NULL,
    p_unit text DEFAULT NULL
) RETURNS TABLE(
    token text,
    nps_url text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_token text;
    v_survey record;
    v_base_url text;
BEGIN
    -- Verificar se a pesquisa existe e está ativa
    SELECT * INTO v_survey 
    FROM nps_surveys 
    WHERE id = p_survey_id AND status = 'active';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pesquisa não encontrada ou não está ativa';
    END IF;
    
    -- Gerar token único
    v_token := encode(gen_random_bytes(32), 'hex');
    
    -- Inserir token na tabela
    INSERT INTO nps_tokens (
        token,
        survey_id,
        user_name,
        user_phone,
        department,
        unit,
        question,
        expires_at
    ) VALUES (
        v_token,
        p_survey_id,
        p_user_name,
        p_user_phone,
        p_department,
        p_unit,
        v_survey.question,
        now() + interval '7 days'
    );
    
    -- Determinar URL base
    IF v_survey.use_localhost THEN
        v_base_url := 'http://localhost:5173/local-nps/';
    ELSE
        v_base_url := 'https://dzmatfnltgtgjvbputtb.supabase.co/functions/v1/nps-survey/';
    END IF;
    
    RETURN QUERY SELECT 
        v_token as token,
        (v_base_url || v_token) as nps_url;
END;
$$;

-- 7. Criar função para validar token
CREATE OR REPLACE FUNCTION public.validate_nps_token_simple(
    p_token text
) RETURNS TABLE(
    is_valid boolean,
    survey_id uuid,
    user_name text,
    user_phone text,
    question text,
    department text,
    unit text,
    error_message text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_token_data record;
BEGIN
    -- Buscar dados do token
    SELECT 
        t.survey_id,
        t.user_name,
        t.user_phone,
        t.question,
        t.department,
        t.unit,
        t.expires_at,
        t.used_at,
        s.status as survey_status
    INTO v_token_data
    FROM nps_tokens t
    JOIN nps_surveys s ON s.id = t.survey_id
    WHERE t.token = p_token;
    
    -- Verificar se token existe
    IF NOT FOUND THEN
        RETURN QUERY SELECT 
            false as is_valid,
            NULL::uuid as survey_id,
            NULL::text as user_name,
            NULL::text as user_phone,
            NULL::text as question,
            NULL::text as department,
            NULL::text as unit,
            'Token não encontrado' as error_message;
        RETURN;
    END IF;
    
    -- Verificar se token já foi usado
    IF v_token_data.used_at IS NOT NULL THEN
        RETURN QUERY SELECT 
            false as is_valid,
            NULL::uuid as survey_id,
            NULL::text as user_name,
            NULL::text as user_phone,
            NULL::text as question,
            NULL::text as department,
            NULL::text as unit,
            'Token já foi utilizado' as error_message;
        RETURN;
    END IF;
    
    -- Verificar se token expirou
    IF v_token_data.expires_at < now() THEN
        RETURN QUERY SELECT 
            false as is_valid,
            NULL::uuid as survey_id,
            NULL::text as user_name,
            NULL::text as user_phone,
            NULL::text as question,
            NULL::text as department,
            NULL::text as unit,
            'Token expirado' as error_message;
        RETURN;
    END IF;
    
    -- Verificar se pesquisa está ativa
    IF v_token_data.survey_status != 'active' THEN
        RETURN QUERY SELECT 
            false as is_valid,
            NULL::uuid as survey_id,
            NULL::text as user_name,
            NULL::text as user_phone,
            NULL::text as question,
            NULL::text as department,
            NULL::text as unit,
            'Pesquisa não está ativa' as error_message;
        RETURN;
    END IF;
    
    -- Token válido
    RETURN QUERY SELECT 
        true as is_valid,
        v_token_data.survey_id,
        v_token_data.user_name,
        v_token_data.user_phone,
        v_token_data.question,
        v_token_data.department,
        v_token_data.unit,
        NULL::text as error_message;
END;
$$;

-- 8. Criar função para processar resposta NPS
CREATE OR REPLACE FUNCTION public.submit_nps_response(
    p_token text,
    p_score integer,
    p_comment text DEFAULT NULL
) RETURNS TABLE(
    success boolean,
    message text,
    response_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_token_data record;
    v_response_id uuid;
    v_category text;
BEGIN
    -- Validar token
    SELECT * INTO v_token_data
    FROM validate_nps_token_simple(p_token);
    
    IF NOT v_token_data.is_valid THEN
        RETURN QUERY SELECT 
            false as success,
            v_token_data.error_message as message,
            NULL::uuid as response_id;
        RETURN;
    END IF;
    
    -- Validar score
    IF p_score < 0 OR p_score > 10 THEN
        RETURN QUERY SELECT 
            false as success,
            'Score deve estar entre 0 e 10' as message,
            NULL::uuid as response_id;
        RETURN;
    END IF;
    
    -- Determinar categoria NPS
    IF p_score <= 6 THEN
        v_category := 'Detrator';
    ELSIF p_score <= 8 THEN
        v_category := 'Neutro';
    ELSE
        v_category := 'Promotor';
    END IF;
    
    -- Inserir resposta
    INSERT INTO nps_responses (
        survey_id,
        score,
        comment,
        category,
        department,
        token,
        unit,
        user_name,
        user_phone
    ) VALUES (
        v_token_data.survey_id,
        p_score,
        p_comment,
        v_category,
        v_token_data.department,
        p_token,
        v_token_data.unit,
        v_token_data.user_name,
        v_token_data.user_phone
    ) RETURNING id INTO v_response_id;
    
    -- Marcar token como usado
    UPDATE nps_tokens 
    SET used_at = now() 
    WHERE token = p_token;
    
    RETURN QUERY SELECT 
        true as success,
        'Resposta registrada com sucesso' as message,
        v_response_id as response_id;
END;
$$;

-- 9. Criar função para obter dados para n8n
CREATE OR REPLACE FUNCTION public.get_nps_data_for_n8n(
    p_survey_id uuid
) RETURNS TABLE(
    user_name text,
    phone_number text,
    survey_title text,
    survey_question text,
    nps_url text,
    token text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.user_name,
        t.user_phone as phone_number,
        s.title as survey_title,
        s.question as survey_question,
        CASE 
            WHEN s.use_localhost THEN 'http://localhost:5173/local-nps/' || t.token
            ELSE 'https://dzmatfnltgtgjvbputtb.supabase.co/functions/v1/nps-survey/' || t.token
        END as nps_url,
        t.token
    FROM nps_tokens t
    JOIN nps_surveys s ON s.id = t.survey_id
    WHERE t.survey_id = p_survey_id
    AND t.used_at IS NULL
    AND t.expires_at > now()
    AND s.status = 'active';
END;
$$;

-- 10. Criar função para relatórios simples
CREATE OR REPLACE FUNCTION public.get_nps_report(
    p_survey_id uuid DEFAULT NULL,
    p_start_date date DEFAULT NULL,
    p_end_date date DEFAULT NULL
) RETURNS TABLE(
    survey_title text,
    total_responses bigint,
    promoters bigint,
    neutrals bigint,
    detractors bigint,
    nps_score numeric,
    average_score numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.title as survey_title,
        COUNT(r.id) as total_responses,
        COUNT(CASE WHEN r.category = 'Promotor' THEN 1 END) as promoters,
        COUNT(CASE WHEN r.category = 'Neutro' THEN 1 END) as neutrals,
        COUNT(CASE WHEN r.category = 'Detrator' THEN 1 END) as detractors,
        CASE 
            WHEN COUNT(r.id) > 0 THEN
                ROUND(
                    (COUNT(CASE WHEN r.category = 'Promotor' THEN 1 END)::numeric - 
                     COUNT(CASE WHEN r.category = 'Detrator' THEN 1 END)::numeric) * 100.0 / 
                    COUNT(r.id)::numeric, 2
                )
            ELSE 0
        END as nps_score,
        ROUND(AVG(r.score), 2) as average_score
    FROM nps_surveys s
    LEFT JOIN nps_responses r ON r.survey_id = s.id
    WHERE (p_survey_id IS NULL OR s.id = p_survey_id)
    AND (p_start_date IS NULL OR r.response_date >= p_start_date)
    AND (p_end_date IS NULL OR r.response_date <= p_end_date)
    GROUP BY s.id, s.title
    ORDER BY s.created_at DESC;
END;
$$;

-- 11. Criar políticas RLS simplificadas
ALTER TABLE nps_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_surveys ENABLE ROW LEVEL SECURITY;

-- Política para nps_tokens (acesso público para validação)
CREATE POLICY "nps_tokens_public_access" ON nps_tokens FOR SELECT USING (true);

-- Política para nps_responses (acesso público para inserção)
CREATE POLICY "nps_responses_public_insert" ON nps_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "nps_responses_authenticated_select" ON nps_responses FOR SELECT USING (auth.role() = 'authenticated');

-- Política para nps_surveys (acesso público para leitura de pesquisas ativas)
CREATE POLICY "nps_surveys_public_select" ON nps_surveys FOR SELECT USING (status = 'active');
CREATE POLICY "nps_surveys_authenticated_all" ON nps_surveys FOR ALL USING (auth.role() = 'authenticated');

COMMENT ON MIGRATION IS 'Simplificação do sistema NPS - Remove funcionalidades antigas e duplicadas, mantém apenas o essencial para o novo fluxo';