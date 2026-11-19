-- ==============================================================================
-- TransitHub Mbarara: Row-Level Security (RLS) Fix for Admin Portal & Public Queries
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/lhevzrmskzvablxbrxus/sql/new
-- ==============================================================================

-- 1. PROFILES: Allow reading profiles and public user accounts
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

-- Allow inserting/updating profiles
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Allow insert profile"
    ON public.profiles FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Allow update profile"
    ON public.profiles FOR UPDATE
    USING (true);

-- 2. STAGES: Allow viewing, inserting, updating, and deleting transit stages
DROP POLICY IF EXISTS "Stages are viewable by all authenticated users" ON public.stages;
DROP POLICY IF EXISTS "Stages are viewable by everyone" ON public.stages;
CREATE POLICY "Stages are viewable by everyone"
    ON public.stages FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow stage creation" ON public.stages;
CREATE POLICY "Allow stage creation"
    ON public.stages FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow stage update" ON public.stages;
CREATE POLICY "Allow stage update"
    ON public.stages FOR UPDATE
    USING (true);

DROP POLICY IF EXISTS "Allow stage deletion" ON public.stages;
CREATE POLICY "Allow stage deletion"
    ON public.stages FOR DELETE
    USING (true);

-- 3. DRIVERS: Allow viewing, updating, and inserting drivers
DROP POLICY IF EXISTS "Drivers viewable by authenticated users" ON public.drivers;
DROP POLICY IF EXISTS "Drivers viewable by everyone" ON public.drivers;
CREATE POLICY "Drivers viewable by everyone"
    ON public.drivers FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Drivers can insert their own application" ON public.drivers;
CREATE POLICY "Allow driver application insert"
    ON public.drivers FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Drivers can update their own status" ON public.drivers;
CREATE POLICY "Allow driver status update"
    ON public.drivers FOR UPDATE
    USING (true);

-- 4. TRIPS: Allow viewing and updating trips
DROP POLICY IF EXISTS "Passengers and drivers can view relevant trips" ON public.trips;
DROP POLICY IF EXISTS "Trips viewable by everyone" ON public.trips;
CREATE POLICY "Trips viewable by everyone"
    ON public.trips FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Passengers can create trip requests" ON public.trips;
CREATE POLICY "Allow trip creation"
    ON public.trips FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Participants can update trips" ON public.trips;
CREATE POLICY "Allow trip updates"
    ON public.trips FOR UPDATE
    USING (true);

-- 5. REPORTS: Allow viewing, inserting, and updating safety reports
DROP POLICY IF EXISTS "Users can create reports" ON public.reports;
CREATE POLICY "Allow report creation"
    ON public.reports FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own reports or admins can view all" ON public.reports;
DROP POLICY IF EXISTS "Reports viewable by everyone" ON public.reports;
CREATE POLICY "Reports viewable by everyone"
    ON public.reports FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins can update reports" ON public.reports;
CREATE POLICY "Allow report updates"
    ON public.reports FOR UPDATE
    USING (true);

-- ==============================================================================
-- Success confirmation
-- ==============================================================================
SELECT 'RLS policies updated successfully for TransitHub!' as status;
