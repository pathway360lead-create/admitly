-- Migration: Create user_saved_searches table
-- Description: Add table for storing user's saved searches with notification preferences
-- Date: 2025-01-10
-- Author: Backend Team

-- Create the user_saved_searches table
CREATE TABLE IF NOT EXISTS public.user_saved_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    query TEXT NOT NULL,
    filters JSONB DEFAULT '{}',

    -- Notification preferences
    notify_on_new_results BOOLEAN DEFAULT FALSE,
    last_notified_at TIMESTAMPTZ,

    -- Metadata
    execution_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMPTZ,

    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT user_saved_searches_name_length CHECK (char_length(name) >= 3 AND char_length(name) <= 100),
    CONSTRAINT user_saved_searches_query_length CHECK (char_length(query) >= 1 AND char_length(query) <= 200),
    CONSTRAINT user_saved_searches_execution_count_positive CHECK (execution_count >= 0)
);

-- Create indexes for performance
CREATE INDEX idx_saved_searches_user
ON public.user_saved_searches(user_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_saved_searches_notify
ON public.user_saved_searches(notify_on_new_results)
WHERE notify_on_new_results = TRUE AND deleted_at IS NULL;

CREATE INDEX idx_saved_searches_updated
ON public.user_saved_searches(updated_at DESC)
WHERE deleted_at IS NULL;

-- Add trigger for updated_at column
CREATE TRIGGER update_saved_searches_updated_at
BEFORE UPDATE ON public.user_saved_searches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.user_saved_searches ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for authenticated users
CREATE POLICY "Users can manage own saved searches"
ON public.user_saved_searches
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add comment to table
COMMENT ON TABLE public.user_saved_searches IS 'Stores user-saved search queries with filters and notification preferences';
COMMENT ON COLUMN public.user_saved_searches.filters IS 'JSONB object containing search filters (state, degree_type, field_of_study, etc.)';
COMMENT ON COLUMN public.user_saved_searches.notify_on_new_results IS 'If true, user will be notified when new results match this search';
COMMENT ON COLUMN public.user_saved_searches.execution_count IS 'Number of times this saved search has been executed';
COMMENT ON COLUMN public.user_saved_searches.last_executed_at IS 'Timestamp of last execution';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_saved_searches TO authenticated;
GRANT USAGE ON SEQUENCE user_saved_searches_id_seq TO authenticated;
