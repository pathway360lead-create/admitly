-- Fix RLS policy for user_profiles to allow signup
-- Issue: New users cannot create their profile during registration
-- Fix: Add INSERT policy allowing authenticated users to create their own profile

-- Allow users to insert their own profile (during signup)
CREATE POLICY "Users can create own profile"
    ON public.user_profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);
