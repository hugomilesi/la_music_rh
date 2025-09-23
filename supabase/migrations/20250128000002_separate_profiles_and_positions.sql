-- Migração: Separar perfis de usuário de cargos/posições
-- Data: 2025-01-28
-- Descrição: Garantir separação clara entre perfis (níveis de acesso) e cargos (posições de trabalho)

-- 1. Adicionar coluna position_id na tabela users para referenciar cargos
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS position_id UUID REFERENCES public.roles(id) ON DELETE SET NULL;

-- 2. Comentários para esclarecer a diferença
COMMENT ON COLUMN public.users.role IS 'Perfil de acesso: super_admin, admin, gestor_rh, gerente (define permissões no sistema)';
COMMENT ON COLUMN public.users.position_id IS 'Cargo/Posição de trabalho: referência para tabela roles (define função na empresa)';
COMMENT ON TABLE public.roles IS 'Cargos/Posições de trabalho da empresa (ex: Desenvolvedor, Analista, Gerente de Vendas)';

-- 3. Migrar dados existentes da coluna position (se existir) para a tabela roles
DO $$
DECLARE
    user_record RECORD;
    role_id UUID;
BEGIN
    -- Verificar se a coluna position existe
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'position' 
        AND table_schema = 'public'
    ) THEN
        -- Para cada usuário com position preenchida
        FOR user_record IN 
            SELECT id, position 
            FROM public.users 
            WHERE position IS NOT NULL AND position != ''
        LOOP
            -- Verificar se o cargo já existe na tabela roles
            SELECT id INTO role_id
            FROM public.roles
            WHERE name = user_record.position
            LIMIT 1;
            
            -- Se não existir, criar o cargo
            IF role_id IS NULL THEN
                INSERT INTO public.roles (name, description, is_active)
                VALUES (
                    user_record.position,
                    'Cargo migrado automaticamente do campo position',
                    true
                )
                RETURNING id INTO role_id;
            END IF;
            
            -- Atualizar o usuário com a referência do cargo
            UPDATE public.users
            SET position_id = role_id
            WHERE id = user_record.id;
        END LOOP;
        
        -- Remover a coluna position antiga após migração
        ALTER TABLE public.users DROP COLUMN IF EXISTS position;
    END IF;
END $$;

-- 4. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_users_position_id ON public.users(position_id);

-- 5. Atualizar políticas RLS para incluir position_id
-- Política para visualização de cargos (roles)
DROP POLICY IF EXISTS "HR and manager read access on roles" ON public.roles;
CREATE POLICY "All authenticated users can view roles"
    ON public.roles
    FOR SELECT
    TO authenticated
    USING (is_active = true);

-- 6. Inserir cargos padrão se não existirem
INSERT INTO public.roles (name, description, department_id, salary_range, requirements, is_active) 
SELECT * FROM (VALUES
    ('Desenvolvedor Junior', 'Desenvolvedor de software iniciante', 
     (SELECT id FROM public.departments WHERE name ILIKE '%tecnologia%' OR name ILIKE '%ti%' LIMIT 1),
     '{"min": 3000, "max": 5000}',
     ARRAY['Conhecimento básico em programação', 'Graduação em área relacionada'],
     true),
    ('Desenvolvedor Senior', 'Desenvolvedor de software experiente',
     (SELECT id FROM public.departments WHERE name ILIKE '%tecnologia%' OR name ILIKE '%ti%' LIMIT 1),
     '{"min": 8000, "max": 15000}',
     ARRAY['5+ anos de experiência', 'Liderança técnica', 'Conhecimento avançado'],
     true),
    ('Analista de RH', 'Responsável por processos de recursos humanos',
     (SELECT id FROM public.departments WHERE name ILIKE '%rh%' OR name ILIKE '%recursos%' LIMIT 1),
     '{"min": 4000, "max": 7000}',
     ARRAY['Graduação em RH ou Psicologia', 'Experiência em recrutamento'],
     true),
    ('Gerente de Vendas', 'Responsável pela equipe de vendas',
     (SELECT id FROM public.departments WHERE name ILIKE '%vendas%' OR name ILIKE '%comercial%' LIMIT 1),
     '{"min": 6000, "max": 12000}',
     ARRAY['Experiência em vendas', 'Liderança de equipe', 'Conhecimento do mercado'],
     true),
    ('Assistente Administrativo', 'Suporte administrativo geral',
     (SELECT id FROM public.departments WHERE name ILIKE '%admin%' LIMIT 1),
     '{"min": 2000, "max": 3500}',
     ARRAY['Ensino médio completo', 'Conhecimento em informática básica'],
     true),
    ('Professor', 'Profissional de ensino',
     (SELECT id FROM public.departments WHERE name ILIKE '%pedagogico%' OR name ILIKE '%ensino%' LIMIT 1),
     '{"min": 3000, "max": 8000}',
     ARRAY['Licenciatura na área', 'Experiência em ensino'],
     true),
    ('Coordenador Pedagógico', 'Coordenação de atividades pedagógicas',
     (SELECT id FROM public.departments WHERE name ILIKE '%pedagogico%' OR name ILIKE '%ensino%' LIMIT 1),
     '{"min": 5000, "max": 10000}',
     ARRAY['Pós-graduação em Educação', 'Experiência em coordenação'],
     true)
) AS new_roles(name, description, department_id, salary_range, requirements, is_active)
WHERE NOT EXISTS (
    SELECT 1 FROM public.roles WHERE public.roles.name = new_roles.name
);

-- 7. Log da migração
INSERT INTO public.system_logs (log_level, message, details, source)
VALUES (
    'INFO',
    'Separação entre perfis e cargos implementada com sucesso',
    jsonb_build_object(
        'migration', '20250128000002_separate_profiles_and_positions',
        'changes', ARRAY[
            'Adicionada coluna position_id na tabela users',
            'Migrados dados da coluna position para tabela roles',
            'Atualizados comentários para esclarecer diferenças',
            'Criados cargos padrão',
            'Atualizadas políticas RLS'
        ]
    ),
    'database_migration'
);