-- Criar tabela de programas de reconhecimento
CREATE TABLE IF NOT EXISTS public.recognition_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    color TEXT,
    icon TEXT,
    total_stars INTEGER DEFAULT 0,
    target_roles TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Criar tabela de critérios de reconhecimento
CREATE TABLE IF NOT EXISTS public.recognition_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES public.recognition_programs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('checkbox', 'stars', 'observation')),
    weight INTEGER DEFAULT 1,
    is_required BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_recognition_criteria_program_id ON public.recognition_criteria(program_id);

-- Habilitar RLS
ALTER TABLE public.recognition_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recognition_criteria ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para recognition_programs
CREATE POLICY recognition_programs_authenticated_policy ON public.recognition_programs
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY recognition_programs_service_role_policy ON public.recognition_programs
    TO service_role USING (true) WITH CHECK (true);

-- Políticas de segurança para recognition_criteria
CREATE POLICY recognition_criteria_authenticated_policy ON public.recognition_criteria
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY recognition_criteria_service_role_policy ON public.recognition_criteria
    TO service_role USING (true) WITH CHECK (true);

-- Inserir os programas de gamificação
INSERT INTO public.recognition_programs (name, description, color, icon, total_stars, target_roles) VALUES
('Fideliza+', 'Programa de Incentivos e Reconhecimento das Farmers da LA Music.', '#10B981', 'Users', 5, ARRAY['farmer']),
('Matriculador+ LA', 'Programa de Incentivos e Reconhecimento dos Hunters da LA Music.', '#3B82F6', 'Target', 5, ARRAY['hunter']),
('Professor+ LA', 'Programa de Incentivos e Reconhecimento dos Professores da LA Music.', '#8B5CF6', 'GraduationCap', 5, ARRAY['professor'])
ON CONFLICT DO NOTHING;