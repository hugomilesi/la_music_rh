-- Correção dos erros restantes identificados no console.md
-- Data: 2024-12-30
-- Descrição: Corrigir relacionamentos e tabelas ausentes

-- 1. Criar tabela nps_surveys (necessária para o relacionamento com nps_responses)
CREATE TABLE IF NOT EXISTS public.nps_surveys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    questions JSONB,
    target_audience JSONB,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft', 'completed')),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Comentários para nps_surveys
COMMENT ON TABLE public.nps_surveys IS 'Pesquisas de NPS (Net Promoter Score)';
COMMENT ON COLUMN public.nps_surveys.title IS 'Título da pesquisa NPS';
COMMENT ON COLUMN public.nps_surveys.description IS 'Descrição da pesquisa';
COMMENT ON COLUMN public.nps_surveys.questions IS 'Perguntas da pesquisa em formato JSON';
COMMENT ON COLUMN public.nps_surveys.target_audience IS 'Público-alvo da pesquisa';
COMMENT ON COLUMN public.nps_surveys.status IS 'Status da pesquisa: active, inactive, draft, completed';
COMMENT ON COLUMN public.nps_surveys.created_by IS 'Usuário que criou a pesquisa';
COMMENT ON COLUMN public.nps_surveys.start_date IS 'Data de início da pesquisa';
COMMENT ON COLUMN public.nps_surveys.end_date IS 'Data de fim da pesquisa';

-- 2. Atualizar nps_responses para ter foreign key correta para nps_surveys
ALTER TABLE public.nps_responses 
DROP CONSTRAINT IF EXISTS nps_responses_survey_id_fkey;

ALTER TABLE public.nps_responses 
ADD CONSTRAINT nps_responses_survey_id_fkey 
FOREIGN KEY (survey_id) REFERENCES public.nps_surveys(id) ON DELETE CASCADE;

-- 3. Habilitar RLS na tabela nps_surveys
ALTER TABLE public.nps_surveys ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS para nps_surveys
CREATE POLICY "nps_surveys_select_policy" ON public.nps_surveys
    FOR SELECT USING (
        auth.uid() IN (
            SELECT auth_user_id FROM public.users 
            WHERE role IN ('super_admin', 'admin')
        )
        OR created_by IN (
            SELECT id FROM public.users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "nps_surveys_insert_policy" ON public.nps_surveys
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT auth_user_id FROM public.users 
            WHERE role IN ('super_admin', 'admin', 'gestor_rh')
        )
    );

CREATE POLICY "nps_surveys_update_policy" ON public.nps_surveys
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT auth_user_id FROM public.users 
            WHERE role IN ('super_admin', 'admin')
        )
        OR created_by IN (
            SELECT id FROM public.users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "nps_surveys_delete_policy" ON public.nps_surveys
    FOR DELETE USING (
        auth.uid() IN (
            SELECT auth_user_id FROM public.users 
            WHERE role IN ('super_admin', 'admin')
        )
    );

-- 5. Conceder permissões para nps_surveys
GRANT SELECT ON public.nps_surveys TO anon;
GRANT ALL PRIVILEGES ON public.nps_surveys TO authenticated;

-- 6. Criar índices para nps_surveys
CREATE INDEX IF NOT EXISTS idx_nps_surveys_created_by ON public.nps_surveys(created_by);
CREATE INDEX IF NOT EXISTS idx_nps_surveys_status ON public.nps_surveys(status);
CREATE INDEX IF NOT EXISTS idx_nps_surveys_start_date ON public.nps_surveys(start_date);
CREATE INDEX IF NOT EXISTS idx_nps_surveys_end_date ON public.nps_surveys(end_date);

-- 7. Trigger para atualizar updated_at em nps_surveys
CREATE TRIGGER update_nps_surveys_updated_at
    BEFORE UPDATE ON public.nps_surveys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Inserir dados de exemplo para nps_surveys
INSERT INTO public.nps_surveys (title, description, questions, status)
VALUES (
    'Pesquisa de Satisfação Geral 2024',
    'Pesquisa para avaliar a satisfação dos colaboradores com a empresa',
    '{
        "questions": [
            {
                "id": 1,
                "text": "Em uma escala de 0 a 10, o quanto você recomendaria nossa empresa como um lugar para trabalhar?",
                "type": "nps"
            },
            {
                "id": 2,
                "text": "Comentários adicionais (opcional)",
                "type": "text"
            }
        ]
    }',
    'active'
);

-- 9. Inserir dados de exemplo para nps_responses (se houver usuários)
INSERT INTO public.nps_responses (survey_id, user_id, score, comment)
SELECT 
    (SELECT id FROM public.nps_surveys LIMIT 1) as survey_id,
    u.id as user_id,
    9 as score,
    'Excelente ambiente de trabalho!' as comment
FROM public.users u
LIMIT 1
ON CONFLICT DO NOTHING;

-- 10. Inserir dados de exemplo para schedule_events (se houver usuários)
INSERT INTO public.schedule_events (title, description, start_date, end_date, user_id, event_type)
SELECT 
    'Reunião de Equipe' as title,
    'Reunião semanal da equipe de desenvolvimento' as description,
    now() + interval '2 days' as start_date,
    now() + interval '2 days' + interval '2 hours' as end_date,
    u.id as user_id,
    'meeting' as event_type
FROM public.users u
LIMIT 1
ON CONFLICT DO NOTHING;

-- 11. Verificar se as foreign keys estão corretas
-- Verificar relacionamento schedule_events -> users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'schedule_events_user_id_fkey'
        AND table_name = 'schedule_events'
    ) THEN
        ALTER TABLE public.schedule_events 
        ADD CONSTRAINT schedule_events_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 12. Verificar se as foreign keys estão corretas para nps_responses -> users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'nps_responses_user_id_fkey'
        AND table_name = 'nps_responses'
    ) THEN
        ALTER TABLE public.nps_responses 
        ADD CONSTRAINT nps_responses_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 13. Atualizar estatísticas das tabelas para o cache do Supabase
ANALYZE public.nps_surveys;
ANALYZE public.nps_responses;
ANALYZE public.schedule_events;

-- 14. Verificar se todas as tabelas e relacionamentos estão corretos
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('nps_responses', 'schedule_events', 'nps_surveys')
ORDER BY tc.table_name, tc.constraint_name;