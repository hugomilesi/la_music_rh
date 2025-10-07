-- Adicionar coluna avatar_url na tabela users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;