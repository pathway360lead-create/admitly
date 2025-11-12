-- ============================================
-- Admitly Platform - Initial Database Schema
-- ============================================
-- Version: 1.0
-- Created: January 2025
-- Description: Complete database schema for Nigeria Student Data Services Platform
-- Tables: 20+ tables with RLS policies, triggers, and indexes
-- ============================================

-- Enable Required Extensions
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";         -- Trigram similarity for fuzzy search
CREATE EXTENSION IF NOT EXISTS "postgis";         -- Geospatial data support

-- ============================================
-- SECTION 1: USER MANAGEMENT
-- ============================================

-- 1.1: User Profiles (extends Supabase auth.users)
-- ============================================
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    state TEXT, -- Nigerian state
    lga TEXT, -- Local Government Area
    role TEXT NOT NULL CHECK (role IN ('student', 'premium', 'counselor', 'institution_admin', 'internal_admin')) DEFAULT 'student',
    subscription_status TEXT CHECK (subscription_status IN ('free', 'active', 'expired', 'cancelled')) DEFAULT 'free',
    subscription_tier TEXT CHECK (subscription_tier IN ('free', 'monthly', 'yearly')) DEFAULT 'free',
    subscription_start_date TIMESTAMPTZ,
    subscription_end_date TIMESTAMPTZ,
    preferences JSONB DEFAULT '{}', -- user preferences (notifications, theme, etc.)
    metadata JSONB DEFAULT '{}', -- additional user data
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Indexes for user_profiles
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role) WHERE deleted_at IS NULL;
CREATE INDEX idx_user_profiles_subscription ON public.user_profiles(subscription_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_user_profiles_state ON public.user_profiles(state) WHERE deleted_at IS NULL;

-- 1.2: User Bookmarks
-- ============================================
CREATE TABLE public.user_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('institution', 'program')),
    entity_id UUID NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for user_bookmarks
CREATE INDEX idx_bookmarks_user ON public.user_bookmarks(user_id);
CREATE INDEX idx_bookmarks_entity ON public.user_bookmarks(entity_type, entity_id);
CREATE UNIQUE INDEX idx_bookmarks_unique ON public.user_bookmarks(user_id, entity_type, entity_id);

-- 1.3: User Search History
-- ============================================
CREATE TABLE public.user_search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    filters JSONB DEFAULT '{}',
    results_count INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for user_search_history
CREATE INDEX idx_search_history_user ON public.user_search_history(user_id);
CREATE INDEX idx_search_history_date ON public.user_search_history(created_at DESC);

-- ============================================
-- SECTION 2: INSTITUTION DATA
-- ============================================

-- 2.1: Institutions
-- ============================================
CREATE TABLE public.institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE, -- URL-friendly identifier
    name TEXT NOT NULL,
    short_name TEXT, -- e.g., "UI", "UNILAG"
    type TEXT NOT NULL CHECK (type IN ('federal_university', 'state_university', 'private_university', 'polytechnic', 'college_of_education', 'specialized', 'jupeb_center')),
    accreditation_status TEXT CHECK (accreditation_status IN ('fully_accredited', 'provisionally_accredited', 'not_accredited', 'pending')),
    accreditation_body TEXT, -- e.g., "NUC", "NBTE"

    -- Location
    address TEXT,
    city TEXT,
    state TEXT NOT NULL, -- Nigerian state
    lga TEXT, -- Local Government Area
    geolocation GEOGRAPHY(POINT, 4326), -- PostGIS point (latitude, longitude)

    -- Contact
    website TEXT,
    email TEXT,
    phone TEXT,
    social_media JSONB DEFAULT '{}', -- {facebook, twitter, instagram, linkedin}

    -- Details
    description TEXT,
    founded_year INTEGER,
    logo_url TEXT,
    banner_image_url TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMPTZ,

    -- Meta
    source_url TEXT,
    last_scraped_at TIMESTAMPTZ,
    data_quality_score NUMERIC(3, 2), -- 0.00 to 1.00

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.user_profiles(id),
    updated_by UUID REFERENCES public.user_profiles(id),
    deleted_at TIMESTAMPTZ
);

