-- Migração para definir o usuário Luciano como administrador

-- Inserir ou atualizar o perfil do usuário Luciano como admin
INSERT INTO public.users (
  auth_user_id,
  full_name,
  nivel,
  preferences,
  status,
  created_at,
  updated_at
)
VALUES (
  '3818876c-dc03-44b0-9018-ee901091bad7',
  'Luciano Alf',
  'admin',
  '{"super_user": true}',
  'ativo',
  now(),
  now()
)
ON CONFLICT (auth_user_id) DO UPDATE SET
  nivel = 'admin',
  preferences = '{"super_user": true}',
  updated_at = now();

-- Verificar se o perfil foi criado/atualizado corretamente
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth_user_id = '3818876c-dc03-44b0-9018-ee901091bad7' 
    AND nivel = 'admin'
  ) THEN
    RAISE NOTICE 'Perfil do usuário Luciano configurado como admin com sucesso';
  ELSE
    RAISE WARNING 'Falha ao configurar perfil do usuário Luciano como admin';
  END IF;
END $$;