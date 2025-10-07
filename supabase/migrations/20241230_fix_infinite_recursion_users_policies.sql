-- Remover políticas problemáticas que causam recursão infinita
DROP POLICY IF EXISTS "super_admin_admin_full_access" ON public.users;
DROP POLICY IF EXISTS "hr_managers_view_users" ON public.users;

-- Criar políticas mais simples sem recursão
-- Política para super_admin e admin terem acesso total
CREATE POLICY "super_admin_admin_full_access_v2" ON public.users
    FOR ALL
    TO public
    USING (
        CASE 
            WHEN auth.uid() IS NULL THEN false
            ELSE EXISTS (
                SELECT 1 FROM auth.users au 
                JOIN public.users u ON u.auth_user_id = au.id 
                WHERE au.id = auth.uid() 
                AND u.role IN ('super_admin', 'admin')
            )
        END
    );

-- Política para gestor_rh e gerente visualizarem usuários
CREATE POLICY "hr_managers_view_users_v2" ON public.users
    FOR SELECT
    TO public
    USING (
        CASE 
            WHEN auth.uid() IS NULL THEN false
            ELSE EXISTS (
                SELECT 1 FROM auth.users au 
                JOIN public.users u ON u.auth_user_id = au.id 
                WHERE au.id = auth.uid() 
                AND u.role IN ('gestor_rh', 'gerente')
            )
        END
    );