-- Migração para corrigir inconsistência entre campos 'role' e 'nivel' na tabela users
-- Esta migração garante que ambos os campos existam e sejam sincronizados

-- Verificar se a coluna 'nivel' não existe e adicioná-la
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'nivel'
    ) THEN
        ALTER TABLE public.users ADD COLUMN nivel TEXT DEFAULT 'usuario';
        RAISE NOTICE 'Coluna "nivel" adicionada à tabela users';
    ELSE
        RAISE NOTICE 'Coluna "nivel" já existe na tabela users';
    END IF;
END $$;

-- Sincronizar dados entre 'role' e 'nivel' (usar 'role' como fonte da verdade)
UPDATE public.users 
SET nivel = role 
WHERE nivel IS NULL OR nivel != role;

-- Criar função para manter sincronização entre 'role' e 'nivel'
CREATE OR REPLACE FUNCTION sync_role_nivel()
RETURNS TRIGGER AS $$
BEGIN
    -- Se 'role' foi alterado, sincronizar 'nivel'
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        NEW.nivel = NEW.role;
    END IF;
    
    -- Se 'nivel' foi alterado, sincronizar 'role'
    IF NEW.nivel IS DISTINCT FROM OLD.nivel THEN
        NEW.role = NEW.nivel;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para manter sincronização automática
DROP TRIGGER IF EXISTS sync_role_nivel_trigger ON public.users;
CREATE TRIGGER sync_role_nivel_trigger
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_role_nivel();

-- Atualizar políticas RLS para considerar ambos os campos
DROP POLICY IF EXISTS "Users can delete users" ON public.users;
CREATE POLICY "Users can delete users"
ON public.users FOR DELETE
TO authenticated
USING (
  -- Permitir que o próprio usuário delete seu perfil
  auth.uid() = auth_user_id 
  OR 
  -- Permitir que administradores deletem qualquer perfil (verificar ambos os campos)
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth_user_id = auth.uid() 
    AND (role = 'admin' OR role = 'super_admin' OR nivel = 'admin' OR nivel = 'super_admin')
  )
);

-- Verificar se a sincronização foi bem-sucedida
DO $$
DECLARE
    inconsistent_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO inconsistent_count
    FROM public.users 
    WHERE role != nivel;
    
    IF inconsistent_count = 0 THEN
        RAISE NOTICE 'Sincronização entre role e nivel concluída com sucesso';
    ELSE
        RAISE WARNING 'Ainda existem % registros com inconsistência entre role e nivel', inconsistent_count;
    END IF;
END $$;

-- Comentário para documentar a correção
COMMENT ON TABLE public.users IS 'Tabela de perfis de usuários - campos role e nivel mantidos sincronizados';