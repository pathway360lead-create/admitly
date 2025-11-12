# Database Setup Guide
## Admitly Platform - Supabase PostgreSQL

**Version:** 1.0
**Last Updated:** January 2025
**Status:** Ready for Production

---

## Overview

This guide will walk you through setting up the complete Admitly database schema in Supabase. The migration includes:

- **24 tables** across 12 functional categories
- **60+ indexes** for optimal query performance
- **30+ RLS policies** for security
- **13 triggers** for automatic timestamp updates
- **3 database functions** for automation
- **1 materialized view** for analytics

**Estimated Time:** 15-20 minutes

---

## Prerequisites

Before you begin, ensure you have:

- [x] Supabase account created
- [x] Admitly project created (ID: `jvmmexjbnolzukhdhwds`)
- [x] Access to Supabase Dashboard
- [x] Database credentials from `.env` file

---

## Step-by-Step Setup

### Step 1: Access Supabase SQL Editor

1. **Navigate to Supabase Dashboard:**
   ```
   https://app.supabase.com/project/jvmmexjbnolzukhdhwds
   ```

2. **Open SQL Editor:**
   - Click on **SQL Editor** in the left sidebar
   - OR go to: `https://app.supabase.com/project/jvmmexjbnolzukhdhwds/sql`

3. **Create a new query:**
   - Click **"New query"** button
   - Name it: `001_initial_schema`

---

### Step 2: Run the Migration Script

1. **Copy the migration script:**
   - Open `database/migrations/001_initial_schema.sql`
   - Select all content (Ctrl+A / Cmd+A)
   - Copy to clipboard (Ctrl+C / Cmd+C)

2. **Paste into SQL Editor:**
   - Paste the entire script into the Supabase SQL Editor
   - The script is idempotent and safe to run

3. **Execute the migration:**
   - Click **"Run"** button (or press Ctrl+Enter / Cmd+Enter)
   - Wait for execution to complete (~30-60 seconds)

4. **Verify success:**
   - You should see a success message with notices:
     ```
     ============================================
     Admitly Database Schema Migration Complete!
     ============================================
     Tables Created: 24
     RLS Policies: 30+
     Indexes: 60+
     ...
     ```

---

### Step 3: Configure Storage Buckets

Supabase Storage buckets need to be created via the Dashboard (not SQL).

1. **Navigate to Storage:**
   - Click **Storage** in left sidebar
   - OR go to: `https://app.supabase.com/project/jvmmexjbnolzukhdhwds/storage/buckets`

2. **Create the following buckets:**

   **Bucket 1: `institution-logos`**
   - Click **"New bucket"**
   - Name: `institution-logos`
   - Public: ✅ Yes (publicly accessible)
   - File size limit: 2 MB
   - Allowed MIME types: `image/png, image/jpeg, image/svg+xml`
   - Click **"Create bucket"**

   **Bucket 2: `institution-banners`**
   - Name: `institution-banners`
   - Public: ✅ Yes
   - File size limit: 5 MB
   - Allowed MIME types: `image/png, image/jpeg, image/webp`

   **Bucket 3: `user-avatars`**
   - Name: `user-avatars`
   - Public: ✅ Yes
   - File size limit: 1 MB
   - Allowed MIME types: `image/png, image/jpeg`

   **Bucket 4: `documents`**
   - Name: `documents`
   - Public: ❌ No (private, for admin uploads)
   - File size limit: 10 MB
   - Allowed MIME types: `application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document`

3. **Configure Bucket Policies:**

   For each **public** bucket, set these policies:

   - **SELECT Policy (Public Read):**
     ```sql
     CREATE POLICY "Public read access"
     ON storage.objects FOR SELECT
     TO public
     USING (bucket_id = 'institution-logos');
     ```

   - **INSERT Policy (Authenticated Upload):**
     ```sql
     CREATE POLICY "Authenticated users can upload"
     ON storage.objects FOR INSERT
     TO authenticated
     WITH CHECK (bucket_id = 'institution-logos');
     ```

   - **UPDATE/DELETE Policy (Admin Only):**
     ```sql
     CREATE POLICY "Admins can update/delete"
     ON storage.objects FOR UPDATE, DELETE
     TO authenticated
     USING (
         bucket_id = 'institution-logos' AND
         EXISTS (
             SELECT 1 FROM public.user_profiles
             WHERE id = auth.uid() AND role = 'internal_admin'
         )
     );
     ```

   **Note:** Repeat for `institution-banners` and `user-avatars`, changing the bucket name in each policy.

---

### Step 4: Verify Database Schema

1. **Check Tables Created:**
   - Go to **Table Editor** in Supabase Dashboard
   - You should see 24 tables in the `public` schema
   - Key tables to verify:
     - `user_profiles`
     - `institutions`
     - `programs`
     - `application_windows`
     - `transactions`

2. **Verify RLS is Enabled:**
   - Click on any table (e.g., `institutions`)
   - Check that **"RLS enabled"** shows `true`
   - View policies by clicking **"Policies"** tab

