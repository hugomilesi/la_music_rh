-- Migration: Remove position_id column from users table
-- Date: 2025-01-28
-- Description: Remove the position_id column that was causing 400 errors in API calls

-- Remove the position_id column from users table
ALTER TABLE public.users DROP COLUMN IF EXISTS position_id;

-- Remove the index if it exists
DROP INDEX IF EXISTS idx_users_position_id;

-- Add comment about the change
COMMENT ON TABLE public.users IS 'Users table - position_id column removed to fix API 400 errors. Position information should be handled through the role field or separate position management.';