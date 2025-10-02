-- Configuração de RLS e permissões para a tabela colaboradores

-- Habilitar RLS na tabela colaboradores
ALTER TABLE public.colaboradores ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários autenticados vejam todos os colaboradores
CREATE POLICY "Usuários autenticados podem visualizar colaboradores" ON public.colaboradores
    FOR SELECT
    TO authenticated
    USING (true);

-- Política para permitir que usuários autenticados insiram colaboradores
-- (pode ser restringida por roles específicas se necessário)
CREATE POLICY "Usuários autenticados podem inserir colaboradores" ON public.colaboradores
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Política para permitir que usuários autenticados atualizem colaboradores
CREATE POLICY "Usuários autenticados podem atualizar colaboradores" ON public.colaboradores
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para permitir que usuários autenticados deletem colaboradores
-- (pode ser restringida por roles específicas se necessário)
CREATE POLICY "Usuários autenticados podem deletar colaboradores" ON public.colaboradores
    FOR DELETE
    TO authenticated
    USING (true);

-- Conceder permissões básicas para as roles anon e authenticated
GRANT SELECT ON public.colaboradores TO anon;
GRANT ALL PRIVILEGES ON public.colaboradores TO authenticated;

-- Conceder permissões na sequência (se houver)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Comentário sobre as políticas
COMMENT ON POLICY "Usuários autenticados podem visualizar colaboradores" ON public.colaboradores IS 'Permite que usuários logados vejam todos os colaboradores';
COMMENT ON POLICY "Usuários autenticados podem inserir colaboradores" ON public.colaboradores IS 'Permite que usuários logados criem novos colaboradores';
COMMENT ON POLICY "Usuários autenticados podem atualizar colaboradores" ON public.colaboradores IS 'Permite que usuários logados atualizem dados de colaboradores';
COMMENT ON POLICY "Usuários autenticados podem deletar colaboradores" ON public.colaboradores IS 'Permite que usuários logados removam colaboradores';

-- Verificar se as permissões foram aplicadas corretamente
-- Esta query pode ser executada para verificar:
-- SELECT grantee, table_name, privilege_type 
-- FROM information_schema.role_table_grants 
-- WHERE table_schema = 'public' AND table_name = 'colaboradores' 
-- AND grantee IN ('anon', 'authenticated') 
-- ORDER BY table_name, grantee;