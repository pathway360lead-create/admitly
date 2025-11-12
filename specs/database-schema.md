# Database Schema Specification

## Overview
Complete PostgreSQL database schema for the Nigeria Student Data Services Platform using Supabase with Row Level Security (RLS) policies.

---

## Schema Design Principles
1. **Normalization:** 3NF for data integrity
2. **Audit Trail:** All tables have created_at, updated_at, updated_by
3. **Soft Deletes:** deleted_at column instead of hard deletes
4. **Versioning:** Historical data via changelog
5. **Performance:** Strategic indexes on search/filter columns
6. **Security:** RLS policies for multi-tenant access

---

## Database Tables

### 1. User Management

#### 1.1 `auth.users` (Supabase Auth - Built-in)
```sql
-- Managed by Supabase Auth
-- Fields: id (uuid), email, encrypted_password, email_confirmed_at, etc.
```

#### 1.2 `public.user_profiles`
```sql
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    state TEXT, -- Nigerian state
    lga TEXT, -- Local Government Area
    role TEXT NOT NULL CHECK (role IN ('student', 'premium', 'counselor', 'institution_admin', 'internal_admin')),
    subscription_status TEXT CHECK (subscription_status IN ('free', 'active', 'expired', 'cancelled')),
    subscription_tier TEXT CHECK (subscription_tier IN ('free', 'monthly', 'yearly')),
    subscription_start_date TIMESTAMPTZ,
    subscription_end_date TIMESTAMPTZ,
    preferences JSONB DEFAULT '{}', -- user preferences (notifications, theme, etc.)
    metadata JSONB DEFAULT '{}', -- additional user data
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_user_profiles_role ON public.user_profiles(role) WHERE deleted_at IS NULL;
CREATE INDEX idx_user_profiles_subscription ON public.user_profiles(subscription_status) WHERE deleted_at IS NULL;
```

#### 1.3 `public.user_bookmarks`
```sql
CREATE TABLE public.user_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('institution', 'program')),
    entity_id UUID NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookmarks_user ON public.user_bookmarks(user_id);
CREATE INDEX idx_bookmarks_entity ON public.user_bookmarks(entity_type, entity_id);
CREATE UNIQUE INDEX idx_bookmarks_unique ON public.user_bookmarks(user_id, entity_type, entity_id);
```

#### 1.4 `public.user_search_history`
```sql
CREATE TABLE public.user_search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    filters JSONB DEFAULT '{}',
    results_count INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_search_history_user ON public.user_search_history(user_id);
CREATE INDEX idx_search_history_date ON public.user_search_history(created_at DESC);
```

---

### 2. Institution Data

#### 2.1 `public.institutions`
```sql
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
    geolocation POINT, -- PostGIS point (latitude, longitude)

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

CREATE INDEX idx_institutions_slug ON public.institutions(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_institutions_type ON public.institutions(type) WHERE deleted_at IS NULL;
CREATE INDEX idx_institutions_state ON public.institutions(state) WHERE deleted_at IS NULL;
CREATE INDEX idx_institutions_status ON public.institutions(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_institutions_name_trgm ON public.institutions USING gin(name gin_trgm_ops);
CREATE INDEX idx_institutions_geolocation ON public.institutions USING gist(geolocation);

-- Full-text search
ALTER TABLE public.institutions ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(short_name, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'C')
    ) STORED;
CREATE INDEX idx_institutions_search ON public.institutions USING gin(search_vector);
```

#### 2.2 `public.institution_contacts`
```sql
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

CREATE INDEX idx_contacts_institution ON public.institution_contacts(institution_id) WHERE deleted_at IS NULL;
```

---

### 3. Program Data

#### 3.1 `public.programs`
```sql
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

CREATE INDEX idx_programs_institution ON public.programs(institution_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_programs_slug ON public.programs(institution_id, slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_programs_degree_type ON public.programs(degree_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_programs_field ON public.programs(field_of_study) WHERE deleted_at IS NULL;
CREATE INDEX idx_programs_status ON public.programs(status) WHERE deleted_at IS NULL;

-- Full-text search
ALTER TABLE public.programs ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(field_of_study, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(specialization, '')), 'C')
    ) STORED;
CREATE INDEX idx_programs_search ON public.programs USING gin(search_vector);

CREATE UNIQUE INDEX idx_programs_unique ON public.programs(institution_id, slug) WHERE deleted_at IS NULL;
```

