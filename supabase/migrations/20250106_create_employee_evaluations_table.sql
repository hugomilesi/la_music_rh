-- Criar tabela employee_evaluations para o sistema de reconhecimento
CREATE TABLE IF NOT EXISTS employee_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES recognition_programs(id) ON DELETE CASCADE,
    evaluation_period TEXT NOT NULL,
    total_stars INTEGER DEFAULT 0,
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint para evitar duplicatas
    UNIQUE(employee_id, program_id, evaluation_period)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_employee_evaluations_employee_id ON employee_evaluations(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_evaluations_program_id ON employee_evaluations(program_id);
CREATE INDEX IF NOT EXISTS idx_employee_evaluations_period ON employee_evaluations(evaluation_period);

-- Habilitar RLS
ALTER TABLE employee_evaluations ENABLE ROW LEVEL SECURITY;

-- Política para permitir acesso baseado nas permissões do usuário
CREATE POLICY "employee_evaluations_policy" ON employee_evaluations
    FOR ALL USING (
        auth.uid() IN (
            SELECT auth_user_id FROM users 
            WHERE role IN ('super_admin', 'admin') 
            OR (role = 'gestor_rh' AND EXISTS (
                SELECT 1 FROM role_permissions 
                WHERE role_name = 'gestor_rh' 
                AND module_name = 'evaluation' 
                AND can_view = true
            ))
            OR (role = 'gerente' AND EXISTS (
                SELECT 1 FROM role_permissions 
                WHERE role_name = 'gerente' 
                AND module_name = 'evaluation' 
                AND can_view = true
            ))
        )
    );

COMMENT ON TABLE employee_evaluations IS 'Avaliações de colaboradores para programas de reconhecimento';