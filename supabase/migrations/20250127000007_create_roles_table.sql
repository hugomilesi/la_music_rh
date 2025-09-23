-- Criar tabela 'roles' para gerenciar cargos da empresa
-- Esta tabela é necessária para o RolesDialog funcionar corretamente

CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    permissions JSONB DEFAULT '{}',
    salary_range JSONB DEFAULT '{}', -- {"min": 0, "max": 0}
    requirements TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Comentário da tabela
COMMENT ON TABLE public.roles IS 'Cargos/funções da empresa com suas respectivas permissões e requisitos';

-- Comentários das colunas
COMMENT ON COLUMN public.roles.name IS 'Nome do cargo (ex: Desenvolvedor Senior, Analista RH)';
COMMENT ON COLUMN public.roles.department_id IS 'Departamento ao qual o cargo pertence';
COMMENT ON COLUMN public.roles.permissions IS 'Permissões específicas do cargo em formato JSON';
COMMENT ON COLUMN public.roles.salary_range IS 'Faixa salarial do cargo {"min": valor, "max": valor}';
COMMENT ON COLUMN public.roles.requirements IS 'Lista de requisitos para o cargo';

-- Habilitar RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Política para super_admin e admin (acesso total)
CREATE POLICY "Super admin and admin full access on roles"
    ON public.roles
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.auth_user_id = auth.uid()
            AND users.role IN ('super_admin', 'admin')
            AND users.is_active = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.auth_user_id = auth.uid()
            AND users.role IN ('super_admin', 'admin')
            AND users.is_active = true
        )
    );

-- Política para gestor_rh e gerente (apenas leitura)
CREATE POLICY "HR and manager read access on roles"
    ON public.roles
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.auth_user_id = auth.uid()
            AND users.role IN ('gestor_rh', 'gerente')
            AND users.is_active = true
        )
    );

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER roles_updated_at_trigger
    BEFORE UPDATE ON public.roles
    FOR EACH ROW
    EXECUTE FUNCTION update_roles_updated_at();

-- Inserir alguns cargos iniciais
INSERT INTO public.roles (name, description, department_id, salary_range, requirements) VALUES
('Desenvolvedor Junior', 'Desenvolvedor de software iniciante', 
    (SELECT id FROM public.departments WHERE name = 'Tecnologia' LIMIT 1),
    '{"min": 3000, "max": 5000}',
    ARRAY['Conhecimento em programação', 'Graduação em TI ou áreas afins']
),
('Desenvolvedor Senior', 'Desenvolvedor de software experiente',
    (SELECT id FROM public.departments WHERE name = 'Tecnologia' LIMIT 1),
    '{"min": 8000, "max": 15000}',
    ARRAY['5+ anos de experiência', 'Liderança técnica', 'Conhecimento avançado']
),
('Analista de RH', 'Responsável por processos de recursos humanos',
    (SELECT id FROM public.departments WHERE name = 'Recursos Humanos' LIMIT 1),
    '{"min": 4000, "max": 7000}',
    ARRAY['Graduação em RH ou Psicologia', 'Experiência em recrutamento']
),
('Gerente de Vendas', 'Responsável pela equipe de vendas',
    (SELECT id FROM public.departments WHERE name = 'Vendas' LIMIT 1),
    '{"min": 6000, "max": 12000}',
    ARRAY['Experiência em vendas', 'Liderança de equipe', 'Conhecimento do mercado']
),
('Assistente Administrativo', 'Suporte administrativo geral',
    (SELECT id FROM public.departments WHERE name = 'Administrativo' LIMIT 1),
    '{"min": 2000, "max": 3500}',
    ARRAY['Ensino médio completo', 'Conhecimento em informática básica']
)
ON CONFLICT (name) DO NOTHING;

-- Conceder permissões básicas
GRANT SELECT ON public.roles TO anon;
GRANT ALL PRIVILEGES ON public.roles TO authenticated;

-- Log da migração
INSERT INTO public.system_logs (log_level, message, details, source)
VALUES (
    'INFO',
    'Tabela roles criada com sucesso',
    jsonb_build_object(
        'migration', '20250127000007_create_roles_table',
        'action', 'CREATE TABLE roles',
        'reason', 'Resolver erro 404 na busca de cargos'
    ),
    'migration'
);