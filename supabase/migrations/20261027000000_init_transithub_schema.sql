-- ==============================================================================
-- TransitHub Mbarara: Phase 2 Database Schema & Row Level Security (RLS)
-- Location: Mbarara Municipality, Uganda
-- Description: Core schema for passengers, boda boda riders, taxi operators,
--              stages, trip dispatches, permit verifications, and safety reports.
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Custom Types & Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('passenger', 'driver', 'admin');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE vehicle_type AS ENUM ('boda', 'taxi', 'special_hire');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('not_applied', 'pending', 'verified', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE trip_status AS ENUM ('requested', 'accepted', 'arriving', 'in_progress', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 3. Profiles Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    phone TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'passenger',
    email TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for phone queries
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- 4. Transit Stages Table (Mbarara Municipal Official Corridors)
CREATE TABLE IF NOT EXISTS public.stages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    division TEXT NOT NULL,
    description TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Drivers & Operators Table
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_type vehicle_type NOT NULL DEFAULT 'boda',
    vehicle_plate TEXT NOT NULL,
    vehicle_model TEXT NOT NULL,
    stage_id TEXT REFERENCES public.stages(id) ON DELETE SET NULL,
    stage_name TEXT NOT NULL,
    license_number TEXT NOT NULL,
    nin_number TEXT NOT NULL,
    psv_badge_number TEXT,
    stage_chairperson_name TEXT,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
    total_trips INTEGER NOT NULL DEFAULT 0,
    is_online BOOLEAN NOT NULL DEFAULT FALSE,
    verification_status verification_status NOT NULL DEFAULT 'pending',
    permit_document_url TEXT,
    last_active TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drivers_online_status ON public.drivers(is_online, verification_status);
CREATE INDEX IF NOT EXISTS idx_drivers_stage ON public.drivers(stage_id);

-- 6. Trips & Bookings Table
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passenger_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    pickup_stage_id TEXT NOT NULL REFERENCES public.stages(id),
    pickup_stage_name TEXT NOT NULL,
    destination_stage_id TEXT NOT NULL REFERENCES public.stages(id),
    destination_stage_name TEXT NOT NULL,
    vehicle_type vehicle_type NOT NULL DEFAULT 'boda',
    fare_ugx INTEGER NOT NULL,
    status trip_status NOT NULL DEFAULT 'requested',
    distance_km NUMERIC(5, 2) NOT NULL DEFAULT 2.0,
    driver_rating INTEGER CHECK (driver_rating >= 1 AND driver_rating <= 5),
    cancel_reason TEXT,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_trips_passenger ON public.trips(passenger_id);
CREATE INDEX IF NOT EXISTS idx_trips_driver ON public.trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON public.trips(status);

-- 7. Safety Incidents & SOS Reports
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
    reported_driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    report_type TEXT NOT NULL,
    description TEXT NOT NULL,
    location_name TEXT,
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- ==============================================================================
-- Row-Level Security (RLS) Policies
-- ==============================================================================

-- Enable RLS on all public tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Stages Policies
CREATE POLICY "Stages are viewable by all authenticated users"
    ON public.stages FOR SELECT
    TO authenticated
    USING (true);

-- Drivers Policies
CREATE POLICY "Drivers viewable by authenticated users"
    ON public.drivers FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Drivers can insert their own application"
    ON public.drivers FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Drivers can update their own status"
    ON public.drivers FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Trips Policies
CREATE POLICY "Passengers and drivers can view relevant trips"
    ON public.trips FOR SELECT
    TO authenticated
    USING (
        auth.uid() = passenger_id OR
        auth.uid() = driver_id OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Passengers can create trip requests"
    ON public.trips FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = passenger_id);

CREATE POLICY "Participants can update trips"
    ON public.trips FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = passenger_id OR
        auth.uid() = driver_id OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Reports Policies
CREATE POLICY "Users can create reports"
    ON public.reports FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports or admins can view all"
    ON public.reports FOR SELECT
    TO authenticated
    USING (
        auth.uid() = reporter_id OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can update reports"
    ON public.reports FOR UPDATE
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ==============================================================================
-- Initial Seed Data: Mbarara Transit Stages
-- ==============================================================================
INSERT INTO public.stages (id, name, division, description, latitude, longitude)
VALUES
    ('stg_taxi_park', 'Mbarara Central Taxi Park', 'Kamukuzi', 'Primary regional taxi terminus on Bananuka Drive', -0.6072, 30.6545),
    ('stg_boda_kakoba', 'Kakoba Boda Stage', 'Kakoba', 'High-density stage near Kakoba Market & Vocational Institute', -0.6135, 30.6698),
    ('stg_must_gate', 'MUST Main Gate Stage', 'Kamukuzi', 'Mbarara University of Science & Technology student hub', -0.6148, 30.6582),
    ('stg_mile_2', 'Mile 2 (Kamukuzi Hill)', 'Kamukuzi', 'Masaka Road junction connecting Ruharo & administration block', -0.5985, 30.6482),
    ('stg_ruharo', 'Ruharo Cathedral Stage', 'Kamukuzi', 'Church & school transit access point on Bushenyi Road', -0.6121, 30.6355),
    ('stg_high_street', 'High Street (Centenary Bank)', 'Kamukuzi', 'Central Commercial District banking corridor', -0.6065, 30.6575),
    ('stg_katete_bridge', 'Katete Bridge Stage', 'Nyamitanga', 'Key River Rwizi crossing link to Katete residential areas', -0.6192, 30.6531),
    ('stg_nyamitanga', 'Nyamitanga Junction', 'Nyamitanga', 'Kabale-Rwanda road transit junction near Cathedral', -0.6275, 30.6468),
    ('stg_rwebikoona', 'Rwebikoona Market Stage', 'Kamukuzi', 'Fresh produce market & evening commuter hub', -0.6012, 30.6425),
    ('stg_koranorya', 'Koranorya Trading Centre', 'Biharwe', 'Eastern municipal entry gate from Kampala-Masaka highway', -0.5845, 30.6892)
ON CONFLICT (id) DO NOTHING;