3. **Run Verification Query:**
   ```sql
   -- Check all tables were created
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_type = 'BASE TABLE'
   ORDER BY table_name;

   -- Should return 24 tables
   ```

4. **Check Indexes:**
   ```sql
   -- Verify indexes were created
   SELECT
       tablename,
       indexname,
       indexdef
   FROM pg_indexes
   WHERE schemaname = 'public'
   ORDER BY tablename, indexname;

   -- Should return 60+ indexes
   ```

5. **Test Functions:**
   ```sql
   -- Test timestamp update function
   SELECT public.update_window_status();

   -- Test materialized view refresh
   SELECT public.refresh_materialized_views();
   ```

---

### Step 5: Insert Sample/Seed Data (Optional)

For testing purposes, you can insert sample data:

```sql
-- Insert a test user profile (use a real auth.users ID)
INSERT INTO public.user_profiles (id, full_name, role, state)
VALUES (
    'YOUR_AUTH_USER_ID_HERE', -- Replace with actual UUID from auth.users
    'Test Student',
    'student',
    'Lagos'
);

-- Insert a test institution
INSERT INTO public.institutions (
    slug,
    name,
    short_name,
    type,
    state,
    city,
    status,
    verified
) VALUES (
    'university-of-lagos',
    'University of Lagos',
    'UNILAG',
    'federal_university',
    'Lagos',
    'Lagos',
    'published',
    true
) RETURNING *;

-- Insert a test program (use the institution ID from above)
INSERT INTO public.programs (
    institution_id,
    slug,
    name,
    degree_type,
    field_of_study,
    duration_years,
    status
) VALUES (
    'INSTITUTION_ID_FROM_ABOVE', -- Replace with actual UUID
    'computer-science',
    'Computer Science',
    'undergraduate',
    'Engineering',
    4.0,
    'published'
) RETURNING *;
```

---

### Step 6: Set Up Scheduled Database Jobs

Supabase uses pg_cron for scheduled jobs. Set these up to automate maintenance tasks.

1. **Update Application Window Status (Daily at 1 AM):**
   ```sql
   SELECT cron.schedule(
       'update-window-status',
       '0 1 * * *', -- Every day at 1 AM
       $$SELECT public.update_window_status();$$
   );
   ```

2. **Refresh Materialized Views (Daily at 2 AM):**
   ```sql
   SELECT cron.schedule(
       'refresh-materialized-views',
       '0 2 * * *', -- Every day at 2 AM
       $$SELECT public.refresh_materialized_views();$$
   );
   ```

3. **Verify Scheduled Jobs:**
   ```sql
   SELECT * FROM cron.job;
   ```

---

## Testing the Schema

### Test 1: Authentication & User Profile

```sql
-- Assuming you've signed up via Supabase Auth
-- Check if user profile was created (should auto-create via trigger if set up)
SELECT * FROM public.user_profiles
WHERE id = auth.uid();

-- If not exists, create manually
INSERT INTO public.user_profiles (id, full_name, role)
VALUES (auth.uid(), 'Your Name', 'student');
```

### Test 2: RLS Policies

```sql
-- Try to read published institutions (should work even if not authenticated)
SELECT id, name, type, state
FROM public.institutions
WHERE status = 'published'
LIMIT 5;

-- Try to insert an institution (should fail if not admin)
-- This should be blocked by RLS
INSERT INTO public.institutions (slug, name, type, state)
VALUES ('test-uni', 'Test University', 'federal_university', 'Lagos');
-- Expected: Permission denied due to RLS
```

### Test 3: Full-Text Search

```sql
-- Test institution search
SELECT id, name, state, type
FROM public.institutions
WHERE search_vector @@ to_tsquery('english', 'university | lagos')
AND status = 'published'
ORDER BY ts_rank(search_vector, to_tsquery('english', 'university | lagos')) DESC
LIMIT 10;
```

### Test 4: Geospatial Queries (if you have location data)

```sql
-- Find institutions near a location (e.g., Lagos: 6.5244, 3.3792)
SELECT
    name,
    city,
    ST_Distance(
        geolocation,
        ST_SetSRID(ST_MakePoint(3.3792, 6.5244), 4326)
    ) / 1000 AS distance_km
FROM public.institutions
WHERE geolocation IS NOT NULL
ORDER BY geolocation <-> ST_SetSRID(ST_MakePoint(3.3792, 6.5244), 4326)
LIMIT 10;
```

---

## Database Performance Optimization

### 1. Analyze Query Performance

```sql
-- Check slow queries
SELECT
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### 2. Check Index Usage

```sql
-- Find unused indexes
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
AND idx_scan = 0
ORDER BY tablename, indexname;
```

### 3. Vacuum and Analyze

```sql
-- Update table statistics for query planner
ANALYZE public.institutions;
ANALYZE public.programs;

-- Full vacuum (run during low-traffic periods)
VACUUM FULL ANALYZE;
```

---

## Backup & Recovery

### Automatic Backups (Supabase Pro)

Supabase automatically backs up your database:
- **Frequency:** Daily
- **Retention:** 7 days (Pro plan)
- **Point-in-Time Recovery:** Last 7 days

### Manual Backup

```bash
# Export entire database
pg_dump -h db.jvmmexjbnolzukhdhwds.supabase.co \
  -U postgres \
  -d postgres \
  -F custom \
  -f admitly_backup_$(date +%Y%m%d).dump

