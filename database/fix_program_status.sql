-- Fix Program Status - Make all programs visible in frontend
-- Issue: Only 72 out of 686 programs have status='published' and is_active=true
-- Solution: Update all valid programs to published and active status

BEGIN;

-- First, check current status distribution
SELECT
    'Before Update' as stage,
    status,
    is_active,
    COUNT(*) as count
FROM programs
GROUP BY status, is_active
ORDER BY status, is_active;

-- Update all programs with status='draft' to 'published'
-- AND ensure is_active = true
UPDATE programs
SET
    status = 'published',
    is_active = true,
    updated_at = NOW()
WHERE status = 'draft'
   AND deleted_at IS NULL;

-- Check status distribution after update
SELECT
    'After Update' as stage,
    status,
    is_active,
    COUNT(*) as count
FROM programs
GROUP BY status, is_active
ORDER BY status, is_active;

-- Verify total published programs
SELECT
    'Final Count' as stage,
    COUNT(*) as total_published_active
FROM programs
WHERE status = 'published'
  AND is_active = true
  AND deleted_at IS NULL;

COMMIT;
