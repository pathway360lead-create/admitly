-- ============================================
-- Migration: Enhance Admin RLS Policies
-- ============================================
-- Created: 2025-12-25
-- Purpose: Replace overly permissive admin policies with granular INSERT/UPDATE/SELECT policies
--          This enables removal of service_role key usage in favor of token-based RLS enforcement

-- ============================================
-- STEP 1: Drop Old Permissive Policies
-- ============================================

DROP POLICY IF EXISTS "Admins can manage institutions" ON public.institutions;
DROP POLICY IF EXISTS "Admins can manage programs" ON public.programs;

-- ============================================
-- STEP 2: Create Granular Institution Policies
-- ============================================

-- Allow admins to INSERT new institutions
CREATE POLICY "Admins can insert institutions"
    ON public.institutions FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'internal_admin'
        )
    );

-- Allow admins to SELECT all institutions (including drafts/archived)
CREATE POLICY "Admins can select all institutions"
    ON public.institutions FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'internal_admin'
        )
    );

-- Allow admins to UPDATE any institution
CREATE POLICY "Admins can update institutions"
    ON public.institutions FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'internal_admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'internal_admin'
        )
    );

-- Allow admins to DELETE (soft delete) institutions
CREATE POLICY "Admins can delete institutions"
    ON public.institutions FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'internal_admin'
        )
    );

-- ============================================
-- STEP 3: Create Granular Program Policies
-- ============================================

-- Allow admins to INSERT new programs
CREATE POLICY "Admins can insert programs"
    ON public.programs FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'internal_admin'
        )
    );

-- Allow admins to SELECT all programs (including drafts/archived)
CREATE POLICY "Admins can select all programs"
    ON public.programs FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'internal_admin'
        )
    );

-- Allow admins to UPDATE any program
CREATE POLICY "Admins can update programs"
    ON public.programs FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'internal_admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'internal_admin'
        )
    );

-- Allow admins to DELETE (soft delete) programs
CREATE POLICY "Admins can delete programs"
    ON public.programs FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'internal_admin'
        )
    );

-- ============================================
-- STEP 4: Add Policies for Related Tables
-- ============================================

-- Costs table
CREATE POLICY "Admins can manage costs"
    ON public.costs
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'internal_admin'
        )
    );

-- Application windows table
CREATE POLICY "Admins can manage application windows"
    ON public.application_windows
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'internal_admin'
        )
    );

-- Program requirements table
CREATE POLICY "Admins can manage program requirements"
    ON public.program_requirements
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'internal_admin'
        )
    );

-- Program cutoffs table
CREATE POLICY "Admins can manage program cutoffs"
    ON public.program_cutoffs
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'internal_admin'
        )
    );

-- Institution contacts table
CREATE POLICY "Admins can manage institution contacts"
    ON public.institution_contacts
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'internal_admin'
        )
    );

-- ============================================
-- STEP 5: Add Documentation Comments
-- ============================================

COMMENT ON POLICY "Admins can insert institutions" ON public.institutions IS
    'Allows users with internal_admin role to create new institutions';

COMMENT ON POLICY "Admins can select all institutions" ON public.institutions IS
    'Allows users with internal_admin role to view all institutions including drafts and archived';

COMMENT ON POLICY "Admins can update institutions" ON public.institutions IS
    'Allows users with internal_admin role to update any institution';

COMMENT ON POLICY "Admins can delete institutions" ON public.institutions IS
    'Allows users with internal_admin role to soft delete institutions';

COMMENT ON POLICY "Admins can insert programs" ON public.programs IS
    'Allows users with internal_admin role to create new programs';

COMMENT ON POLICY "Admins can select all programs" ON public.programs IS
    'Allows users with internal_admin role to view all programs including drafts and archived';

COMMENT ON POLICY "Admins can update programs" ON public.programs IS
    'Allows users with internal_admin role to update any program';

COMMENT ON POLICY "Admins can delete programs" ON public.programs IS
    'Allows users with internal_admin role to soft delete programs';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these queries after applying migration to verify policies exist:

-- Check institution policies
-- SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'institutions' AND policyname LIKE '%Admin%';

-- Check program policies
-- SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'programs' AND policyname LIKE '%Admin%';

-- Check all admin-related policies
-- SELECT schemaname, tablename, policyname, cmd 
-- FROM pg_policies 
-- WHERE policyname LIKE '%Admin%' OR policyname LIKE '%admin%'
-- ORDER BY tablename, policyname;