# Export schema only (no data)
pg_dump -h db.jvmmexjbnolzukhdhwds.supabase.co \
  -U postgres \
  -d postgres \
  --schema-only \
  -f admitly_schema.sql
```

### Restore from Backup

```bash
# Restore entire database
pg_restore -h db.jvmmexjbnolzukhdhwds.supabase.co \
  -U postgres \
  -d postgres \
  -c \
  admitly_backup_20250115.dump
```

---

## Troubleshooting

### Issue 1: "extension postgis does not exist"

**Solution:**
```sql
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
```

If this fails, contact Supabase support to enable PostGIS for your project.

---

### Issue 2: "permission denied for schema public"

**Solution:**
Make sure you're running the migration as the `postgres` user (default in Supabase SQL Editor).

```sql
-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO postgres;
```

---

### Issue 3: RLS Blocking Legitimate Queries

**Temporarily disable RLS for debugging (NOT for production):**
```sql
-- Disable RLS on a table
ALTER TABLE public.institutions DISABLE ROW LEVEL SECURITY;

-- Test your query
SELECT * FROM public.institutions;

-- Re-enable RLS
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
```

**Check which policy is blocking:**
```sql
-- View all policies on a table
SELECT *
FROM pg_policies
WHERE tablename = 'institutions';
```

---

### Issue 4: Slow Queries

**Solution:**
```sql
-- Use EXPLAIN ANALYZE to understand query performance
EXPLAIN ANALYZE
SELECT * FROM public.programs
WHERE field_of_study = 'Engineering'
AND status = 'published';

-- If missing index, create one
CREATE INDEX idx_programs_field_status
ON public.programs(field_of_study, status)
WHERE deleted_at IS NULL;
```

---

### Issue 5: Materialized View Not Updating

**Solution:**
```sql
-- Manually refresh the materialized view
REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_popular_institutions;

-- Check if scheduled job is running
SELECT * FROM cron.job WHERE jobname = 'refresh-materialized-views';

-- Check job execution history
SELECT * FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'refresh-materialized-views')
ORDER BY start_time DESC
LIMIT 10;
```

---

## Database Monitoring

### Key Metrics to Monitor

1. **Connection Count:**
   ```sql
   SELECT count(*) FROM pg_stat_activity;
   ```

2. **Database Size:**
   ```sql
   SELECT
       pg_size_pretty(pg_database_size('postgres')) AS database_size;
   ```

3. **Table Sizes:**
   ```sql
   SELECT
       schemaname,
       tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
   FROM pg_tables
   WHERE schemaname = 'public'
   ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
   ```

4. **Active Queries:**
   ```sql
   SELECT
       pid,
       usename,
       application_name,
       state,
       query,
       query_start
   FROM pg_stat_activity
   WHERE state != 'idle'
   ORDER BY query_start;
   ```

---

## Next Steps After Schema Setup

Once the database schema is set up successfully:

1. **✅ Schema Setup** - Complete
2. **⏳ Test Backend API** - Connect FastAPI to Supabase
3. **⏳ Test Frontend** - Connect React app to Supabase
4. **⏳ Set Up Meilisearch** - Sync data for search
5. **⏳ Create Render Services** - Deploy to production
6. **⏳ Configure Domain DNS** - Point to Render services

---

## Useful SQL Snippets

### Reset a Table (Keep Schema)

```sql
-- Delete all data but keep structure
TRUNCATE TABLE public.institutions CASCADE;
```

### Find Duplicate Records

```sql
-- Find duplicate institution slugs
SELECT slug, COUNT(*)
FROM public.institutions
GROUP BY slug
HAVING COUNT(*) > 1;
```

### Update Multiple Records

```sql
-- Mark all draft institutions as published
UPDATE public.institutions
SET status = 'published', updated_at = NOW()
WHERE status = 'draft'
AND verified = true;
```

### Export Data to JSON

```sql
-- Export all institutions as JSON
COPY (
    SELECT json_agg(row_to_json(t))
    FROM (
        SELECT id, name, type, state, city
        FROM public.institutions
        WHERE status = 'published'
    ) t
) TO '/tmp/institutions.json';
```

---

## Support & Resources

**Supabase Documentation:**
- Database: https://supabase.com/docs/guides/database
- RLS: https://supabase.com/docs/guides/auth/row-level-security
- Storage: https://supabase.com/docs/guides/storage

**PostgreSQL Documentation:**
- Official Docs: https://www.postgresql.org/docs/
- Full-Text Search: https://www.postgresql.org/docs/current/textsearch.html
- PostGIS: https://postgis.net/documentation/

**Admitly Project:**
- Database Schema: `specs/database-schema.md`
- API Specification: `specs/api-specification.md`
- Security Compliance: `specs/security-compliance.md`

---

**Last Updated:** January 2025
**Status:** Production Ready ✅
**Migration Version:** 001
