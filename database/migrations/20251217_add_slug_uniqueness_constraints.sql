-- Migration: Add slug uniqueness constraints
-- Created: 2025-12-17
-- Purpose: Prevent duplicate slugs at database level, fix race conditions

-- Add unique constraint to institutions.slug
ALTER TABLE institutions
ADD CONSTRAINT institutions_slug_unique UNIQUE (slug);

-- Add composite unique constraint to programs
-- (slug must be unique per institution, but can repeat across institutions)
ALTER TABLE programs
ADD CONSTRAINT programs_slug_institution_unique UNIQUE (slug, institution_id);

-- Create indexes for faster slug lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_institutions_slug ON institutions(slug);
CREATE INDEX IF NOT EXISTS idx_programs_slug_institution ON programs(slug, institution_id);

-- Add check to ensure slugs are not empty
ALTER TABLE institutions
ADD CONSTRAINT institutions_slug_not_empty CHECK (slug != '' AND slug IS NOT NULL);

ALTER TABLE programs
ADD CONSTRAINT programs_slug_not_empty CHECK (slug != '' AND slug IS NOT NULL);

-- Add comments for documentation
COMMENT ON CONSTRAINT institutions_slug_unique ON institutions IS
  'Ensures institution slugs are globally unique for clean URL routing';

COMMENT ON CONSTRAINT programs_slug_institution_unique ON programs IS
  'Ensures program slugs are unique within each institution, but can repeat across different institutions';