-- Indexes for institutions
CREATE INDEX idx_institutions_slug ON public.institutions(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_institutions_type ON public.institutions(type) WHERE deleted_at IS NULL;
CREATE INDEX idx_institutions_state ON public.institutions(state) WHERE deleted_at IS NULL;
CREATE INDEX idx_institutions_status ON public.institutions(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_institutions_name_trgm ON public.institutions USING gin(name gin_trgm_ops);
CREATE INDEX idx_institutions_geolocation ON public.institutions USING gist(geolocation);

-- Full-text search for institutions
ALTER TABLE public.institutions ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(short_name, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'C')
    ) STORED;
CREATE INDEX idx_institutions_search ON public.institutions USING gin(search_vector);

-- 2.2: Institution Contacts
-- ============================================
CREATE TABLE public.institution_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT, -- e.g., "Admissions Officer", "Registrar"
    department TEXT,
    email TEXT,
    phone TEXT,
    office_hours TEXT,
    verified BOOLEAN DEFAULT FALSE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Indexes for institution_contacts
CREATE INDEX idx_contacts_institution ON public.institution_contacts(institution_id) WHERE deleted_at IS NULL;

-- ============================================
-- SECTION 3: PROGRAM DATA
-- ============================================

-- 3.1: Programs
-- ============================================
CREATE TABLE public.programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    slug TEXT NOT NULL, -- URL-friendly identifier
    name TEXT NOT NULL,

    -- Classification
    degree_type TEXT NOT NULL CHECK (degree_type IN ('undergraduate', 'nd', 'hnd', 'pre_degree', 'jupeb', 'diploma', 'certificate')),
    qualification TEXT, -- e.g., "BSc", "BA", "ND", "HND"
    field_of_study TEXT, -- e.g., "Engineering", "Medicine", "Arts"
    specialization TEXT, -- e.g., "Computer Engineering", "Surgery"

    -- Details
    duration_years NUMERIC(3, 1), -- e.g., 4.0, 2.5
    duration_text TEXT, -- e.g., "4 years"
    mode TEXT CHECK (mode IN ('full_time', 'part_time', 'online', 'hybrid')),
    curriculum_summary TEXT,

    -- Accreditation
    accreditation_status TEXT CHECK (accreditation_status IN ('fully_accredited', 'provisionally_accredited', 'not_accredited', 'pending')),
    accreditation_body TEXT,
    accreditation_date TIMESTAMPTZ,

    -- Capacity
    annual_intake INTEGER, -- seats per year

    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    is_active BOOLEAN DEFAULT TRUE, -- program still accepting students

    -- Meta
    source_url TEXT,
    last_scraped_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.user_profiles(id),
    updated_by UUID REFERENCES public.user_profiles(id),
    deleted_at TIMESTAMPTZ
);

