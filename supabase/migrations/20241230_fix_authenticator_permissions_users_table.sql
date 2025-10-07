-- Conceder permissões necessárias para o role authenticator na tabela users
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticator;

-- Verificar se o role anon também precisa de permissões
GRANT SELECT ON public.users TO anon;

-- Garantir que o role authenticated tenha as permissões necessárias
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;