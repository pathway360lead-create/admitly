-- ⚠️ URGENT FIX: Publish All Programs to Frontend
--
-- ISSUE: Only 72 out of 686 programs showing in frontend
-- ROOT CAUSE: Programs have status='draft' by default
-- SOLUTION: Update all programs to status='published' and is_active=true
--
-- HOW TO RUN:
-- 1. Go to: https://supabase.com/dashboard
-- 2. Select your project: Admitly
-- 3. Click "SQL Editor" in left sidebar
-- 4. Click "New query"
-- 5. Copy-paste this entire script
-- 6. Click "Run" button
--
-- TIME TO EXECUTE: ~2 seconds
-- EXPECTED RESULT: 614 programs will be updated (from draft to published)

-- ==============================================================================
-- STEP 1: Check current status (BEFORE update)
-- ==============================================================================
SELECT
    'BEFORE UPDATE' as stage,
    status,
    is_active,
    COUNT(*) as program_count
FROM programs
GROUP BY status, is_active
ORDER BY status, is_active;

-- ==============================================================================
-- STEP 2: Update all draft programs to published
-- ==============================================================================
UPDATE programs
SET
    status = 'published',
    is_active = true,
    updated_at = NOW()
WHERE status = 'draft'
  AND deleted_at IS NULL;

-- ==============================================================================
-- STEP 3: Also update any NULL is_active to true
-- ==============================================================================
UPDATE programs
SET
    is_active = true,
    updated_at = NOW()
WHERE is_active IS NULL
  AND deleted_at IS NULL;

-- ==============================================================================
-- STEP 4: Verify results (AFTER update)
-- ==============================================================================
SELECT
    'AFTER UPDATE' as stage,
    status,
    is_active,
    COUNT(*) as program_count
FROM programs
GROUP BY status, is_active
ORDER BY status, is_active;

-- ==============================================================================
-- STEP 5: Final verification - count programs visible to API
-- ==============================================================================
SELECT
    'FINAL RESULT' as stage,
    COUNT(*) as total_programs_visible_in_api
FROM programs
WHERE status = 'published'
  AND is_active = true
  AND deleted_at IS NULL;

-- ==============================================================================
-- EXPECTED OUTPUT:
-- You should see approximately 686 programs visible in API after this update
-- ==============================================================================