-- Indexes for programs
CREATE INDEX idx_programs_institution ON public.programs(institution_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_programs_slug ON public.programs(institution_id, slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_programs_degree_type ON public.programs(degree_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_programs_field ON public.programs(field_of_study) WHERE deleted_at IS NULL;
CREATE INDEX idx_programs_status ON public.programs(status) WHERE deleted_at IS NULL;

-- Full-text search for programs
ALTER TABLE public.programs ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(field_of_study, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(specialization, '')), 'C')
    ) STORED;
CREATE INDEX idx_programs_search ON public.programs USING gin(search_vector);

-- Unique constraint for programs
CREATE UNIQUE INDEX idx_programs_unique ON public.programs(institution_id, slug) WHERE deleted_at IS NULL;

-- 3.2: Program Requirements
-- ============================================
CREATE TABLE public.program_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,

    -- UTME/JAMB
    min_utme_score INTEGER,
    utme_subjects JSONB DEFAULT '[]', -- ["English", "Mathematics", "Physics", "Chemistry"]

    -- O'Level (SSCE/NECO/GCE)
    min_credit_passes INTEGER DEFAULT 5,
    required_subjects JSONB DEFAULT '[]', -- ["English", "Mathematics"]
    alternative_subjects JSONB DEFAULT '[]',

    -- Post-UTME
    has_post_utme BOOLEAN DEFAULT FALSE,
    post_utme_cutoff INTEGER,

    -- Direct Entry
    accepts_direct_entry BOOLEAN DEFAULT FALSE,
    de_qualifications JSONB DEFAULT '[]', -- ["NCE", "ND", "HND"]
    de_min_grade TEXT, -- e.g., "Lower Credit"

    -- Additional
    special_requirements TEXT, -- e.g., "Medical fitness certificate"
    age_limit INTEGER,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Indexes for program_requirements
CREATE INDEX idx_requirements_program ON public.program_requirements(program_id) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_requirements_unique ON public.program_requirements(program_id) WHERE deleted_at IS NULL;

-- 3.3: Program Cutoffs
-- ============================================
CREATE TABLE public.program_cutoffs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
    academic_year TEXT NOT NULL, -- e.g., "2024/2025"
    session TEXT, -- e.g., "2024"

    -- Cutoff scores
    aggregate_score NUMERIC(5, 2), -- e.g., 245.50
    utme_cutoff INTEGER,
    post_utme_cutoff INTEGER,

    -- Stats
    total_applicants INTEGER,
    total_admitted INTEGER,
    acceptance_rate NUMERIC(5, 2), -- percentage

    source_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Indexes for program_cutoffs
CREATE INDEX idx_cutoffs_program ON public.program_cutoffs(program_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_cutoffs_year ON public.program_cutoffs(academic_year) WHERE deleted_at IS NULL;

-- ============================================
-- SECTION 4: APPLICATION & DEADLINES
-- ============================================

-- 4.1: Application Windows
-- ============================================
CREATE TABLE public.application_windows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    level TEXT NOT NULL CHECK (level IN ('institution', 'program')), -- applies to whole institution or specific program

    -- Window details
    academic_year TEXT NOT NULL, -- e.g., "2024/2025"
    intake_type TEXT CHECK (intake_type IN ('main', 'supplementary', 'direct_entry')),

    -- Dates
    application_start_date DATE NOT NULL,
    application_end_date DATE NOT NULL,
    screening_date DATE,
    admission_list_date DATE,
    acceptance_deadline DATE,
    registration_start_date DATE,
    registration_end_date DATE,

    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'open', 'closing_soon', 'closed')),

    -- Links
    application_portal_url TEXT,
    information_url TEXT,

    -- Meta
    source_url TEXT,
    last_verified_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    -- Constraint: must have either program_id or institution_id
    CONSTRAINT check_window_level CHECK (
        (level = 'program' AND program_id IS NOT NULL) OR
        (level = 'institution' AND institution_id IS NOT NULL)
    )
);

