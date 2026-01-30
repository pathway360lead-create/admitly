-- ⚠️ URGENT FIX: Publish All Institutions to Frontend
--
-- ISSUE: Only 29 institutions showing (should be more)
-- ROOT CAUSE: Institutions have status='draft' by default
-- SOLUTION: Update all institutions to status='published'
--
-- HOW TO RUN: Same as programs fix (Supabase Dashboard → SQL Editor)

-- ==============================================================================
-- STEP 1: Check current status (BEFORE update)
-- ==============================================================================
SELECT
    'BEFORE UPDATE' as stage,
    status,
    verified,
    COUNT(*) as institution_count
FROM institutions
GROUP BY status, verified
ORDER BY status, verified;

-- ==============================================================================
-- STEP 2: Update all draft institutions to published
-- ==============================================================================
UPDATE institutions
SET
    status = 'published',
    updated_at = NOW()
WHERE status = 'draft'
  AND deleted_at IS NULL;

-- ==============================================================================
-- STEP 3: Verify results (AFTER update)
-- ==============================================================================
SELECT
    'AFTER UPDATE' as stage,
    status,
    verified,
    COUNT(*) as institution_count
FROM institutions
GROUP BY status, verified
ORDER BY status, verified;

-- ==============================================================================
-- STEP 4: Final verification
-- ==============================================================================
SELECT
    'FINAL RESULT' as stage,
    COUNT(*) as total_institutions_visible_in_api
FROM institutions
WHERE status = 'published'
  AND deleted_at IS NULL;