#### 3.2 `public.program_requirements`
```sql
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

CREATE INDEX idx_requirements_program ON public.program_requirements(program_id) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_requirements_unique ON public.program_requirements(program_id) WHERE deleted_at IS NULL;
```

#### 3.3 `public.program_cutoffs`
```sql
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

CREATE INDEX idx_cutoffs_program ON public.program_cutoffs(program_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_cutoffs_year ON public.program_cutoffs(academic_year) WHERE deleted_at IS NULL;
```

---

### 4. Application & Deadlines

#### 4.1 `public.application_windows`
```sql
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
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_windows_program ON public.application_windows(program_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_windows_institution ON public.application_windows(institution_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_windows_status ON public.application_windows(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_windows_dates ON public.application_windows(application_start_date, application_end_date) WHERE deleted_at IS NULL;

-- Constraint: must have either program_id or institution_id
ALTER TABLE public.application_windows ADD CONSTRAINT check_window_level
    CHECK ((level = 'program' AND program_id IS NOT NULL) OR (level = 'institution' AND institution_id IS NOT NULL));
```

---

### 5. Costs & Fees

#### 5.1 `public.costs`
```sql
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

CREATE INDEX idx_costs_program ON public.costs(program_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_costs_institution ON public.costs(institution_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_costs_type ON public.costs(fee_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_costs_year ON public.costs(academic_year) WHERE deleted_at IS NULL;
```

#### 5.2 `public.city_cost_of_living`
```sql
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

CREATE INDEX idx_col_city ON public.city_cost_of_living(city);
CREATE INDEX idx_col_state ON public.city_cost_of_living(state);
CREATE UNIQUE INDEX idx_col_unique ON public.city_cost_of_living(city, state);
```

---

### 6. Scholarships & Financial Aid

#### 6.1 `public.scholarships`
```sql
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

CREATE INDEX idx_scholarships_institution ON public.scholarships(institution_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_scholarships_active ON public.scholarships(is_active) WHERE deleted_at IS NULL;
```

---

### 7. Career Insights

#### 7.1 `public.career_insights`
```sql
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

CREATE INDEX idx_insights_program ON public.career_insights(program_id);
CREATE INDEX idx_insights_field ON public.career_insights(field_of_study);
```

---

### 8. Alerts & Notifications

#### 8.1 `public.user_alerts`
```sql
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

CREATE INDEX idx_alerts_user ON public.user_alerts(user_id) WHERE is_active = TRUE;
```

#### 8.2 `public.notifications`
```sql
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

CREATE INDEX idx_notifications_user ON public.notifications(user_id, read);
CREATE INDEX idx_notifications_date ON public.notifications(created_at DESC);
```

---

### 9. AI & Premium Features

#### 9.1 `public.ai_conversations`
```sql
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

CREATE INDEX idx_conversations_user ON public.ai_conversations(user_id);
```

#### 9.2 `public.ai_messages`
```sql
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

CREATE INDEX idx_messages_conversation ON public.ai_messages(conversation_id, created_at);
```

#### 9.3 `public.ai_recommendations`
```sql
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

CREATE INDEX idx_recommendations_user ON public.ai_recommendations(user_id);
```

---

### 10. Payments & Subscriptions

#### 10.1 `public.transactions`
```sql
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

CREATE INDEX idx_transactions_user ON public.transactions(user_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_transactions_reference ON public.transactions(paystack_reference);
```

---

### 11. Admin & Content Management

#### 11.1 `public.change_log`
```sql
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

CREATE INDEX idx_changelog_entity ON public.change_log(entity_type, entity_id);
CREATE INDEX idx_changelog_status ON public.change_log(review_status) WHERE review_status = 'pending';
CREATE INDEX idx_changelog_date ON public.change_log(created_at DESC);
```

