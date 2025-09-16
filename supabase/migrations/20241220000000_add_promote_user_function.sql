-- Função para promover usuário para admin
CREATE OR REPLACE FUNCTION promote_user_to_admin(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se o usuário atual é super_admin
  IF NOT (
    SELECT COALESCE(preferences->>'super_user', 'false')::boolean 
    FROM public.users 
    WHERE id = auth.uid()
  ) AND NOT (
    SELECT role IN ('super_admin') OR nivel IN ('super_admin')
    FROM public.users 
    WHERE id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Apenas super administradores podem promover usuários';
  END IF;

  -- Verificar se o usuário alvo existe
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = target_user_id) THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;

  -- Verificar se o usuário alvo já é super_admin
  IF EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = target_user_id 
    AND (role = 'super_admin' OR nivel = 'super_admin' OR COALESCE(preferences->>'super_user', 'false')::boolean = true)
  ) THEN
    RAISE EXCEPTION 'Usuário já é super administrador';
  END IF;

  -- Promover o usuário para admin
  UPDATE public.users 
  SET 
    role = 'admin',
    nivel = 'admin',
    updated_at = NOW()
  WHERE id = target_user_id;

  -- Log da ação
  INSERT INTO public.audit_log (user_id, action, details, created_at)
  VALUES (
    auth.uid(),
    'promote_user_to_admin',
    jsonb_build_object(
      'target_user_id', target_user_id,
      'promoted_to', 'admin'
    ),
    NOW()
  );
END;
$$;

-- Conceder permissão de execução para usuários autenticados
GRANT EXECUTE ON FUNCTION promote_user_to_admin(UUID) TO authenticated;