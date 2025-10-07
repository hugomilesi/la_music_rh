-- Simplificar política RLS redundante para Coffee Connection
-- A lógica atual tem redundância que pode estar causando problemas

-- Remover política atual
DROP POLICY IF EXISTS "evaluations_insert_policy_safe" ON evaluations;

-- Criar nova política simplificada
CREATE POLICY "evaluations_insert_policy_safe" ON evaluations
    FOR INSERT
    TO authenticated
    WITH CHECK (
        -- Super admin e admin podem inserir qualquer avaliação
        validate_user_permission_safe(auth.uid(), 'evaluation', 'create')
        OR
        -- Para Coffee Connection, permitir que qualquer usuário autenticado agende
        (evaluation_type = 'Coffee Connection')
    );

-- Comentário explicativo
COMMENT ON POLICY "evaluations_insert_policy_safe" ON evaluations IS 'Política de inserção simplificada - Coffee Connection permitido para todos os usuários autenticados';