---

### 12. Staging Tables

#### 12.1 `staging.institutions`
```sql
CREATE SCHEMA IF NOT EXISTS staging;

CREATE TABLE staging.institutions (
    LIKE public.institutions INCLUDING ALL
);
-- Repeat for all main tables
CREATE TABLE staging.programs (LIKE public.programs INCLUDING ALL);
CREATE TABLE staging.costs (LIKE public.costs INCLUDING ALL);
CREATE TABLE staging.application_windows (LIKE public.application_windows INCLUDING ALL);
```

---

## Row Level Security (RLS) Policies

### Enable RLS on all tables
```sql
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
-- ... (enable for all tables)
```

### Public Read Policies (Anonymous users)
```sql
-- Anyone can read published institutions
CREATE POLICY "Public read published institutions"
ON public.institutions FOR SELECT
TO public
USING (status = 'published' AND deleted_at IS NULL);

-- Anyone can read published programs
CREATE POLICY "Public read published programs"
ON public.programs FOR SELECT
TO public
USING (status = 'published' AND deleted_at IS NULL);
```

### User Policies (Authenticated students)
```sql
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

-- Premium users can read AI conversations
CREATE POLICY "Premium users can read AI"
ON public.ai_conversations FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id AND
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND subscription_status = 'active'
    )
);
```

### Admin Policies
```sql
-- Internal admins can read/write everything
CREATE POLICY "Admins can manage all data"
ON public.institutions
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'internal_admin'
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
```

---

## Database Functions & Triggers

### Auto-update timestamp
```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER update_institutions_updated_at
BEFORE UPDATE ON public.institutions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Repeat for all tables with updated_at
```

### Log changes to change_log
```sql
CREATE OR REPLACE FUNCTION public.log_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.change_log (entity_type, entity_id, action, changes, created_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'update', to_jsonb(NEW), auth.uid());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_institution_changes
AFTER UPDATE ON public.institutions
FOR EACH ROW EXECUTE FUNCTION public.log_change();
```

### Update application window status
```sql
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
```

---

## Materialized Views

### Top institutions by popularity
```sql
CREATE MATERIALIZED VIEW public.mv_popular_institutions AS
SELECT
    i.id,
    i.name,
    i.type,
    i.state,
    COUNT(DISTINCT ub.user_id) AS bookmark_count,
    COUNT(DISTINCT p.id) AS program_count,
    AVG(p.annual_intake) AS avg_intake
FROM public.institutions i
LEFT JOIN public.user_bookmarks ub ON i.id = ub.entity_id AND ub.entity_type = 'institution'
LEFT JOIN public.programs p ON i.id = p.institution_id
WHERE i.status = 'published' AND i.deleted_at IS NULL
GROUP BY i.id
ORDER BY bookmark_count DESC;

CREATE UNIQUE INDEX ON public.mv_popular_institutions(id);

-- Refresh nightly
REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_popular_institutions;
```

---

## Indexes Summary

**Critical Indexes:**
- Full-text search (GIN indexes on tsvector)
- Foreign keys (automatic)
- Frequently filtered columns (state, type, status, dates)
- Unique constraints (slug, email, etc.)
- Geospatial indexes (for location queries)

**Performance Monitoring:**
```sql
-- Find missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public'
AND tablename IN ('institutions', 'programs')
ORDER BY abs(correlation) DESC;
```

---

## Backup & Restore

**Daily Backups:** Supabase automatic (built-in)
**Point-in-Time Recovery:** Supabase Pro plan (7 days)

**Manual Export:**
```bash
pg_dump -h db.your_project.supabase.co -U postgres -d postgres > backup.sql
```

---

## Migration Strategy

**Tools:** Supabase CLI + SQL migrations

```bash
# Create migration
supabase migration new create_institutions_table

# Apply migrations
supabase db push

# Rollback
supabase db reset
```

---

## Next Steps
1. Review schema with stakeholders
2. Create seed data for testing
3. Implement RLS policies
4. Set up database migrations
5. Create database documentation
