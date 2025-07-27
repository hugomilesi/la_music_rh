-- Adicionar política de DELETE para a tabela users
-- Permitir que administradores e o próprio usuário possam deletar perfis

CREATE POLICY "Users can delete users"
ON public.users FOR DELETE
TO authenticated
USING (
  -- Permitir que o próprio usuário delete seu perfil
  auth.uid() = auth_user_id 
  OR 
  -- Permitir que administradores deletem qualquer perfil
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth_user_id = auth.uid() 
    AND role = 'admin'
  )
);