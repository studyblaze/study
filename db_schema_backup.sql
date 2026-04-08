-- GroupTutors Database Schema Snapshot (Critical Tables)
-- Generated on: 2026-03-22

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    first_name TEXT,
    last_name TEXT,
    role TEXT DEFAULT 'student',
    avatar_url TEXT,
    country TEXT,
    city TEXT,
    region TEXT,
    isp TEXT,
    timezone TEXT DEFAULT 'UTC',
    currency TEXT DEFAULT 'INR',
    currency_symbol TEXT DEFAULT '₹',
    last_login TIMESTAMPTZ,
    last_ip TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    referral_code TEXT UNIQUE,
    referred_by_code TEXT
);

-- 2. Tutors Table
CREATE TABLE IF NOT EXISTS public.tutors (
    id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    hourly_rate NUMERIC,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    status TEXT DEFAULT 'pending',
    living_country TEXT,
    teaching_style TEXT,
    qualifications TEXT,
    experience_years INTEGER,
    subjects JSONB DEFAULT '[]',
    languages JSONB DEFAULT '[]',
    social_links JSONB DEFAULT '{}',
    is_visible BOOLEAN DEFAULT FALSE,
    rejection_reason TEXT,
    restriction_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Auth Logs Table
CREATE TABLE IF NOT EXISTS public.auth_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL, -- 'LOGIN', 'LOGOUT', 'SIGNUP'
    ip_address TEXT,
    country TEXT,
    city TEXT,
    region TEXT,
    isp TEXT,
    timezone TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Admin Activity Table
CREATE TABLE IF NOT EXISTS public.admin_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL, -- 'approve_tutor', 'reject_tutor', 'revert_tutor', etc.
    target_id TEXT,
    target_name TEXT,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies (Summary)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity ENABLE ROW LEVEL SECURITY;

-- Note: This is a partial snapshot. For a full production-ready backup, 
-- please use the Supabase Dashboard export tools as described in BACKUP.md.
