-- Criar políticas RLS para auth.users para permitir que auth.uid() funcione
-- Política para permitir que usuários autenticados vejam apenas seus próprios dados
CREATE POLICY "Users can view own profile" ON auth.users
  FOR SELECT USING (auth.uid() = id);

-- Política para permitir que usuários autenticados atualizem apenas seus próprios dados
CREATE POLICY "Users can update own profile" ON auth.users
  FOR UPDATE USING (auth.uid() = id);

-- Conceder permissões necessárias para o role authenticated
GRANT SELECT ON auth.users TO authenticated;
GRANT UPDATE ON auth.users TO authenticated;