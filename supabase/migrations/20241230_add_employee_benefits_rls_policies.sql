-- Criar políticas RLS para a tabela employee_benefits

-- Política para visualizar benefícios de funcionários
CREATE POLICY "employee_benefits_select_policy" ON public.employee_benefits
    FOR SELECT
    TO public
    USING (validate_user_permission(auth.uid(), 'beneficios'::text, 'read'::text));

-- Política para inserir benefícios de funcionários
CREATE POLICY "employee_benefits_insert_policy" ON public.employee_benefits
    FOR INSERT
    TO public
    WITH CHECK (validate_user_permission(auth.uid(), 'beneficios'::text, 'create'::text));

-- Política para atualizar benefícios de funcionários
CREATE POLICY "employee_benefits_update_policy" ON public.employee_benefits
    FOR UPDATE
    TO public
    USING (validate_user_permission(auth.uid(), 'beneficios'::text, 'update'::text));

-- Política para deletar benefícios de funcionários
CREATE POLICY "employee_benefits_delete_policy" ON public.employee_benefits
    FOR DELETE
    TO public
    USING (validate_user_permission(auth.uid(), 'beneficios'::text, 'delete'::text));