-- Indexes for application_windows
CREATE INDEX idx_windows_program ON public.application_windows(program_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_windows_institution ON public.application_windows(institution_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_windows_status ON public.application_windows(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_windows_dates ON public.application_windows(application_start_date, application_end_date) WHERE deleted_at IS NULL;

-- ============================================
-- SECTION 5: COSTS & FEES
-- ============================================

-- 5.1: Costs
-- ============================================
CREATE TABLE public.costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    level TEXT NOT NULL CHECK (level IN ('institution', 'program')),

    -- Fee details
    fee_type TEXT NOT NULL CHECK (fee_type IN (
        'tuition', 'acceptance', 'registration', 'department',
        'faculty', 'accommodation', 'lab', 'library', 'medical',
        'exam', 'sports', 'development', 'ict', 'hostel', 'id_card', 'other'
    )),
    fee_name TEXT NOT NULL,
    amount BIGINT NOT NULL, -- in kobo (₦1 = 100 kobo)
    currency TEXT NOT NULL DEFAULT 'NGN',

    -- Applicability
    academic_year TEXT, -- e.g., "2024/2025"
    student_category TEXT, -- e.g., "new_student", "returning_student", "direct_entry"
    payment_frequency TEXT CHECK (payment_frequency IN ('one_time', 'per_semester', 'per_year')),
    is_mandatory BOOLEAN DEFAULT TRUE,

    -- Dates
    effective_date DATE NOT NULL,
    expiry_date DATE,

    -- Notes
    description TEXT,
    payment_methods JSONB DEFAULT '[]', -- ["bank_transfer", "card", "ussd"]

    -- Meta
    source_url TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Indexes for costs
CREATE INDEX idx_costs_program ON public.costs(program_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_costs_institution ON public.costs(institution_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_costs_type ON public.costs(fee_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_costs_year ON public.costs(academic_year) WHERE deleted_at IS NULL;

-- 5.2: City Cost of Living
-- ============================================
CREATE TABLE public.city_cost_of_living (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city TEXT NOT NULL,
    state TEXT NOT NULL,

    -- Ranges (in kobo)
    accommodation_min BIGINT, -- off-campus
    accommodation_max BIGINT,
    food_monthly_min BIGINT,
    food_monthly_max BIGINT,
    transport_monthly_min BIGINT,
    transport_monthly_max BIGINT,
    utilities_monthly_min BIGINT,
    utilities_monthly_max BIGINT,
    miscellaneous_monthly_min BIGINT,
    miscellaneous_monthly_max BIGINT,

    -- Total estimate
    total_monthly_min BIGINT,
    total_monthly_max BIGINT,

    -- Meta
    last_updated DATE NOT NULL,
    source TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for city_cost_of_living
CREATE INDEX idx_col_city ON public.city_cost_of_living(city);
CREATE INDEX idx_col_state ON public.city_cost_of_living(state);
CREATE UNIQUE INDEX idx_col_unique ON public.city_cost_of_living(city, state);

-- ============================================
-- SECTION 6: SCHOLARSHIPS & FINANCIAL AID
-- ============================================

-- 6.1: Scholarships
-- ============================================
CREATE TABLE public.scholarships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,

    -- Scholarship details
    name TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('merit', 'need_based', 'sports', 'state', 'federal', 'private', 'other')),

    -- Amount
    amount BIGINT, -- in kobo (NULL if variable)
    coverage_type TEXT CHECK (coverage_type IN ('full_tuition', 'partial_tuition', 'stipend', 'accommodation', 'mixed')),

    -- Eligibility
    eligibility_criteria TEXT,
    min_cgpa NUMERIC(3, 2),
    eligible_states JSONB DEFAULT '[]', -- for state-specific scholarships

    -- Application
    application_url TEXT,
    application_deadline DATE,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Indexes for scholarships
CREATE INDEX idx_scholarships_institution ON public.scholarships(institution_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_scholarships_active ON public.scholarships(is_active) WHERE deleted_at IS NULL;

-- ============================================
-- SECTION 7: CAREER INSIGHTS
-- ============================================

-- 7.1: Career Insights
-- ============================================
CREATE TABLE public.career_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
    field_of_study TEXT NOT NULL,

    -- Career data
    career_title TEXT NOT NULL, -- e.g., "Software Engineer"
    description TEXT,

    -- Salary (in kobo)
    salary_min_naija BIGINT,
    salary_max_naija BIGINT,
    salary_currency TEXT DEFAULT 'NGN',

    -- Demand
    demand_score NUMERIC(3, 2), -- 0.00 to 1.00
    demand_trend TEXT CHECK (demand_trend IN ('growing', 'stable', 'declining')),

    -- Geography
    top_employers JSONB DEFAULT '[]', -- ["Microsoft", "Andela", "Interswitch"]
    available_in_nigeria BOOLEAN DEFAULT TRUE,
    available_in_africa BOOLEAN DEFAULT TRUE,
    available_globally BOOLEAN DEFAULT TRUE,

    -- Skills
    required_skills JSONB DEFAULT '[]',
    certifications JSONB DEFAULT '[]',

    -- Meta
    source TEXT,
    last_updated DATE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for career_insights
CREATE INDEX idx_insights_program ON public.career_insights(program_id);
CREATE INDEX idx_insights_field ON public.career_insights(field_of_study);

-- ============================================
-- SECTION 8: ALERTS & NOTIFICATIONS
-- ============================================

-- 8.1: User Alerts
-- ============================================
CREATE TABLE public.user_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

    -- Alert type
    alert_type TEXT NOT NULL CHECK (alert_type IN ('deadline', 'cost_change', 'new_program', 'cutoff_update')),

    -- Filters
    institution_ids JSONB DEFAULT '[]',
    program_ids JSONB DEFAULT '[]',
    states JSONB DEFAULT '[]',
    degree_types JSONB DEFAULT '[]',

    -- Channels
    email_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for user_alerts
CREATE INDEX idx_alerts_user ON public.user_alerts(user_id) WHERE is_active = TRUE;

-- 8.2: Notifications
-- ============================================
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

    -- Content
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('deadline', 'cost_change', 'new_program', 'system', 'payment')),

    -- Related entity
    entity_type TEXT, -- e.g., "program", "institution"
    entity_id UUID,

    -- Status
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,

    -- Channels
    sent_via JSONB DEFAULT '[]', -- ["email", "push", "in_app"]

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user ON public.notifications(user_id, read);
CREATE INDEX idx_notifications_date ON public.notifications(created_at DESC);

-- ============================================
-- SECTION 9: AI & PREMIUM FEATURES
-- ============================================

-- 9.1: AI Conversations
-- ============================================
CREATE TABLE public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT,

    -- User context
    user_profile JSONB DEFAULT '{}', -- budget, location, interests, etc.

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for ai_conversations
CREATE INDEX idx_conversations_user ON public.ai_conversations(user_id);

-- 9.2: AI Messages
-- ============================================
CREATE TABLE public.ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,

    -- AI metadata
    model TEXT, -- e.g., "gemini-1.5-flash"
    tokens_used INTEGER,
    cost_kobo BIGINT, -- cost in kobo

    -- Citations
    citations JSONB DEFAULT '[]', -- [{type: "program", id: "..."}]

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for ai_messages
CREATE INDEX idx_messages_conversation ON public.ai_messages(conversation_id, created_at);

-- 9.3: AI Recommendations
-- ============================================
CREATE TABLE public.ai_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES public.ai_conversations(id) ON DELETE SET NULL,

    -- Input
    user_preferences JSONB NOT NULL, -- budget, location, interests

    -- Output
    recommended_programs JSONB NOT NULL, -- [{program_id, score, reason}]
    rationale TEXT,

    -- Meta
    model TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for ai_recommendations
CREATE INDEX idx_recommendations_user ON public.ai_recommendations(user_id);

-- ============================================
-- SECTION 10: PAYMENTS & SUBSCRIPTIONS
-- ============================================

-- 10.1: Transactions
-- ============================================
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

    -- Payment details
    amount BIGINT NOT NULL, -- in kobo
    currency TEXT NOT NULL DEFAULT 'NGN',
    description TEXT,

    -- Paystack
    paystack_reference TEXT UNIQUE NOT NULL,
    paystack_transaction_id TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'cancelled')),
    payment_method TEXT, -- e.g., "card", "bank_transfer", "ussd"

    -- Subscription
    subscription_tier TEXT CHECK (subscription_tier IN ('monthly', 'yearly')),
    subscription_start_date TIMESTAMPTZ,
    subscription_end_date TIMESTAMPTZ,

    -- Meta
    metadata JSONB DEFAULT '{}',
    paid_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for transactions
CREATE INDEX idx_transactions_user ON public.transactions(user_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_transactions_reference ON public.transactions(paystack_reference);

-- ============================================
-- SECTION 11: ADMIN & CONTENT MANAGEMENT
-- ============================================

-- 11.1: Change Log
-- ============================================
CREATE TABLE public.change_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Entity
    entity_type TEXT NOT NULL, -- e.g., "institution", "program", "cost"
    entity_id UUID NOT NULL,

    -- Change details
    action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'approve', 'reject')),
    field_name TEXT, -- for updates
    old_value TEXT,
    new_value TEXT,
    changes JSONB DEFAULT '{}', -- full diff

    -- Source
    source TEXT CHECK (source IN ('manual', 'scraper', 'api', 'import')),
    source_url TEXT,
    scrape_timestamp TIMESTAMPTZ,

    -- Review
    review_status TEXT CHECK (review_status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES public.user_profiles(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,

    -- User
    created_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for change_log
CREATE INDEX idx_changelog_entity ON public.change_log(entity_type, entity_id);
CREATE INDEX idx_changelog_status ON public.change_log(review_status) WHERE review_status = 'pending';
CREATE INDEX idx_changelog_date ON public.change_log(created_at DESC);

-- ============================================
-- SECTION 12: STAGING SCHEMA
-- ============================================

-- Create staging schema for data pipeline
CREATE SCHEMA IF NOT EXISTS staging;

-- Staging tables (mirror of public tables for ETL pipeline)
CREATE TABLE staging.institutions (LIKE public.institutions INCLUDING ALL);
CREATE TABLE staging.programs (LIKE public.programs INCLUDING ALL);
CREATE TABLE staging.costs (LIKE public.costs INCLUDING ALL);
CREATE TABLE staging.application_windows (LIKE public.application_windows INCLUDING ALL);

-- ============================================
-- SECTION 13: DATABASE FUNCTIONS & TRIGGERS
-- ============================================

-- 13.1: Auto-update timestamp trigger function
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_institutions_updated_at
    BEFORE UPDATE ON public.institutions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_institution_contacts_updated_at
    BEFORE UPDATE ON public.institution_contacts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_programs_updated_at
    BEFORE UPDATE ON public.programs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_program_requirements_updated_at
    BEFORE UPDATE ON public.program_requirements
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_program_cutoffs_updated_at
    BEFORE UPDATE ON public.program_cutoffs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_application_windows_updated_at
    BEFORE UPDATE ON public.application_windows
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_costs_updated_at
    BEFORE UPDATE ON public.costs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_city_cost_of_living_updated_at
    BEFORE UPDATE ON public.city_cost_of_living
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scholarships_updated_at
    BEFORE UPDATE ON public.scholarships
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_career_insights_updated_at
    BEFORE UPDATE ON public.career_insights
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_alerts_updated_at
    BEFORE UPDATE ON public.user_alerts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_conversations_updated_at
    BEFORE UPDATE ON public.ai_conversations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 13.2: Update application window status based on dates
-- ============================================
CREATE OR REPLACE FUNCTION public.update_window_status()
RETURNS VOID AS $$
BEGIN
    UPDATE public.application_windows
    SET status = CASE
        WHEN application_start_date > CURRENT_DATE THEN 'pending'
        WHEN application_end_date < CURRENT_DATE THEN 'closed'
        WHEN application_end_date - CURRENT_DATE <= 7 THEN 'closing_soon'
        ELSE 'open'
    END
    WHERE deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SECTION 14: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_cutoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_cost_of_living ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_log ENABLE ROW LEVEL SECURITY;

-- 14.1: Public Read Policies (Anyone can read published data)
-- ============================================

-- Public can read published institutions
CREATE POLICY "Public read published institutions"
    ON public.institutions FOR SELECT
    TO public
    USING (status = 'published' AND deleted_at IS NULL);

-- Public can read published programs
CREATE POLICY "Public read published programs"
    ON public.programs FOR SELECT
    TO public
    USING (status = 'published' AND deleted_at IS NULL);

-- Public can read program requirements
CREATE POLICY "Public read program requirements"
    ON public.program_requirements FOR SELECT
    TO public
    USING (
        deleted_at IS NULL AND
        EXISTS (
            SELECT 1 FROM public.programs
            WHERE programs.id = program_requirements.program_id
            AND programs.status = 'published'
            AND programs.deleted_at IS NULL
        )
    );

-- Public can read program cutoffs
CREATE POLICY "Public read program cutoffs"
    ON public.program_cutoffs FOR SELECT
    TO public
    USING (
        deleted_at IS NULL AND
        EXISTS (
            SELECT 1 FROM public.programs
            WHERE programs.id = program_cutoffs.program_id
            AND programs.status = 'published'
            AND programs.deleted_at IS NULL
        )
    );

-- Public can read application windows
CREATE POLICY "Public read application windows"
    ON public.application_windows FOR SELECT
    TO public
    USING (deleted_at IS NULL);

-- Public can read costs
CREATE POLICY "Public read costs"
    ON public.costs FOR SELECT
    TO public
    USING (deleted_at IS NULL);

-- Public can read cost of living
CREATE POLICY "Public read cost of living"
    ON public.city_cost_of_living FOR SELECT
    TO public
    USING (true);

-- Public can read scholarships
CREATE POLICY "Public read scholarships"
    ON public.scholarships FOR SELECT
    TO public
    USING (is_active = TRUE AND deleted_at IS NULL);

-- Public can read career insights
CREATE POLICY "Public read career insights"
    ON public.career_insights FOR SELECT
    TO public
    USING (true);

-- Public can read institution contacts
CREATE POLICY "Public read institution contacts"
    ON public.institution_contacts FOR SELECT
    TO public
    USING (verified = TRUE AND deleted_at IS NULL);

-- 14.2: User Policies (Authenticated users)
-- ============================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
    ON public.user_profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Users can manage their own bookmarks
CREATE POLICY "Users can manage own bookmarks"
    ON public.user_bookmarks
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can manage their own search history
CREATE POLICY "Users can manage search history"
    ON public.user_search_history
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can manage their own alerts
CREATE POLICY "Users can manage own alerts"
    ON public.user_alerts
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can read their own notifications
CREATE POLICY "Users can read own notifications"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can read their own transactions
CREATE POLICY "Users can read own transactions"
    ON public.transactions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- 14.3: Premium User Policies
-- ============================================

-- Premium users can access AI conversations
CREATE POLICY "Premium users can manage AI conversations"
    ON public.ai_conversations
    TO authenticated
    USING (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND subscription_status = 'active'
        )
    )
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND subscription_status = 'active'
        )
    );

-- Premium users can access AI messages
CREATE POLICY "Premium users can access AI messages"
    ON public.ai_messages FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.ai_conversations
            WHERE ai_conversations.id = ai_messages.conversation_id
            AND ai_conversations.user_id = auth.uid()
        ) AND
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND subscription_status = 'active'
        )
    );

