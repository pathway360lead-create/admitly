-- Migration Rollback: Drop user_saved_searches table
-- Description: Rollback migration for user_saved_searches table
-- Date: 2025-01-10
-- Author: Backend Team

-- Drop RLS policies first
DROP POLICY IF EXISTS "Users can manage own saved searches" ON public.user_saved_searches;

-- Drop trigger
DROP TRIGGER IF EXISTS update_saved_searches_updated_at ON public.user_saved_searches;

-- Drop indexes
DROP INDEX IF EXISTS public.idx_saved_searches_user;
DROP INDEX IF EXISTS public.idx_saved_searches_notify;
DROP INDEX IF EXISTS public.idx_saved_searches_updated;

-- Drop table
DROP TABLE IF EXISTS public.user_saved_searches;

-- Revoke permissions (if needed)
-- Note: This is safe to run even if permissions weren't granted
REVOKE ALL ON public.user_saved_searches FROM authenticated;
