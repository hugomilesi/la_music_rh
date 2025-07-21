-- Adicionar política de DELETE para a tabela profiles
-- Permitir que administradores e o próprio usuário possam deletar perfis

CREATE POLICY "Users can delete profiles"
ON public.profiles FOR DELETE
TO authenticated
USING (
  -- Permitir que o próprio usuário delete seu perfil
  auth.uid() = id 
  OR 
  -- Permitir que administradores deletem qualquer perfil
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);