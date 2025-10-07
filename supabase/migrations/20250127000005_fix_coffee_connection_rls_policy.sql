-- Corrigir política RLS para Coffee Connection
-- O problema pode estar na política de INSERT que está muito restritiva

-- Primeiro, vamos criar uma política mais permissiva temporariamente para Coffee Connection
DROP POLICY IF EXISTS "evaluations_insert_policy_safe" ON evaluations;

-- Criar nova política de INSERT mais permissiva
CREATE POLICY "evaluations_insert_policy_safe" ON evaluations
    FOR INSERT
    TO authenticated
    WITH CHECK (
        -- Super admin e admin podem inserir qualquer avaliação
        validate_user_permission_safe(auth.uid(), 'evaluation', 'create')
        OR
        -- Para Coffee Connection, permitir que qualquer usuário autenticado agende
        (evaluation_type = 'Coffee Connection' AND auth.uid() IS NOT NULL)
        OR
        -- Para outros tipos, manter a validação original
        (evaluation_type != 'Coffee Connection' AND validate_user_permission_safe(auth.uid(), 'evaluation', 'create'))
    );

-- Comentário explicativo
COMMENT ON POLICY "evaluations_insert_policy_safe" ON evaluations IS 'Política de inserção com permissão especial para Coffee Connection';