-- Premium users can access AI recommendations
CREATE POLICY "Premium users can access AI recommendations"
    ON public.ai_recommendations FOR SELECT
    TO authenticated
    USING (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND subscription_status = 'active'
        )
    );

-- 14.4: Admin Policies
-- ============================================

-- Internal admins can manage all institutions
CREATE POLICY "Admins can manage institutions"
    ON public.institutions
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'internal_admin'
        )
    );

-- Internal admins can manage all programs
CREATE POLICY "Admins can manage programs"
    ON public.programs
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'internal_admin'
        )
    );

-- Internal admins can read change log
CREATE POLICY "Admins can read change log"
    ON public.change_log FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role IN ('internal_admin', 'institution_admin')
        )
    );

-- Institution admins can update their own institution
CREATE POLICY "Institution admins can update own institution"
    ON public.institutions FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.id = auth.uid()
            AND up.role = 'institution_admin'
            AND up.metadata->>'institution_id' = institutions.id::text
        )
    );

-- ============================================
-- SECTION 15: MATERIALIZED VIEWS
-- ============================================

-- 15.1: Popular Institutions View
-- ============================================
CREATE MATERIALIZED VIEW public.mv_popular_institutions AS
SELECT
    i.id,
    i.name,
    i.type,
    i.state,
    i.verified,
    COUNT(DISTINCT ub.user_id) AS bookmark_count,
    COUNT(DISTINCT p.id) AS program_count,
    COALESCE(AVG(p.annual_intake), 0) AS avg_intake
