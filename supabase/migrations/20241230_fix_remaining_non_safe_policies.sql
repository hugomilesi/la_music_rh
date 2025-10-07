-- Corrigir políticas que ainda usam funções não-safe
-- Estas políticas podem causar recursão infinita

-- 1. Corrigir benefit_dependents
DROP POLICY IF EXISTS "Users can insert benefit dependents based on permissions" ON benefit_dependents;
CREATE POLICY "benefit_dependents_insert_policy_safe" ON benefit_dependents
    FOR INSERT 
    TO authenticated 
    WITH CHECK (validate_user_permission_safe(auth.uid(), 'beneficios', 'create'));

-- 2. Corrigir benefit_documents  
DROP POLICY IF EXISTS "Users can insert benefit documents based on permissions" ON benefit_documents;
CREATE POLICY "benefit_documents_insert_policy_safe" ON benefit_documents
    FOR INSERT 
    TO authenticated 
    WITH CHECK (validate_user_permission_safe(auth.uid(), 'beneficios', 'create'));

-- 3. Corrigir benefit_performance_goals
DROP POLICY IF EXISTS "Users can insert benefit goals based on permissions" ON benefit_performance_goals;
CREATE POLICY "benefit_performance_goals_insert_policy_safe" ON benefit_performance_goals
    FOR INSERT 
    TO authenticated 
    WITH CHECK (validate_user_permission_safe(auth.uid(), 'beneficios', 'create'));

-- 4. Corrigir benefits
DROP POLICY IF EXISTS "benefits_insert_policy" ON benefits;
CREATE POLICY "benefits_insert_policy_safe" ON benefits
    FOR INSERT 
    TO authenticated 
    WITH CHECK (validate_user_permission_safe(auth.uid(), 'benefits', 'create'));

-- 5. Corrigir employee_benefits
DROP POLICY IF EXISTS "employee_benefits_insert_policy" ON employee_benefits;
CREATE POLICY "employee_benefits_insert_policy_safe" ON employee_benefits
    FOR INSERT 
    TO authenticated 
    WITH CHECK (validate_user_permission_safe(auth.uid(), 'beneficios', 'create'));

-- 6. Corrigir evaluations
DROP POLICY IF EXISTS "evaluations_insert_policy" ON evaluations;
CREATE POLICY "evaluations_insert_policy_safe" ON evaluations
    FOR INSERT 
    TO authenticated 
    WITH CHECK (validate_user_permission_safe(auth.uid(), 'evaluation', 'create'));

-- 7. Corrigir payroll_entries
DROP POLICY IF EXISTS "payroll_entries_insert_policy" ON payroll_entries;
CREATE POLICY "payroll_entries_insert_policy_safe" ON payroll_entries
    FOR INSERT 
    TO authenticated 
    WITH CHECK (validate_user_permission_safe(auth.uid(), 'payroll', 'create'));