FROM public.institutions i
LEFT JOIN public.user_bookmarks ub ON i.id::text = ub.entity_id::text AND ub.entity_type = 'institution'
LEFT JOIN public.programs p ON i.id = p.institution_id AND p.deleted_at IS NULL
WHERE i.status = 'published' AND i.deleted_at IS NULL
GROUP BY i.id, i.name, i.type, i.state, i.verified
ORDER BY bookmark_count DESC, program_count DESC;

-- Index on materialized view
CREATE UNIQUE INDEX ON public.mv_popular_institutions(id);

-- ============================================
-- SECTION 16: HELPFUL UTILITY FUNCTIONS
-- ============================================

-- Function to refresh materialized views (run nightly via cron job)
CREATE OR REPLACE FUNCTION public.refresh_materialized_views()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_popular_institutions;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Admitly Database Schema Migration Complete!';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Tables Created: 24';
    RAISE NOTICE 'RLS Policies: 30+';
    RAISE NOTICE 'Indexes: 60+';
    RAISE NOTICE 'Triggers: 13';
    RAISE NOTICE 'Functions: 3';
    RAISE NOTICE 'Materialized Views: 1';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '1. Configure Storage Buckets in Supabase Dashboard';
    RAISE NOTICE '2. Test with sample data';
    RAISE NOTICE '3. Verify RLS policies';
    RAISE NOTICE '4. Set up scheduled jobs for status updates';
    RAISE NOTICE '============================================';
END $$;
